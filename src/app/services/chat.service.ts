import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { getObservableValue } from '../utils/get-observable-value';
import { v4 } from 'uuid';
import { LocalDbService } from './local-db.service';
import { ChatServiceBase } from './chat-service-base';
import {
  ChatMessage,
  ChatMessageGroup,
  MessageSource,
} from '../types/message.types';
import { ToastService } from './toast.service';
import { Chat } from '../models/chat';
import { clone } from 'lodash';
import { ActiveChatService } from './active-chat.service';

let numberOfServices = 0;

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private localDbService = inject(LocalDbService);
  private chatServices = new Map<string, ChatServiceBase>();
  private toastService = inject(ToastService);
  private activeChatService = inject(ActiveChatService);

  readonly chatId$ = this.activeChatService.activeChat$.pipe(
    map((chat) => chat.id)
  );
  readonly messageGroups$ = this.activeChatService.activeChat$.pipe(
    map((chat) => chat.groups)
  );
  readonly test = new BehaviorSubject<string>('');


  readonly allChats$ = new BehaviorSubject<Map<string, Chat>>(new Map<string, Chat>());

  readonly chat$ = this.activeChatService.activeChat$;

  readonly hasPrimary$ = this.messageGroups$.pipe(
    map((messageGroups) => {
      const relevantGroup = [...messageGroups].pop();
      if (!relevantGroup || relevantGroup.sourceType === MessageSource.User)
        return true;
      const hasPrimary = Object.values(relevantGroup.messageBySource).some(
        (m) => m?.isPrimary
      );
      return !!hasPrimary;
    })
  );
  readonly isLoading$ = new BehaviorSubject<boolean>(false);
  readonly waitingForFirstResponse$ = new BehaviorSubject<boolean>(false);

  constructor() {

    this.loadMessages();

    this.messageGroups$.subscribe((chat) => {
      this.saveMessages();
    });

    console.log('Number of services', numberOfServices);
  }

  registerChatService(name: string, chatService: ChatServiceBase) {
    this.chatServices.set(chatService.modelName, chatService);
  }

  async addGroup(group: ChatMessageGroup) {
    this.chat$.value.addGroup(group);
    this.chat$.next(this.chat$.value.clone());
  }

  async addMessage(message: ChatMessage, groupId?: string) {
    this.chat$.value.addMessage(message, groupId);
    this.chat$.next(this.chat$.value.clone());
  }

  async saveMessages() {
    const chat = this.chat$.value;
    if(chat) {
      this.allChats$.value.set(chat.id, chat);
      this.allChats$.next(new Map(this.allChats$.value));
    }
    const allChats = new Map(this.allChats$.value);

    for (const chat of allChats.values()) {
      if (chat.groups.length === 0) {
        allChats.delete(chat.id);
      }
    }

    this.localDbService.set(`chats`, Array.from(allChats.values()));
  }

  loadMessages() {
    const currentChatId = this.chat$.value.id;
    try {
      const chats = this.localDbService.get<Chat[]>(`chats`)?.map(c => Chat.fromJson(c));
      if (!chats || !Array.isArray(chats)) return;
      const allChats = new Map<string, Chat>();
      for (const chat of chats) {
        allChats.set(chat.id, chat);
      }

      [...this.allChats$.value.entries()].map(([key, value]) => allChats.set(key, value));

      this.allChats$.next(allChats);

      const chat = allChats.get(currentChatId);
      if (chat) {
        this.chat$.next(chat);
      }
    }
    catch (error: any) {
      this.saveMessages();
    }
  }

  newChat() {
    this.chat$.next(new Chat());
  }

  goToChat(chatId: string) {
    this.loadMessages();
    const chat = this.allChats$.value.get(chatId);
    if (chat) {
      this.chat$.next(chat);
    }
  }

  deleteChat(chatId: string) {
    this.allChats$.value.delete(chatId);
    this.allChats$.next(new Map(this.allChats$.value));
    this.localDbService.set(
      `chats`,
      Array.from(this.allChats$.value.entries())
    );
    if (this.chat$.value.id === chatId) {
      this.newChat();
    }
  }

  async getHistory() {
    const chat = this.chat$.value;
    return chat?.getPrimaryTree() ?? [];
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

      const enabledServices = [...this.chatServices.values()].filter(
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

      await this.addMessage(userMessage);

      const newGroup: ChatMessageGroup = {
        id: v4(),
        sourceType: MessageSource.Bot,
        messageBySource: enabledServices.reduce((acc, cs) => {
          acc[cs.modelName] = undefined;
          return acc;
        }, {} as Record<string, ChatMessage | undefined>),
      };

      await this.addGroup(newGroup);

      const promises = enabledServices.map((s) =>
        s.sendMessage().then(async(m) => {
          if (m) {
            await this.addMessage(m, newGroup.id);
          }
          return m;
        })
      );
      await Promise.any(promises);
      this.waitingForFirstResponse$.next(false);
      const messages = await Promise.all(promises);

      const newMessage = messages[0];
      if (enabledServices.length === 1 && newMessage) {
        this.setMessageAsPrimary(newMessage.id);
      }
    } finally {
      this.isLoading$.next(false);
      if (this.waitingForFirstResponse$.value) {
        this.waitingForFirstResponse$.next(false);
      }

      if(this.chat$.value.title === new Chat().title) {
        const title = await this.createTitle();
        if(title) {
          this.chat$.value.title = title;
          this.chat$.next(this.chat$.value.clone());
        }
      }

    }
  }

  async createTitle(): Promise<string | undefined> {
    const enabledServices = [...this.chatServices.values()].filter(
      (cs) => cs.enabled
    );
    for (const service of enabledServices) {
      const title = await service.createTitle();
      if (title) {
        try {
          return parseJson(title).title;
        }
        catch(error: any) {
          continue;
        }
      }
    }

    return undefined;
  }

  async setMessageAsPrimary(messageId: string) {
    const hasPrimary = await getObservableValue(this.hasPrimary$);
    if (hasPrimary) return;

    const chat = this.chat$.value;

    for (const group of chat?.groups ?? []) {
      for (const message of Object.values(group.messageBySource)) {
        if (message?.id === messageId) {
          message.isPrimary = true;
          break;
        }
      }
    }

    this.chat$.value.groups = chat?.groups ?? [];

    this.chat$.next(this.chat$.value.clone());
  }

  async branchOutChat(fromMessageId: string) {
    const chat = this.chat$.value;
    if(!chat) return;
    const newChat: Chat = chat.branchOut(fromMessageId);
    this.allChats$.value.set(newChat.id, newChat);
    this.allChats$.next(new Map(this.allChats$.value));
    this.goToChat(newChat.id);
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
