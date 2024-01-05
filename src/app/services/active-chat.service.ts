import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, combineLatest, map, share, shareReplay } from 'rxjs';
import { Chat } from '../models/chat';
import { ChatMessage, ChatMessageGroup, MessageSource } from '../types';
import { ChatsDbService } from './chats-db.service';
import { getObservableValue } from '../utils';

@Injectable({
  providedIn: 'root',
})
export class ActiveChatService {
  private chatsDbService = inject(ChatsDbService);

  readonly chatId$ = new BehaviorSubject<string>('');
  readonly activeChat$ = combineLatest([
    this.chatsDbService.allChats$.asObservable(),
    this.chatId$.asObservable(),
  ]).pipe(
    map(([chats, chatId]) => chats.get(chatId))
  );

  constructor() {
    this.newChat();
  }


  readonly messageGroups$ = this.activeChat$.pipe(
    map((chat) => chat?.groups ?? [])
  );

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

  get chat () {
    return this.chatsDbService.allChats$.value.get(this.chatId$.value);
  }

  setActiveChatById(chatId: string) {
    this.chatsDbService.loadMessages();
    const chat = this.chatsDbService.allChats$.value.get(chatId);
    if (chat) {
      this.chatId$.next(chatId);
    }
  }

  newChat() {
    const chat = new Chat();
    this.chatsDbService.allChats$.value.set(chat.id, chat);
    this.chatsDbService.allChats$.next(new Map(this.chatsDbService.allChats$.value));
    this.chatId$.next(chat.id);
    return chat;
  }

  private setActiveChat() {
    const chat = this.chat;
    if(chat) {
      this.chatsDbService.allChats$.value.set(chat.id, chat.clone());
      this.chatsDbService.allChats$.next(new Map(this.chatsDbService.allChats$.value));
    }
  }

  addGroup(group: ChatMessageGroup) {
    this.chat?.addGroup(group);
    this.setActiveChat()
  }

  addMessage(message: ChatMessage, groupId?: string) {
    this.chat?.addMessage(message, groupId);
    this.setActiveChat()
  }

  removeLast2Groups() {
    this.chat?.groups.splice(-2, 2);
    this.setActiveChat()
  }

  updateTitle(title: string) {
    const chat = this.chat;
    if(!chat) return;
    chat.title = title;
    this.setActiveChat()
  }

  async setMessageAsPrimary(messageId: string) {
    const hasPrimary = await getObservableValue(this.hasPrimary$);
    if (hasPrimary) return;

    const chat = this.chat;
    if (!chat) return;

    for (const group of chat?.groups ?? []) {
      for (const message of Object.values(group.messageBySource)) {
        if (message?.id === messageId) {
          message.isPrimary = true;
          break;
        }
      }
    }

    chat.groups = chat?.groups ?? [];
    this.setActiveChat()
  }
}
