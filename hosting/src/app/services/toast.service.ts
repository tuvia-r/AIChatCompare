import { Injectable } from '@angular/core';
import { Message } from 'primeng/api';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  readonly toasts$ = new Subject<Message>();

  constructor() { }

  add(message: Message) {
    this.toasts$.next(message);
  }
}
