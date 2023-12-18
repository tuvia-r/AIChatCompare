import { inject } from "@angular/core";
import { ChatService } from "./chat.service";
import { ModelParamsService } from "./model-params.service";


export abstract class ChatServiceBase {
  protected chatService = inject(ChatService);
  protected paramsService = inject(ModelParamsService);

  protected register() {
    this.chatService.registerChatService(this.modelName, this);
  }

  abstract startChat(): Promise<void>;
  abstract sendMessage(): Promise<void>;
  abstract init(): Promise<void>;

  abstract isAvailable(): boolean;

  abstract readonly modelName: string;


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
