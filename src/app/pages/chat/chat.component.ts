import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { combineLatest, map } from 'rxjs';

@Component({
  selector: 'ai-chat-chat',
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {
  private chatService = inject(ChatService);

  @ViewChild('anchor') anchor?: ElementRef<HTMLDivElement>;

  isWaiting$ = this.chatService.waitingForFirstResponse$;

  messageGroups$ = this.chatService.messageGroups$.pipe(map(groups => [...groups].reverse()));

  subscription = combineLatest([
    this.chatService.waitingForFirstResponse$,
    this.chatService.chatId$,
    this.messageGroups$
  ]).subscribe(this.scrollToBottom.bind(this));

  async scrollToBottom() {
    await new Promise(resolve => setTimeout(resolve, 10));
    this.anchor?.nativeElement?.scrollIntoView?.();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
