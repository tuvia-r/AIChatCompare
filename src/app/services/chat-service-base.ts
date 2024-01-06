import { inject } from "@angular/core";
import { ChatService } from "./chat.service";
import { ModelParamsService } from "./model-params.service";
import { ChatMessage } from "../types";
import { Chat } from "../models/chat";

const escape = '```'

export const TITLE_PROMPT = `
You are a machine that only returns and replies with valid, iterable RFC8259 compliant JSON in your responses.
Create a meaningful title for this conversation.

Example:
${escape}json
{
  "title": "My Awesome Conversation"
}
${escape}

schema:
${escape}json
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "title": "Example Schema",
  "type": "object",
  "properties": {
    "title": {
      "type": "string"
    }
  },
  "required": ["title"]
}
${escape}
`


export abstract class ChatServiceBase {

  constructor(
    protected chatService: ChatService,
    protected paramsService: ModelParamsService
  ) {}

  protected register() {
    this.chatService.registerChatService(this.modelName, this);
  }

  abstract startChat(chat: Chat): Promise<void>;
  abstract sendMessage(chat: Chat): Promise<ChatMessage | undefined>;
  abstract createTitle(chat: Chat): Promise<string | undefined>;
  abstract init(): Promise<void>;

  abstract isAvailable(): boolean;

  abstract readonly modelName: string;
  abstract readonly link: string;


  get enabled() {
    return this.paramsService.enabledModels.includes(this.modelName);
  }

  set enabled(value: boolean) {
    const enabledModels = this.paramsService.enabledModels;
    if (value) {
      enabledModels.push(this.modelName);
    }
    else {
      const index = enabledModels.indexOf(this.modelName);
      if (index > -1) {
        enabledModels.splice(index, 1);
      }
    }
    this.paramsService.enabledModels = enabledModels;
  }
}
