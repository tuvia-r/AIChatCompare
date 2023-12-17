import { Injectable, inject } from '@angular/core';
import { ChatServiceBase } from './chat-service-base';
import { ChatService } from './chat.service';
import { OpenAiService } from './open-ai.service';
import { v4 } from 'uuid';
import OpenAI from 'openai';
import { ModelParamsService } from './model-params.service';
import { ChatMessage, MessageSource } from './message.types';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class GptThreeService implements ChatServiceBase {
  private chatService = inject(ChatService);
  private openAiService = inject(OpenAiService);
  private toastsService = inject(ToastService);

  private paramsService = inject(ModelParamsService);

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

  readonly modelName = 'GPT 3.5';

  private readonly openAiModelName = 'gpt-3.5-turbo';

  isAvailable() {
    return this.openAiService.isAvailable();
  }

  async init() {
    await this.openAiService.init();
  }

  async startChat() {}

  async sendMessage() {

    if(!this.enabled) return;

    const history = (await this.chatService.getHistory()) ?? [];
    const message = history[history.length - 1];

    const openAiMessages = history?.map((message) => ({
      role: message.source === 'user' ? 'user' : 'assistant',
      content: message.text,
    })) as OpenAI.Chat.Completions.ChatCompletionMessageParam[];

    let response: OpenAI.Chat.Completions.ChatCompletionMessage;

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

    const chatMessage: ChatMessage = {
      id: v4(),
      text: response.content ?? '',
      source: MessageSource.Bot,
      sourceName: this.modelName,
      parentMessageId: message.id,
    };

    this.chatService.addMessage(chatMessage);
  }
}
