import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, lastValueFrom, map } from 'rxjs';
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
import { clone } from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private localDbService = inject(LocalDbService);
  private chatServices = new Map<string, ChatServiceBase>();
  private toastService = inject(ToastService);

  readonly messages$ = new BehaviorSubject<ChatMessage[]>([]);

  readonly messageGroups$ = this.messages$.pipe(
    map((messages) => {
      if (messages.length === 0) return [];
      const groupedMessages: Record<string, ChatMessage[]> = {};
      const groupIdsOrdered: string[] = [];
      messages.forEach((message) => {
        const parentId = message.parentMessageId;
        if (!parentId) return;
        if (!groupIdsOrdered.includes(parentId)) {
          groupIdsOrdered.push(parentId);
        }
        if (!groupedMessages[parentId]) {
          groupedMessages[parentId] = [];
        }
        groupedMessages[parentId].push(message);
      });

      return [
        {
          sourceType: MessageSource.User,
          messages: [messages[0]],
          sourceNames: [],
        },
        ...groupIdsOrdered.map((id) => ({
          sourceType: groupedMessages[id][0].source,
          messages: groupedMessages[id],
          sourceNames: groupedMessages[id]
            .map((m) => m.sourceName)
            .filter((n) => !!n)
            .sort(),
        })),
      ].filter((g) => g.messages.length > 0) as ChatMessageGroup[];
    })
  );

  readonly messageChain$ = this.messageGroups$.pipe(
    map((messageGroups) => {
      const messageChain: ChatMessage[] = [];
      for (const group of messageGroups) {
        const primary = group.messages.find(
          (m) => m.isPrimary || m.source === MessageSource.User
        );
        if (primary) {
          messageChain.push(primary);
        }
      }
      return messageChain;
    })
  );

  readonly hasPrimary$ = this.messageGroups$.pipe(
    map((messageGroups) => {
      for (const group of messageGroups) {
        const primary = group.messages.find(
          (m) => m.isPrimary || m.source === MessageSource.User
        );
        if (!primary) {
          return false;
        }
      }
      return true;
    })
  );

  readonly chatId$ = new BehaviorSubject<string>(v4());

  readonly allChats$ = new BehaviorSubject<Map<string, ChatMessage[]>>(
    new Map()
  );

  readonly isLoading$ = new BehaviorSubject<boolean>(false);
  readonly waitingForFirstResponse$ = new BehaviorSubject<boolean>(false);

  constructor() {
    this.loadMessages();
  }

  registerChatService(name: string, chatService: ChatServiceBase) {
    this.chatServices.set(chatService.modelName, chatService);
  }

  async addMessage(message: ChatMessage) {
    this.messages$.next([...this.messages$.value, message]);
    this.saveMessages();
    this.loadMessages();
  }

  clearMessages() {
    this.messages$.next([]);
  }

  saveMessages() {
    this.allChats$.value.set(this.chatId$.value, this.messages$.value);
    this.localDbService.set(
      `chats`,
      Array.from(this.allChats$.value.entries())
    );
  }

  loadMessages() {
    const messages = this.localDbService.get<[string, ChatMessage[]]>(`chats`);
    if (!messages || !Array.isArray(messages)) return;
    const allChats = new Map();
    messages.forEach(([id, messages]) => {
      allChats.set(id as string, messages as any as ChatMessage[]);
    });

    this.allChats$.next(allChats);

    const chat = allChats.get(this.chatId$.value);
    if (chat) {
      this.messages$.next(chat);
    }
  }

  newChat() {
    this.chatId$.next(v4());
    this.clearMessages();
  }

  goToChat(chatId: string) {
    const chat = this.allChats$.value.get(chatId);
    if (chat) {
      this.chatId$.next(chatId);
      this.messages$.next(chat);
    }
  }

  deleteChat(chatId: string) {
    this.allChats$.value.delete(chatId);
    this.localDbService.set(
      `chats`,
      Array.from(this.allChats$.value.entries())
    );
    this.loadMessages();
    if (this.chatId$.value === chatId) {
      this.newChat();
    }
  }

  async getHistory() {
    return getObservableValue(this.messageChain$);
  }

  async message(content: string) {
    const hasPrimary = await getObservableValue(this.hasPrimary$);

    if (!hasPrimary || !content) {
      throw new Error('No primary message');
    }

    this.isLoading$.next(true);
    this.waitingForFirstResponse$.next(true);
    try {
      const primary = (await getObservableValue(this.messageChain$))?.pop();
      const message: ChatMessage = {
        id: v4(),
        text: content,
        source: MessageSource.User,
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

      await this.addMessage(message);

      const promises = enabledServices.map((s) => s.sendMessage());
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
    }
  }

  async setMessageAsPrimary(messageId: string) {
    const hasPrimary = await getObservableValue(this.hasPrimary$);
    if (hasPrimary) return;
    const messages = this.messages$.value;
    const message = messages.find((m) => m.id === messageId);
    if (!message) return;
    message.isPrimary = true;
    this.messages$.next([...messages]);
    this.saveMessages();
  }

  async branchOutChat(fromMessageId: string) {
    const groups = (await getObservableValue(this.messageGroups$)) ?? [];
    const groupIndex = groups.findIndex((g) =>
      g.messages.find((m) => m.id === fromMessageId)
    );
    if (groupIndex === -1) return;
    groups[groupIndex].messages = groups[groupIndex].messages.map((m) => clone(m));
    groups[groupIndex].messages.forEach(
      (m) => (m.isPrimary = m.id === fromMessageId)
    );
    const newMessageTree = groups.slice(0, groupIndex + 1);
    const newMessages = newMessageTree.reduce(
      (acc, cur) => [...acc, ...cur.messages],
      [] as ChatMessage[]
    );
    const newChatId = v4();
    this.allChats$.value.set(newChatId, newMessages);
    this.saveMessages();
    this.loadMessages();
    this.goToChat(newChatId);
  }
}
