import { Component, Input } from '@angular/core';
import { ChatMessage, ChatMessageGroup } from '../../../types/message.types';

@Component({
  selector: 'ai-chat-chat-output-group',
  templateUrl: './chat-output-group.component.html',
  styleUrl: './chat-output-group.component.scss',
})
export class ChatOutputGroupComponent {
  @Input() messageGroup!: ChatMessageGroup;
  @Input() isLast = false;

  activeIndex = 0;

  hasPrimaryMessage = false;

  messageGroupArray: ChatMessage[] = [];

  ngOnChanges() {

    const primaryIndex = Object.values(
      this.messageGroup.messageBySource
    ).findIndex((m) => m?.isPrimary);

    if (primaryIndex >= 0) {
      this.activeIndex = primaryIndex;
    }

    this.messageGroupArray = Object.keys(this.messageGroup.messageBySource).map(
      (key) => ({...this.messageGroup.messageBySource[key] ?? {}, sourceName: key})
    ) as ChatMessage[];

  }
}
