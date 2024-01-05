import { Component, inject } from '@angular/core';
import { DisplayService } from '../../../services';
import { ChatService } from '../../../services/chat.service';
import { ActiveChatService } from '../../../services/active-chat.service';
import { ChatServiceBase } from '../../../services/chat-service-base';
import { map } from 'rxjs';
import { ListboxFilterEvent } from 'primeng/listbox';
import { HuggingFaceApiService } from '../../../services/hugging-face-api.service';

@Component({
  selector: 'ai-chat-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.scss'
})
export class TopBarComponent {
  private displayService = inject(DisplayService);
  private chatService = inject(ChatService);
  private activeChatService = inject(ActiveChatService);
  private huggingFaceService = inject(HuggingFaceApiService);

  showSidebar$ = this.displayService.isSidebarVisible$;
  chatServices$ = this.chatService.allChatServices$.pipe(
    map((services) => services.sort((a, b) => a.enabled ? -1 : 1)),
  );

  set showSidebar(value: boolean) {
    this.displayService.isSidebarVisible$.next(value);
  }

  get showSidebar(): boolean {
    return this.displayService.isSidebarVisible$.value;
  }

  createNewChat(): void {
    this.activeChatService.newChat();
  }

  onChatServiceChange(params: {
    all: ChatServiceBase[];
    current: ChatServiceBase[];
  }) {
    const { all, current } = params;
    current.forEach((service) => {
      service.enabled = !service.enabled;
    });
    const value = all.filter((service) => service.enabled);
    this.chatService.setSelectedChatServices(value);
  }

  onChatServiceFilter(event: ListboxFilterEvent) {
    const { filter } = event;
    if(!filter) return;
    this.huggingFaceService.searchModels(
      filter
    );
  }
}
