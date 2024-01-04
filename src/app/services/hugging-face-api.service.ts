import { Injectable, inject } from '@angular/core';
import { SecretsStoreService } from './secrets-store.service';
import { ModelParamsService } from './model-params.service';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  HuggingFaceModelChatService,
} from './hugging-face-model-chat-service';
import { ChatService } from './chat.service';
import { ToastService } from './toast.service';
import { staticModels } from './static-models';
import { HuggingFaceChatMessage, HuggingFaceModel, HuggingFaceModelStatus, HuggingFaceRequest, HuggingFaceResponse } from '../types';


const gptFormatter = (messages: HuggingFaceChatMessage[]) => {
  return (
    messages
      .map(
        (message) =>
          `${
            message.role === 'bot'
              ? 'GPT4 Correct Assistant: '
              : 'GPT4 Correct User: '
          }` + message.content
      )
      .join('<|end_of_turn|>') + '<|end_of_turn|> GPT4 Correct Assistant:'
  );
};

const isGpt = (model: any) => {
  return (
    model.tags.includes('gpt') ||
    model.tags.includes('gpt2') ||
    model.tags.includes('gpt3') ||
    model.tags.includes('gpt5')
  );
};

@Injectable({
  providedIn: 'root',
})
export class HuggingFaceApiService {
  private instance?: AxiosInstance;
  private apiInstance?: AxiosInstance;
  private statusApiInstance?: AxiosInstance;
  private secretStoreService = inject(SecretsStoreService);
  private modelParamsService = inject(ModelParamsService);
  private chatService = inject(ChatService);
  private toastService = inject(ToastService);
  private models: HuggingFaceModel[] = [];

  async getModels(
    page: number = 0,
    type: 'conversational' | 'text-generation' = 'conversational',
    search: string = ''
  ) {
    const res = await this.apiInstance?.get(
      `?sort=likes&direction=-1&page=${page}&limit=50&filter=${type},endpoints_compatible,transformers&search=${search}`
    );
    return Promise.all(
      res?.data.map(
        async (model: any) =>
          ({
            name: model.modelId,
            path: `/${model.modelId}`,
            type: model.pipeline_tag,
            formatter: isGpt(model) ? gptFormatter : undefined,
            status: await this.getStatus(model.modelId).catch(() => undefined),
          } as HuggingFaceModel)
      )
    );
  }

  async getStatus(modelId: string) {
    const res = await this.statusApiInstance?.get(`/${modelId}`);
    return res?.data as HuggingFaceModelStatus;
  }

  async searchModels(search: string) {
    await this.init();
    const conversational = await this.getModels(0, 'conversational', search);
    const textGeneration = await this.getModels(0, 'text-generation', search);
    const result = [...conversational, ...textGeneration].filter(
      (model) => model.status?.state === 'Loadable'
    );
    this.registerModels(result);
  }

  async getChatTemplateFunction(model: HuggingFaceModel) {
    if (model.formatter) {
      return model.formatter;
    }
    const tokenizerConfigFilePath = `https://huggingface.co${model.path}/raw/main/tokenizer_config.json`;
    const tokenizerConfig = await axios
      .get(tokenizerConfigFilePath)
      .catch(() => undefined);
    if (tokenizerConfig) {
      return (messages: HuggingFaceChatMessage[]) =>
        messages.map((message) => message.content).join('\n') +
        '\n' +
        tokenizerConfig?.data.eos_token;
    }

    return (messages: HuggingFaceChatMessage[]) =>
      messages.map((message) => message.content).join('\n');
  }

  constructor() {
    this.initModels();
  }

  async initModels() {
    this.registerModels(staticModels);
  }

  async registerModels(models: HuggingFaceModel[]) {
    this.models.push(...models);
    models.forEach((model) => {
      const service = new HuggingFaceModelChatService(
        this.chatService,
        this.modelParamsService,
        this.secretStoreService,
        this.toastService,
        model.name,
        model,
        this.chat.bind(this)
      );
      this.chatService.registerChatService(model.name, service);
    });
  }

  isAvailable() {
    try {
      const apiKey = this.secretStoreService.getSecret('huggingFaceApiKey');
      if (!apiKey) {
        throw new Error('No Hugging Face API key found');
      }
      return true;
    } catch {
      return false;
    }
  }

  async init() {
    if (this.instance) return;
    const apiKey = await this.secretStoreService.getSecret('huggingFaceApiKey');
    if (!apiKey) {
      throw new Error('No Hugging Face API key found');
    }
    this.instance = axios.create({
      baseURL: 'https://api-inference.huggingface.co/models',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    this.apiInstance = axios.create({
      baseURL: 'https://huggingface.co/api/models',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    this.statusApiInstance = axios.create({
      baseURL: 'https://api-inference.huggingface.co/status',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
  }

  async chat(
    model: HuggingFaceModel,
    messages: HuggingFaceChatMessage[]
  ): Promise<{ text: string; warnings?: string[], error?: string }> {
    await this.init();
    const currentMessage = messages[messages.length - 1];

    let input: any;

    if (model.type === 'conversational') {
      input = messages.reduce(
        (acc, message) => {
          if (message.role === 'user') {
            acc.past_user_inputs.push(message.content);
          } else {
            acc.generated_responses.push(message.content);
          }
          return acc;
        },
        {
          past_user_inputs: [],
          generated_responses: [],
          text: currentMessage?.content ?? '',
        } as HuggingFaceRequest['inputs']
      );
    } else {
      const formatter = await this.getChatTemplateFunction(model);
      input = formatter(messages);
    }

    let response: AxiosResponse<any, any> | undefined = undefined;

    try {
      response = await retry(() =>
        this.instance?.post(model.path, {
          temperature: this.modelParamsService.temperature,
          return_full_text: false,
          wait_for_model: true,
          inputs: input,
        } as HuggingFaceRequest)
      );
    }
    catch (error: any) {
      if(error?.response?.data?.error) {
        return {
          text: '',
          warnings: [],
          error: error?.response?.data?.error
        }
      }
      throw error;
    }

    const data = response?.data as HuggingFaceResponse;
    const result = Array.isArray(data) ? data[0] : data;
    let text = Array.isArray(data)
      ? data[0].generated_text
      : data.generated_text;

    if (typeof input === 'string') {
      text = text.replace(input, '');
    }

    if (model.responseFormatter) {
      text = model.responseFormatter(text);
    }

    return { text, warnings: result.warnings };
  }
}

const retry = async <T>(fn: () => Promise<T> | undefined, retries = 3): Promise<T | undefined> => {
  try {
    return await fn();
  } catch (error: any) {
    if(/is currently loading/.test(error?.response?.data.error)) {
      const waitTime = (error?.response?.data.estimated_time * 1000 ?? 10 * 1000) / 2;
      console.log(`Waiting ${waitTime}ms for model to load`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return await retry(fn, retries - 1);
    }
    throw error;
  }
};
