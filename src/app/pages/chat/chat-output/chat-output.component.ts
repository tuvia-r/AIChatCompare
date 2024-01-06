import { Component, Input, inject } from '@angular/core';
import { CopyBtnComponent } from './copy-btn/copy-btn.component';
import { ChatService } from '../../../services/chat.service';
import { ChatMessage } from '../../../types/message.types';
import { ChatUtilsService } from '../../../services/chat-utils.service';
import { getObservableValue } from '../../../utils';

@Component({
  selector: 'ai-chat-chat-output',
  templateUrl: './chat-output.component.html',
  styleUrl: './chat-output.component.scss',
  preserveWhitespaces: true,
})
export class ChatOutputComponent {
  private chatService = inject(ChatService);
  private activeChatService = inject(ChatUtilsService);
  hasPrimary$ = this.chatService.hasPrimary$;

  maxErrorMessageLength = 200;

  ButtonComponent = CopyBtnComponent;
  @Input() message!: ChatMessage;
  @Input() isLast = false;

  katexOptions = {
    displayMode: true,
    throwOnError: false,
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '$', right: '$', display: true },
      { left: '\\[', right: '\\]', display: true },
      { left: '\\\\[', right: '\\\\]', display: true },
      { left: '\\(', right: '\\)', display: true },
      { left: '\\\\(', right: '\\\\)', display: true },
      { left: '\\begin{equation}', right: '\\end{equation}', display: true },
      { left: '\\begin{align}', right: '\\end{align}', display: true },
      { left: '\\begin{alignat}', right: '\\end{alignat}', display: true },
      { left: '\\begin{gather}', right: '\\end{gather}', display: true },
      { left: '\\begin{CD}', right: '\\end{CD}', display: true },
    ],
    ignoredTags: ['script', 'noscript', 'style'] as const,
  };

  async setAsPrimary() {
    const activeChat = await getObservableValue(this.chatService.activeChat$);
    if (!activeChat) return;
    await this.activeChatService.setMessageAsPrimary(activeChat, this.message.id);
  }

  keepLatex(text: string) {
    return (text ?? '').replace(/\\\(/g, '\\\\(').replace(/\\\)/g, '\\\\)').replace(/\\\[/g, '\\\\[').replace(/\\\]/g, '\\\\]');
  }

  copyToClipboard() {
    window.navigator.clipboard.writeText(this.message.text);
  }

  async onBranchClick() {
    const activeChat = await getObservableValue(this.chatService.activeChat$);
    if (!activeChat) return;
    this.chatService.branchOutChat(activeChat, this.message.id);
  }

  toString(arr: string[]) {
    return arr.join(', ');
  }
}
