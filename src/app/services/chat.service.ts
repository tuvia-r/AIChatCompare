import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { getObservableValue } from '../utils/get-observable-value';
import { v4 } from 'uuid';
import { ChatServiceBase } from './chat-service-base';
import {
  ChatMessage,
  ChatMessageGroup,
  MessageSource,
} from '../types/message.types';
import { ToastService } from './toast.service';
import { Chat } from '../models/chat';
import { ActiveChatService } from './active-chat.service';
import { ChatsDbService } from './chats-db.service';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private chatServices$ = new BehaviorSubject(
    new Map<string, ChatServiceBase>()
  );
  private toastService = inject(ToastService);
  private activeChatService = inject(ActiveChatService);
  private chatsDbService = inject(ChatsDbService);

  readonly chatId$ = this.activeChatService.chatId$;
  readonly messageGroups$ = this.activeChatService.messageGroups$;
  readonly hasPrimary$ = this.activeChatService.hasPrimary$;
  readonly chat$ = this.activeChatService.activeChat$;

  readonly allChats$ = this.chatsDbService.allChats$;

  readonly isLoading$ = new BehaviorSubject<boolean>(false);
  readonly waitingForFirstResponse$ = new BehaviorSubject<boolean>(false);

  readonly allChatServices$ = this.chatServices$
    .asObservable()
    .pipe(map((services) => [...services.values()]));

  registerChatService(name: string, chatService: ChatServiceBase) {
    this.chatServices$.value.set(chatService.modelName, chatService);
    this.chatServices$.next(new Map(this.chatServices$.value));
  }

  hasChatService(name: string) {
    return this.chatServices$.value.has(name);
  }

  toggleChatService(name: string) {
    const chatService = this.chatServices$.value.get(name);
    if (!chatService) return;
    chatService.enabled = !chatService.enabled;
    this.chatServices$.next(new Map(this.chatServices$.value));
  }

  setSelectedChatServices(chatServices: ChatServiceBase[]) {
    for (const service of this.chatServices$.value.values()) {
      service.enabled = false;
    }

    for (const service of chatServices) {
      service.enabled = true;
    }
  }

  async getHistory() {
    const chat = this.activeChatService.chat;
    return chat?.getPrimaryTree() ?? [];
  }

  async regenerateLastMessage() {
    const chat = this.activeChatService.chat;
    if (!chat) return;
    const groups = chat.groups;
    if(groups.length < 2) return;
    const message = groups[groups.length - 2].messageBySource[MessageSource.User]?.text;
    this.activeChatService.removeLast2Groups();
    return this.message(message ?? '');
  }

  async message(content: string) {
    const hasPrimary = await getObservableValue(this.hasPrimary$);

    if (!hasPrimary || !content) {
      throw new Error('No primary message');
    }

    this.isLoading$.next(true);
    this.waitingForFirstResponse$.next(true);

    try {
      const primary = await this.getHistory().then((h) => h.pop());
      const userMessage: ChatMessage = {
        id: v4(),
        text: content,
        source: MessageSource.User,
        sourceName: MessageSource.User,
        parentMessageId: primary?.id,
      };

      const enabledServices = [...this.chatServices$.value.values()].filter(
        (cs) => cs.enabled
      );

      if (enabledServices.length === 0) {
        this.toastService.add({
          summary: 'No chat services enabled',
          detail: 'Please enable at least one chat service in the sidebar',
          severity: 'error',
        });
        return;
      }

      this.activeChatService.addMessage(userMessage);

      const newGroup: ChatMessageGroup = {
        id: v4(),
        sourceType: MessageSource.Bot,
        messageBySource: enabledServices.reduce((acc, cs) => {
          acc[cs.modelName] = undefined;
          return acc;
        }, {} as Record<string, ChatMessage | undefined>),
      };

      this.activeChatService.addGroup(newGroup);

      const promises = enabledServices.map((s) =>
        s.sendMessage().then((m) => {
          if (m) {
            this.activeChatService.addMessage(m, newGroup.id);
          }
          return m;
        })
      );
      await Promise.any(promises);
      this.waitingForFirstResponse$.next(false);
      const messages = await Promise.all(promises);

      const newMessage = messages[0];
      if (enabledServices.length === 1 && newMessage) {
        this.activeChatService.setMessageAsPrimary(newMessage.id);
      }
    } finally {
      this.isLoading$.next(false);
      if (this.waitingForFirstResponse$.value) {
        this.waitingForFirstResponse$.next(false);
      }

      await this.checkTitle();
    }
  }

  async checkTitle() {
    let chat = this.activeChatService.chat;
    if (!chat) return;
    if (chat.title === new Chat().title) {
      const title = await this.createTitle();
      if (title) {
        this.activeChatService.updateTitle(title);
      }
    }
  }

  async createTitle(): Promise<string | undefined> {
    const enabledServices = [...this.chatServices$.value.values()].filter(
      (cs) => cs.enabled
    );
    for (const service of enabledServices) {
      const title = await service.createTitle();
      if (title) {
        try {
          return parseJson(title).title;
        } catch (error: any) {
          console.error(`Error parsing title from ${service.modelName}`, error);
          continue;
        }
      }
    }

    return undefined;
  }

  async branchOutChat(fromMessageId: string) {
    const chat = this.activeChatService.chat;
    if (!chat) return;
    const newChat: Chat = chat.branchOut(fromMessageId);
    this.allChats$.value.set(newChat.id, newChat);
    this.allChats$.next(new Map(this.allChats$.value));
    this.activeChatService.setActiveChatById(newChat.id);
  }
}

export const parseJson = (json: string) => {
  if (json.startsWith('```')) {
    json = json.split('\n').slice(1, -1).join('\n');
  }
  if (json.startsWith('`')) {
    json = json.slice(1, -1);
  }
  return JSON.parse(json);
};
