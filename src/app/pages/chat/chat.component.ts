import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'ai-chat-chat',
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {
  private chatService = inject(ChatService);
  private document = inject(DOCUMENT);

  get window() {
    return this.document.defaultView;
  }

  @ViewChild('anchor') anchor?: ElementRef<HTMLDivElement>;

  isWaiting$ = this.chatService.waitingForFirstResponse$;
  isLoading$ = this.chatService.isLoading$;

  messageGroups$ = this.chatService.messageGroups$;

  isScrolledToBottom: boolean = true;

  ngAfterViewInit() {
    if(!this.window?.IntersectionObserver){
      return;
    }
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.isScrolledToBottom = true;
        } else {
          this.isScrolledToBottom = false;
        }
      },
      { rootMargin: '0px 0px 100% 0px' }
    );

    intersectionObserver.observe(this.anchor?.nativeElement!);
    }




  async scrollToBottom() {
    await new Promise(resolve => setTimeout(resolve, 10));
    this.anchor?.nativeElement?.scrollIntoView?.({ behavior: 'smooth' });
  }
}
