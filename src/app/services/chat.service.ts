import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { v4 } from 'uuid';
import { ChatServiceBase } from './chat-service-base';
import {
  ChatMessage,
  ChatMessageGroup,
  MessageSource,
} from '../types/message.types';
import { ToastService } from './toast.service';
import { Chat } from '../models/chat';
import { ChatUtilsService } from './chat-utils.service';
import { ChatsDbService } from './chats-db.service';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private chatServices$ = new BehaviorSubject(
    new Map<string, ChatServiceBase>()
  );
  private toastService = inject(ToastService);
  private chatUtilsService = inject(ChatUtilsService);
  private chatsDbService = inject(ChatsDbService);

  readonly chatId$ = this.chatUtilsService.chatId$;
  readonly activeChat$ = this.chatUtilsService.activeChat$;
  readonly messageGroups$ = this.chatUtilsService.activeMessageGroups$;
  readonly hasPrimary$ = this.chatUtilsService.activeChatHasPrimary$;
  readonly chat$ = this.chatUtilsService.activeChat$;

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

  async getHistory(chat: Chat) {
    return chat?.getPrimaryTree() ?? [];
  }

  async regenerateLastMessage(chat: Chat) {
    const groups = chat.groups;
    if(groups.length < 2) return;
    const message = groups[groups.length - 2].messageBySource[MessageSource.User]?.text;
    this.chatUtilsService.removeLast2Groups(chat);
    return this.message(chat, message ?? '');
  }

  async message(chat: Chat, content: string) {
    const hasPrimary = this.chatUtilsService.hasPrimary(chat);

    if (!hasPrimary) {
      return;
    }

    this.isLoading$.next(true);
    this.waitingForFirstResponse$.next(true);

    try {
      const primary = await this.getHistory(chat).then((h) => h.pop());
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

      chat = this.chatUtilsService.addMessage(chat, userMessage);

      const newGroup: ChatMessageGroup = {
        id: v4(),
        sourceType: MessageSource.Bot,
        messageBySource: enabledServices.reduce((acc, cs) => {
          acc[cs.modelName] = undefined;
          return acc;
        }, {} as Record<string, ChatMessage | undefined>),
      };

      chat = this.chatUtilsService.addGroup(chat, newGroup);

      const promises = enabledServices.map((s) =>
        s.sendMessage(chat).then((m) => {
          if (m) {
            chat = this.chatUtilsService.addMessage(chat, m, newGroup.id);
          }
          return m;
        })
      );
      await Promise.any(promises);
      this.waitingForFirstResponse$.next(false);
      const messages = await Promise.all(promises);

      const newMessage = messages[0];
      if (enabledServices.length === 1 && newMessage) {
        chat = await this.chatUtilsService.setMessageAsPrimary(chat, newMessage.id);
      }
    } finally {
      this.isLoading$.next(false);
      if (this.waitingForFirstResponse$.value) {
        this.waitingForFirstResponse$.next(false);
      }

      await this.checkTitle(chat);
    }
  }

  async checkTitle(chat: Chat, force = false) {
    if (!chat) return;
    if (force || chat.title === new Chat().title) {
      const title = await this.createTitle(chat);
      if (title) {
        this.chatUtilsService.updateTitle(chat, title);
      }
    }
  }

  async createTitle(chat: Chat): Promise<string | undefined> {
    const enabledServices = [...this.chatServices$.value.values()].filter(
      (cs) => cs.enabled
    );
    for (const service of enabledServices) {
      const title = await service.createTitle(chat);
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

  async branchOutChat(chat: Chat, fromMessageId: string) {
    const newChat: Chat = chat.branchOut(fromMessageId);
    this.allChats$.value.set(newChat.id, newChat);
    this.allChats$.next(new Map(this.allChats$.value));
    this.chatUtilsService.setActiveChatById(newChat.id);
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
