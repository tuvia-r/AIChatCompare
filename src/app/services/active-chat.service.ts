import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Chat } from '../models/chat';

@Injectable({
  providedIn: 'root',
})
export class ActiveChatService {
  readonly activeChat$ = new BehaviorSubject<Chat>(new Chat());
}
