import { Injectable, inject } from '@angular/core';
import { Message } from 'primeng/api';
import { Subject } from 'rxjs';
import { AnalyticsService } from './analytics.service';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private analytics = inject(AnalyticsService);

  readonly toasts$ = new Subject<Message>();

  constructor() { }

  add(message: Message) {
    this.toasts$.next(message);
  }
}
