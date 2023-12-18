import { Component, Input, inject } from '@angular/core';
import { CopyBtnComponent } from './copy-btn/copy-btn.component';
import { ChatService } from '../../../services/chat.service';
import { ChatMessage } from '../../../types/message.types';

@Component({
  selector: 'ai-chat-chat-output',
  templateUrl: './chat-output.component.html',
  styleUrl: './chat-output.component.scss',
  preserveWhitespaces: true
})
export class ChatOutputComponent {
  private chatService = inject(ChatService);
  hasPrimary$ = this.chatService.hasPrimary$;

  ButtonComponent = CopyBtnComponent;
  @Input() message!: ChatMessage;
  @Input() isLast = false;

  async setAsPrimary() {
    await this.chatService.setMessageAsPrimary(this.message.id);
  }

  copyToClipboard() {
    window.navigator.clipboard.writeText(this.message.text);
  }
}
