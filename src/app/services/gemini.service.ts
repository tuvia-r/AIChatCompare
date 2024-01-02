import { Injectable, inject } from '@angular/core';
import { ChatSession, GenerateContentResult, GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai'
import { ChatService } from './chat.service';
import { SecretsStoreService } from './secrets-store.service';
import { v4 } from 'uuid';
import { ChatServiceBase, TITLE_PROMPT } from './chat-service-base';
import { ModelParamsService } from './model-params.service';
import { ChatMessage, MessageSource } from '../types/message.types';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class GeminiService extends ChatServiceBase {
  private instance?: GoogleGenerativeAI;
  private model?: GenerativeModel;
  private chatInstance?: ChatSession;

  private secretStoreService = inject(SecretsStoreService);
  private toastsService = inject(ToastService);

  readonly modelName = 'Gemini';


  constructor() {
    super();
    this.register();
  }


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

  async startChat(noHistory = false) {
    if(this.enabled) {
      await this.init();
    }

    let history = (await this.chatService.getHistory()).slice(0, -1);
    if(!noHistory) {
      history = []
    }

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
    if(!this.enabled) {
      return;
    }
    await this.startChat();

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

    return chatMessage;
  }


  async createTitle() {
    if(!this.enabled) {
      return;
    }
    await this.startChat(true);

    let response: GenerateContentResult | undefined;
    try {
      response = await this.chatInstance?.sendMessage(
        `
        here is a start of a conversation:
        '''
        ${(await this.chatService.getHistory()).map(message => message.text).join('\n')}
        '''

        ${TITLE_PROMPT}
        `);
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

    return response?.response.text() ?? '';
  }

}
