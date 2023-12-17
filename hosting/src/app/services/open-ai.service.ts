import { Injectable, inject } from '@angular/core';
import OpenAI from 'openai';
import { SecretsStoreService } from './secrets-store.service';
import axios, { AxiosInstance } from 'axios';
import { ModelParamsService } from './model-params.service';

@Injectable({
  providedIn: 'root',
})
export class OpenAiService {
    private instance?: AxiosInstance;
    private secretStoreService = inject(SecretsStoreService);
    private modelParamsService = inject(ModelParamsService);

    isAvailable() {
      try {
        const apiKey = this.secretStoreService.getSecret('openAiApiKey');
        if (!apiKey) {
            throw new Error('No OpenAI API key found');
        }
        return true;
      }
      catch {
        return false;
      }
    }

    async init() {
        if(this.instance) return;
        const apiKey = await this.secretStoreService.getSecret('openAiApiKey');
        if (!apiKey) {
            throw new Error('No OpenAI API key found');
        }
        this.instance = axios.create({
            baseURL: 'https://api.openai.com/v1',
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
        });
    }

    async chat(model: string, messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]) {
      await this.init()
      const response = await this.instance?.post('chat/completions',{
        messages: messages,
        model: model,
        temperature: this.modelParamsService.temperature,
      })

      const data = response?.data as OpenAI.Chat.Completions.ChatCompletion;

      return data.choices[0].message;
    }
}
