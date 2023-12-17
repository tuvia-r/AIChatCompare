

export interface ChatServiceBase {
  startChat(): Promise<void>;
  sendMessage(): Promise<void>;
  init(): Promise<void>;

  isAvailable(): boolean;

  readonly modelName: string;
  enabled: boolean;
}
