import { Component, Input } from '@angular/core';

@Component({
  selector: 'ai-chat-chat-input',
  templateUrl: './chat-input.component.html',
  styleUrl: './chat-input.component.scss'
})
export class ChatInputComponent {
  @Input() message: string = '';
  @Input() disabled: boolean = false;

  copyToClipboard() {
    window.navigator.clipboard.writeText(this.message);
  }
}
