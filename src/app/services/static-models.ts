import { HuggingFaceModel } from "../types";


export const staticModels: HuggingFaceModel[] =[
  {
    name: 'tiiuae/falcon-180B-chat',
    path: '/tiiuae/falcon-180B-chat',
    type: 'text-generation',
    formatter: (messages) => {
      return messages.map(message => `${message.role === 'bot' ? 'Falcon: ' : 'User: '}` + message.content).join('\n');
    }
  },
  {
    name: 'meta-llama/Llama-2-70b-chat-hf',
    path: '/meta-llama/Llama-2-70b-chat-hf',
    type: 'text-generation',
    formatter: (messages) => {
      return messages.map(message => message.role === 'bot' ? `<s>[INST] <<SYS>>\n${message.content}<</SYS>>` : `${message.content} [/INST]`).join('\n\n');
    }
  },
  {
    name: 'codellama/CodeLlama-34b-Instruct-hf',
    path: '/codellama/CodeLlama-34b-Instruct-hf',
    type: 'text-generation',
    formatter: (messages) => {
      return messages.map(message => message.role === 'bot' ? `<s>[INST] <<SYS>>\n${message.content}<</SYS>>` : `${message.content} [/INST]`).join('\n\n');
    }
  },
  {
    name: 'mistralai/Mistral-7B-Instruct-v0.2',
    path: '/mistralai/Mistral-7B-Instruct-v0.2',
    type: 'text-generation',
    formatter: (messages) => {
      return '<s> ' + messages.map(message => `[INST] ${message.role === 'bot' ? 'MistralAI: ' : 'User: '}` + message.content + `${message.role === 'bot' ? '</s>' : '[/INST]'}`).join(' ');
    },
    responseFormatter: (response) => {
      return response.trim().startsWith('[MistralAI]: ') ? response.substring(13) : response;
    }
  },
  {
    name: 'openchat/openchat-3.5-1210',
    path: '/openchat/openchat-3.5-1210',
    type: 'text-generation',
    formatter: (messages) => {
      return messages.map(message => `${message.role === 'bot' ? 'GPT4 Correct Assistant: ' : 'GPT4 Correct User: '}` + message.content).join('<|end_of_turn|>') + '<|end_of_turn|> GPT4 Correct Assistant:';
    }
  },
  {
    name: 'facebook/blenderbot-400M-distill',
    path: '/facebook/blenderbot-400M-distill',
    type: 'conversational',
  },
  {
    name: 'microsoft/DialoGPT-small',
    path: '/microsoft/DialoGPT-small',
    type: 'conversational',
  },
  {
    name: 'TinyLlama/TinyLlama-1.1B-Chat-v1.0',
    path: '/TinyLlama/TinyLlama-1.1B-Chat-v1.0',
    type: 'text-generation',
    formatter: (messages) => {
      return messages.map(message => `${message.role === 'bot' ? '<|system|>\n' : '<|user|>\n'}${message.content}</s>`).join('\n');
    },
    responseFormatter: (response) => {
      return response.trim().startsWith('<|assistant|> ') ? response.substring(12) : response;
    }
  }
]
