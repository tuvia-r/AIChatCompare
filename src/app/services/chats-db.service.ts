import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Chat } from '../models/chat';
import { LocalDbService } from './local-db.service';

const CHATS_DB_KEY = 'chats_collection';

@Injectable({
  providedIn: 'root',
})
export class ChatsDbService {
  private localDbService = inject(LocalDbService);
  readonly allChats$ = new BehaviorSubject<Map<string, Chat>>(new Map<string, Chat>());

  constructor() {
    this.loadMessages();
    this.allChats$.subscribe((chats) => {
        this.saveMessages();
    });
  }

  async saveMessages() {
    const allChats = new Map(this.allChats$.value);

    for (const chat of allChats.values()) {
      if (chat.groups.length === 0) {
        allChats.delete(chat.id);
      }
    }

    this.localDbService.set(CHATS_DB_KEY, JSON.stringify(Array.from(allChats.values()).map(chat => chat.toJson())));
  }

  loadMessages() {
    const allChats = this.localDbService.get<Chat[]>(CHATS_DB_KEY);
    if (allChats) {
      const chatsMap = new Map<string, Chat>();
      for (const chat of allChats) {
        chatsMap.set(chat.id, new Chat(chat));
      }
      this.allChats$.next(chatsMap);
    }
  }

  deleteChat(chatId: string) {
    this.allChats$.value.delete(chatId);
    this.allChats$.next(new Map(this.allChats$.value));
  }

  updateChat(chat: Chat) {
    this.allChats$.value.set(chat.id, chat);
    this.allChats$.next(new Map(this.allChats$.value));
  }

  getChat(chatId: string) {
    return this.allChats$.value.get(chatId);
  }
}
