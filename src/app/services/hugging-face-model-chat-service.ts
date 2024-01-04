import { inject } from "@angular/core";
import { ChatServiceBase, TITLE_PROMPT } from "./chat-service-base";
import { ToastService } from "./toast.service";
import { ChatMessage, HuggingFaceChatMessage, HuggingFaceModel, MessageSource } from "../types";
import { v4 } from "uuid";
import { ChatService } from "./chat.service";
import { ModelParamsService } from "./model-params.service";
import { SecretsStoreService } from "./secrets-store.service";

export class HuggingFaceModelChatService extends ChatServiceBase {


  constructor(
    chatService: ChatService,
    paramsService: ModelParamsService,
    private readonly secretStoreService: SecretsStoreService,
    private toastsService: ToastService,
    readonly modelName: string,
    readonly huggingFaceModel: HuggingFaceModel,
    readonly chatFunction: (model: HuggingFaceModel, messages: HuggingFaceChatMessage[]) => Promise<{text: string, warnings?: string[], error?: string}>
  ) {
    super(chatService, paramsService);
  }

  isAvailable() {
    try {
      const apiKey = this.secretStoreService.getSecret('huggingFaceApiKey');
      if (!apiKey) {
        throw new Error('No Hugging Face API key found');
      }
      return true;
    }
    catch {
      return false;
    }
  }

  get link() {
    return `https://huggingface.co${this.huggingFaceModel.path}`;
  }

  async init() {
    return;
  }

  async startChat() {
    return;
  }

  async sendMessage() {
    const history = (await this.chatService.getHistory()) ?? [];
    const messages = history.map((message) => ({
      role: message.source === 'user' ? 'user' : 'bot',
      content: message.text,
    })) as HuggingFaceChatMessage[];

    let response: {text: string, warnings?: string[], error?: string};

    try {
      response = await this.chatFunction(
        this.huggingFaceModel,
        messages
      );
    }
    catch (error: any) {
      console.error(error);
      this.toastsService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error communicating with OpenAI API' + error.message,
      })
      return;
    }

    const chatMessage: ChatMessage = {
      id: v4(),
      text: response.text,
      warnings: response.warnings,
      error: response.error,
      source: MessageSource.Bot,
      sourceName: this.modelName,
      parentMessageId: history[history.length - 1].id,
    };

    return chatMessage;
  }

  async createTitle() {
    const history = (await this.chatService.getHistory()) ?? [];
    const messages = history.map((message) => ({
      role: message.source === 'user' ? 'user' : 'bot',
      content: message.text,
    })) as HuggingFaceChatMessage[];

    messages.push({
      role: 'user',
      content: 'what should be this title of the conversation?',
    });

    let response: {text: string, warnings?: string[], error?: string};

    try {
      response = await this.chatFunction(
        this.huggingFaceModel,
        messages
      );
    }
    catch (error: any) {
      console.error(error);
      const responseReason = error.response?.data?.error ?? error.message;
      this.toastsService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error communicating with Hugging Face' + responseReason,
        life: 10000,
      })
      return;
    }


    if(response.warnings?.length) {
      this.toastsService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: response.warnings.join('\n'),
        life: 10000,
      })
    }

    return JSON.stringify({title: response.text});
  }
}
