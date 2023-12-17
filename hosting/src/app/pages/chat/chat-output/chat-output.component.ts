import { Component, Input, inject } from '@angular/core';
import { CopyBtnComponent } from './copy-btn/copy-btn.component';
import { ChatService } from '../../../services/chat.service';
import { ChatMessage } from '../../../services/message.types';

@Component({
  selector: 'ai-chat-chat-output',
  templateUrl: './chat-output.component.html',
  styleUrl: './chat-output.component.scss'
})
export class ChatOutputComponent {
  private chatService = inject(ChatService);
  hasPrimary$ = this.chatService.hasPrimary$;

  ButtonComponent = CopyBtnComponent;
  @Input() message!: ChatMessage;

  async setAsPrimary() {
    await this.chatService.setMessageAsPrimary(this.message.id);
  }

  copyToClipboard() {
    window.navigator.clipboard.writeText(this.message.text);
  }
}
