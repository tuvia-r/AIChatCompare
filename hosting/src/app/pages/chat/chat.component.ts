import { Component, inject } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { map } from 'rxjs';

@Component({
  selector: 'ai-chat-chat',
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {
  private chatService = inject(ChatService);

  messageGroups$ = this.chatService.messageGroups$.pipe(map(messageGroups => [...messageGroups].reverse()));
}
