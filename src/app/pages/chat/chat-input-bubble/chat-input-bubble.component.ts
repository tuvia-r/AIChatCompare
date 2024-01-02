import { Component, inject } from '@angular/core';
import { ChatService } from '../../../services/chat.service';
import { take } from 'rxjs/operators';
import { getObservableValue } from '../../../utils/get-observable-value';
import { WINDOW_BREAKPOINT } from '../../../utils';

@Component({
  selector: 'ai-chat-chat-input-bubble',
  templateUrl: './chat-input-bubble.component.html',
  styleUrl: './chat-input-bubble.component.scss'
})
export class ChatInputBubbleComponent {
  private chatService = inject(ChatService);
  canSubmit$ = this.chatService.hasPrimary$;
  isLoading$ = this.chatService.isLoading$;
  text = '';

  async onSend() {
    if (!this.text) {
      return;
    }
    const canSubmit = await getObservableValue(this.canSubmit$);
    if (!canSubmit) {
      return;
    }
    const message = this.text;
    this.text = '';
    await this.chatService.message(message);
  }

  onEnter(event: KeyboardEvent) {
    if (!event.shiftKey && window.innerWidth > WINDOW_BREAKPOINT) {
      event.preventDefault();
      this.onSend();
    }
  }
}
