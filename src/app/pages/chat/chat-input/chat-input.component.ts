import { Component, Input, inject } from '@angular/core';
import { ChatService } from '../../../services';
import { getObservableValue } from '../../../utils';

@Component({
  selector: 'ai-chat-chat-input',
  templateUrl: './chat-input.component.html',
  styleUrl: './chat-input.component.scss'
})
export class ChatInputComponent {
  private chatService = inject(ChatService);

  isLoading$ = this.chatService.isLoading$;

  @Input() message: string = '';
  @Input() disabled: boolean = false;
  @Input() isLast: boolean = false;

  copyToClipboard() {
    window.navigator.clipboard.writeText(this.message);
  }

  async regenerate() {
    const activeChat = await getObservableValue(this.chatService.activeChat$);
    if (!activeChat) return;
    return this.chatService.regenerateLastMessage(activeChat);
  }
}
