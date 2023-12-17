import { Component, Input } from '@angular/core';
import { ChatMessageGroup } from '../../../services/message.types';

@Component({
  selector: 'ai-chat-chat-output-group',
  templateUrl: './chat-output-group.component.html',
  styleUrl: './chat-output-group.component.scss'
})
export class ChatOutputGroupComponent {
  @Input() messageGroup!: ChatMessageGroup;
  @Input() isLast = false;

  activeIndex = 0;

  hasPrimaryMessage = false;

  ngOnChanges() {
    const primaryIndex = this.messageGroup.sourceNames.findIndex(n => this.getMessage(n)?.isPrimary);
    if (primaryIndex >= 0) {
      this.activeIndex = primaryIndex;
    }
  }

  getMessage(name: string) {
    return this.messageGroup.messages.find(m => m.sourceName === name)
  }
}
