import { v4 } from "uuid";
import { ChatMessage, ChatMessageGroup } from "../types/message.types";
import { clone } from "lodash";


export class Chat {
  id: string;
  title: string;
  groups: ChatMessageGroup[];

  constructor(init?: Partial<Chat>) {
    Object.assign(this, init);
    this.id = init?.id || v4();
    this.groups = init?.groups ?? [];
    this.title = init?.title || 'New Chat';
  }

  addGroup(group: ChatMessageGroup) {
    this.groups.push(group);
  }

  removeGroup(groupId: string) {
    this.groups = this.groups.filter(g => g.id !== groupId);
  }

  addMessage(message: ChatMessage, groupId?: string) {
    const group = this.groups.find(g => g.id === groupId);
    if(group) {
      group.messageBySource[message.sourceName] = message;
    }
    else {
      this.groups.push({
        id: v4(),
        sourceType: message.source,
        messageBySource: {
          [message.sourceName]: message,
        },
      })
    }
  }

  removeMessage(messageId: string) {
    for(const group of this.groups) {
      for(const source of Object.keys(group.messageBySource)) {
        if(group.messageBySource[source]?.id === messageId) {
          delete group.messageBySource[source];
        }
      }
    }
  }

  getMessages() {
    return this.groups.flatMap(g => Object.values(g.messageBySource)).filter(m => m) as ChatMessage[];
  }

  getPrimaryTree() {
    const primaryMessages = this.getMessages().filter(m => m.isPrimary || m.source === 'user');
    return primaryMessages as ChatMessage[];
  }

  clone() {
    return new Chat(this.toJson());
  }

  static fromJson(json: any) {
    return new Chat({
      id: json.id,
      title: json.title,
      groups: json.groups.map((g: any) => ({
        id: g.id,
        sourceType: g.sourceType,
        messageBySource: g.messageBySource,
      })),
    });
  }

  toJson() {
    return {
      id: this.id,
      title: this.title,
      groups: this.groups.map(g => ({
        id: g.id,
        sourceType: g.sourceType,
        messageBySource: g.messageBySource,
      })),
    };
  }

  branchOut(fromMessageId: string) {
    const newChat = new Chat({
      title: `${this.title} - Branch Out`,
    });

    for(const group of this.groups) {
      const isBranch = Object.values(group.messageBySource).some(m => m && m.id === fromMessageId);
      if(isBranch) {
        const newGroup: ChatMessageGroup = {
          sourceType: group.sourceType,
          messageBySource: {},
          id: v4(),
        };
        for(const message of Object.values(group.messageBySource)) {
          if(!message) continue;
          newGroup.messageBySource[message.sourceName] = clone(message);
          newGroup.messageBySource[message.sourceName]!.isPrimary = message.id === fromMessageId;
        }

        newChat.groups.push(newGroup);
        break;
      }
      else {
        const newGroup = clone(group);
        newGroup.id = v4();
        newChat.groups.push(newGroup);
      }
    }

    return newChat;
  }
}
