import {
  Component,
  ComponentRef,
  ElementRef,
  ViewChild,
  inject,
} from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { Subject } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { ChatServiceBase } from '../../services/chat-service-base';
import { HuggingFaceApiService } from '../../services/hugging-face-api.service';
import { Listbox } from 'primeng/listbox';

@Component({
  selector: 'ai-chat-chat',
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent {
  private chatService = inject(ChatService);
  private document = inject(DOCUMENT);
  private huggingFaceService = inject(HuggingFaceApiService);

  get window() {
    return this.document.defaultView;
  }

  @ViewChild('anchor') anchor?: ElementRef<HTMLDivElement>;
  @ViewChild('container') container?: ElementRef<HTMLDivElement>;
  @ViewChild('chatServicesListbox') chatServicesListbox?: ComponentRef<Listbox>;

  isWaiting$ = this.chatService.waitingForFirstResponse$;
  isLoading$ = this.chatService.isLoading$;

  messageGroups$ = this.chatService.messageGroups$;

  isScrolledToBottom: boolean = true;

  chatServices$ = this.chatService.allChatServices$;

  selectedChatServices = [] as ChatServiceBase[];

  unsubscribe = new Subject<void>();

  ngAfterViewInit() {
    if (!this.window?.IntersectionObserver) {
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

  setSelectedChatServices(services: ChatServiceBase[], currentServices: (ChatServiceBase & any)[]) {
    currentServices.forEach((service) => {
      service.enabled = !service.enabled;
    });
    const value = services.filter((service) => service.enabled);
    this.chatService.setSelectedChatServices(value);
  }

  async scrollToBottom() {
    await new Promise((resolve) => setTimeout(resolve, 10));
    this.anchor?.nativeElement?.scrollIntoView?.({ behavior: 'smooth' });
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
