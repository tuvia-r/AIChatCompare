import { Injectable, inject } from '@angular/core';
import { ChatSession, GenerateContentResult, GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai'
import { ChatService } from './chat.service';
import { SecretsStoreService } from './secrets-store.service';
import { v4 } from 'uuid';
import { ChatServiceBase, TITLE_PROMPT } from './chat-service-base';
import { ModelParamsService } from './model-params.service';
import { ChatMessage, MessageSource } from '../types/message.types';
import { ToastService } from './toast.service';
import { Chat } from '../models/chat';

@Injectable({
  providedIn: 'root',
})
export class GeminiService extends ChatServiceBase {
  private instance?: GoogleGenerativeAI;
  private model?: GenerativeModel;
  private chatInstance?: ChatSession;

  private secretStoreService = inject(SecretsStoreService);
  private toastsService = inject(ToastService);

  readonly modelName = 'Gemini Pro';

  readonly link = 'https://deepmind.google/technologies/gemini/#introduction';

  constructor(
    chatService: ChatService,
    paramsService: ModelParamsService
  ) {
    super(chatService, paramsService);
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

  async startChat(chat: Chat, noHistory = false) {
    if(this.enabled) {
      await this.init();
    }

    let history = (await this.chatService.getHistory(chat)).slice(0, -1);
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


  async sendMessage(chat: Chat) {
    if(!this.enabled) {
      return;
    }
    await this.startChat(chat);

    const message = (await this.chatService.getHistory(chat))?.pop();

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
      return {
        id: v4(),
        text: '',
        source: MessageSource.Bot,
        error: error.message,
        sourceName: this.modelName,
        parentMessageId: message.id,
      }
    }

    const chatMessage: ChatMessage = {
      id: v4(),
      text: response?.response.text()!,
      source: MessageSource.Bot,
      sourceName: this.modelName,
      parentMessageId: message.id,
    };

    return chatMessage;
  }


  async createTitle(chat: Chat) {
    if(!this.enabled) {
      return;
    }
    await this.startChat(chat, true);

    let response: GenerateContentResult | undefined;
    try {
      response = await this.chatInstance?.sendMessage(
        `
        here is a start of a conversation:
        '''
        ${(await this.chatService.getHistory(chat)).map(message => message.text).join('\n')}
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
