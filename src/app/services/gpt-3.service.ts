import { Injectable, inject } from '@angular/core';
import { ChatServiceBase, TITLE_PROMPT } from './chat-service-base';
import { ChatService } from './chat.service';
import { OpenAiResponse, OpenAiService } from './open-ai.service';
import { v4 } from 'uuid';
import OpenAI from 'openai';
import { ModelParamsService } from './model-params.service';
import { ChatMessage, MessageSource } from '../types/message.types';
import { ToastService } from './toast.service';
import { Chat } from '../models/chat';

@Injectable({
  providedIn: 'root',
})
export class GptThreeService extends ChatServiceBase {
  private openAiService = inject(OpenAiService);
  private toastsService = inject(ToastService);

  readonly modelName = 'GPT 3.5';
  readonly link = 'https://openai.com/blog/gpt-3-apps';

  private readonly openAiModelName = 'gpt-3.5-turbo';

  constructor(
    chatService: ChatService,
    paramsService: ModelParamsService
  ) {
    super(chatService, paramsService);
    this.register();
  }

  isAvailable() {
    return this.openAiService.isAvailable();
  }

  async init() {
    await this.openAiService.init();
  }

  async startChat() {}

  async sendMessage(chat: Chat) {

    if(!this.enabled) return;

    const history = (await this.chatService.getHistory(chat)) ?? [];
    const message = history[history.length - 1];

    const openAiMessages = history?.map((message) => ({
      role: message.source === 'user' ? 'user' : 'assistant',
      content: message.text,
    })) as OpenAI.Chat.Completions.ChatCompletionMessageParam[];

    let response: OpenAiResponse;

    try {
      response = await this.openAiService.chat(
        this.openAiModelName,
        openAiMessages
      );
    }
    catch (error: any) {
      console.error(error);
      const message = error?.response?.data?.error ?? error.message;
      this.toastsService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error communicating with OpenAI API' + message,
      })
      return {
        id: v4(),
        text: '',
        error: message,
        source: MessageSource.Bot,
        sourceName: this.modelName,
        parentMessageId: message.id,
      }
    }

    const chatMessage: ChatMessage = {
      id: v4(),
      text: response.message.content ?? '',
      source: MessageSource.Bot,
      sourceName: this.modelName,
      parentMessageId: message.id,
      inputTokens: response?.inputTokens,
      outputTokens: response?.outputTokens,
    };

    return chatMessage;
  }

  override async createTitle(chat: Chat): Promise<string | undefined> {
    if(!this.enabled) return;

    const history = (await this.chatService.getHistory(chat)) ?? [];
    const message = history[history.length - 1];

    const openAiMessages = history?.map((message) => ({
      role: message.source === 'user' ? 'user' : 'assistant',
      content: message.text,
    })) as OpenAI.Chat.Completions.ChatCompletionMessageParam[];

    openAiMessages.push({
      role: 'user',
      content: TITLE_PROMPT,
    });

    let response: OpenAiResponse;

    try {
      response = await this.openAiService.chat(
        this.openAiModelName,
        openAiMessages
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

    return response.message.content ?? '';
  }
}
