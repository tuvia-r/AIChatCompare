import { HuggingFaceChatMessage } from "../types";


export interface Formatter {
  formatter(messages: HuggingFaceChatMessage[]): string;
  responseFormatter?: (response: string) => string;
  matchingTags?: string[];
}

export const formatterByTags = (tags: string[]) => {
  return Object.values(formatters).find(formatter => {
    return tags.some(tag => formatter.matchingTags?.includes(tag));
  });
}


export const formatters: Record<string, Formatter> = {
  gpt: {
    formatter(messages: HuggingFaceChatMessage[]) {
      return (
        messages
          .map(
            (message) =>
              `${
                message.role === 'bot'
                  ? 'GPT4 Correct Assistant: '
                  : 'GPT4 Correct User: '
              }` + message.content
          )
          .join('<|end_of_turn|>') + '<|end_of_turn|> GPT4 Correct Assistant:'
      );
    },
    matchingTags: ['gpt', 'gpt2', 'gpt3', 'gpt4'],
  },
  llama: {
    formatter(messages) {
      return messages.map(message => message.role === 'bot' ? `<s>[INST] <<SYS>>\n${message.content}<</SYS>>` : `${message.content} [/INST]`).join('\n\n');
    },
    matchingTags: ['llama'],
  },
  falcon: {
    formatter(messages) {
      return messages.map(message => `${message.role === 'bot' ? 'Falcon: ' : 'User: '}` + message.content).join('\n');
    },
    matchingTags: ['falcon'],
  },
  mistral: {
    formatter(messages) {
      return '<s> ' + messages.map(message => `[INST] ${message.role === 'bot' ? 'MistralAI: ' : 'User: '}` + message.content + `${message.role === 'bot' ? '</s>' : '[/INST]'}`).join(' ');
    },
    responseFormatter: (response) => {
      return response.trim().startsWith('[MistralAI]: ') ? response.substring(13) : response;
    },
    matchingTags: ['mistral'],
  },
  openchat: {
    formatter: (messages) => {
      return messages.map(message => `${message.role === 'bot' ? 'GPT4 Correct Assistant: ' : 'GPT4 Correct User: '}` + message.content).join('<|end_of_turn|>') + '<|end_of_turn|> GPT4 Correct Assistant:';
    },
    matchingTags: ['openchat'],
  },
  TinyLlama: {
    formatter: (messages) => {
      return messages.map(message => `${message.role === 'bot' ? '<|system|>\n' : '<|user|>\n'}${message.content}</s>`).join('\n');
    },
    responseFormatter: (response) => {
      return response.trim().startsWith('<|assistant|> ') ? response.substring(12) : response;
    },
    matchingTags: ['TinyLlama', 'tinyllama'],
  }

}
