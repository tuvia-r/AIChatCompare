import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { Chat } from '../models/chat';
import { ChatMessage, ChatMessageGroup, MessageSource } from '../types';
import { ChatsDbService } from './chats-db.service';

@Injectable({
  providedIn: 'root',
})
export class ChatUtilsService {
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


  readonly activeMessageGroups$ = this.activeChat$.pipe(
    map((chat) => chat?.groups ?? [])
  );

  readonly activeChatHasPrimary$ = this.activeChat$.pipe(
    map((chat) => !!chat && this.hasPrimary(chat))
  );

  get activeChat () {
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
    this.chatsDbService.updateChat(chat);
    this.chatId$.next(chat.id);
    return chat;
  }

  private setChat(chat: Chat) {
    this.chatsDbService.updateChat(chat.clone());
  }

  addGroup(chat: Chat, group: ChatMessageGroup) {
    chat.addGroup(group);
    this.setChat(chat);
    return chat;
  }

  addMessage(chat: Chat, message: ChatMessage, groupId?: string) {
    chat.addMessage(message, groupId);
    this.setChat(chat);
    return chat;
  }

  removeLast2Groups(chat: Chat) {
    chat.groups.splice(-2, 2);
    this.setChat(chat);
    return chat;
  }

  updateTitle(chat: Chat, title: string) {
    chat.title = title;
    this.setChat(chat);
    return chat;
  }

  hasPrimary(chat: Chat) {
    const messageGroups = chat?.groups ?? [];
    const relevantGroup = [...messageGroups].pop();
      if (!relevantGroup || relevantGroup.sourceType === MessageSource.User)
        return true;
      const hasPrimary = Object.values(relevantGroup.messageBySource).some(
        (m) => m?.isPrimary
      );
      return !!hasPrimary;
  }

  async setMessageAsPrimary(chat: Chat, messageId: string) {
    const hasPrimary = this.hasPrimary(chat);
    if (hasPrimary) return chat;

    for (const group of chat?.groups ?? []) {
      for (const message of Object.values(group.messageBySource)) {
        if (message?.id === messageId) {
          message.isPrimary = true;
          break;
        }
      }
    }

    chat.groups = chat.groups ?? [];
    this.setChat(chat);
    return chat;
  }
}
