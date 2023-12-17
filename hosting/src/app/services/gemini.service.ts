import { Injectable, inject } from '@angular/core';
import { ChatSession, GenerateContentResult, GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai'
import { ChatService } from './chat.service';
import { SecretsStoreService } from './secrets-store.service';
import { v4 } from 'uuid';
import { ChatServiceBase } from './chat-service-base';
import { ModelParamsService } from './model-params.service';
import { ChatMessage, MessageSource } from './message.types';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class GeminiService implements ChatServiceBase {
  private instance?: GoogleGenerativeAI;
  private model?: GenerativeModel;
  private chatInstance?: ChatSession;

  private chatService = inject(ChatService);
  private secretStoreService = inject(SecretsStoreService);
  private paramsService = inject(ModelParamsService);
  private toastsService = inject(ToastService);


  constructor() {
    this.chatService.registerChatService(this);
  }

  get enabled() {
    return this.paramsService.enabledModels.includes(this.modelName);
  }

  set enabled(value: boolean) {
    const enabledModels = this.paramsService.enabledModels;
    if (value) {
      enabledModels.push(this.modelName);
    }
    else {
      const index = enabledModels.indexOf(this.modelName);
      if (index > -1) {
        enabledModels.splice(index, 1);
      }
    }
    this.paramsService.enabledModels = enabledModels;
  }

  readonly modelName = 'Gemini';


  isAvailable() {
    try {
      const apiKey = this.secretStoreService.getSecret('geminiApiKey');
      if (!apiKey) {
        throw new Error('No Gemini API key found');
      }
      return true;
    }
    catch {
      return false;
    }
  }



  async init() {
    if(this.instance) return;
    const apiKey = await this.secretStoreService.getSecret('geminiApiKey');
    if (!apiKey) {
      throw new Error('No Gemini API key found');
    }
    this.instance = new GoogleGenerativeAI(apiKey);

    this.model = this.instance.getGenerativeModel({
      model: 'gemini-pro',
    });
  }

  async startChat() {
    if(this.enabled) {
      await this.init();
    }
    const history = (await this.chatService.getHistory())?.slice(0, -1);

    this.chatInstance = this.model?.startChat({
      history: history?.map(message => ({
        role: message.source === 'user' ? 'user' : 'model',
        parts: message.text,
      })),
      generationConfig: {
        temperature: this.paramsService.temperature,
      }
    });
  }


  async sendMessage() {
    if(!this.chatInstance || !this.enabled) {
      await this.startChat();
    }

    const message = (await this.chatService.getHistory())?.pop();

    if(!message) return;

    let response: GenerateContentResult | undefined;
    try {
      response = await this.chatInstance?.sendMessage(message.text);
    }
    catch (error: any) {
      console.error(error);
      this.toastsService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error communicating with Gemini API' + error.message,
      })
      return;
    }
    if(!response) return;

    const chatMessage: ChatMessage = {
      id: v4(),
      text: response.response.text(),
      source: MessageSource.Bot,
      sourceName: this.modelName,
      parentMessageId: message.id,
    };

    this.chatService.addMessage(chatMessage);
  }

}
