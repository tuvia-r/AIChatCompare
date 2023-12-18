import { Component, inject } from '@angular/core';
import { DisplayService } from '../../../services';
import { ChatService } from '../../../services/chat.service';

@Component({
  selector: 'ai-chat-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.scss'
})
export class TopBarComponent {
  private displayService = inject(DisplayService);
  private chatService = inject(ChatService);

  showSidebar$ = this.displayService.isSidebarVisible$;

  set showSidebar(value: boolean) {
    this.displayService.isSidebarVisible$.next(value);
  }

  get showSidebar(): boolean {
    return this.displayService.isSidebarVisible$.value;
  }

  createNewChat(): void {
    this.chatService.newChat();
  }
}
