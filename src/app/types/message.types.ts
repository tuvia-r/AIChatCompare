
export enum MessageSource {
  User = 'user',
  Bot = 'bot',
}

export interface ChatMessage {
  id: string;
  text: string;
  source: MessageSource;
  sourceName: string;
  parentMessageId?: string;
  isPrimary?: boolean;
  inputTokens?: number;
  outputTokens?: number;
}

export interface ChatMessageGroup {
  id: string;
  sourceType: MessageSource;
  messageBySource: Record<string, ChatMessage | undefined>;
}
