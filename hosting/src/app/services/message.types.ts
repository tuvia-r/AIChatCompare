
export enum MessageSource {
  User = 'user',
  Bot = 'bot',
}

export interface ChatMessage {
  id: string;
  text: string;
  source: MessageSource;
  sourceName?: string;
  parentMessageId?: string;
  isPrimary?: boolean;
}

export interface ChatMessageGroup {
  sourceType: MessageSource;
  messages: ChatMessage[];
  sourceNames: string[];
}
