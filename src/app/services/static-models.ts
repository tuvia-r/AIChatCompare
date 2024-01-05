import { HuggingFaceModel } from "../types";
import { formatters } from "../utils";


export const staticModels: HuggingFaceModel[] =[
  {
    name: 'tiiuae/falcon-180B-chat',
    path: '/tiiuae/falcon-180B-chat',
    type: 'text-generation',
    formatter: formatters['falcon']?.formatter,
    responseFormatter: formatters['falcon']?.responseFormatter,
  },
  {
    name: 'meta-llama/Llama-2-70b-chat-hf',
    path: '/meta-llama/Llama-2-70b-chat-hf',
    type: 'text-generation',
    formatter: formatters['llama']?.formatter,
    responseFormatter: formatters['llama']?.responseFormatter,
  },
  {
    name: 'codellama/CodeLlama-34b-Instruct-hf',
    path: '/codellama/CodeLlama-34b-Instruct-hf',
    type: 'text-generation',
    formatter: formatters['llama']?.formatter,
    responseFormatter: formatters['llama']?.responseFormatter,
  },
  {
    name: 'mistralai/Mistral-7B-Instruct-v0.2',
    path: '/mistralai/Mistral-7B-Instruct-v0.2',
    type: 'text-generation',
    formatter: formatters['mistral']?.formatter,
    responseFormatter: formatters['mistral']?.responseFormatter,
  },
  {
    name: 'openchat/openchat-3.5-1210',
    path: '/openchat/openchat-3.5-1210',
    type: 'text-generation',
    formatter: formatters['openchat']?.formatter,
    responseFormatter: formatters['openchat']?.responseFormatter,
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
    formatter: formatters['TinyLlama']?.formatter,
    responseFormatter: formatters['TinyLlama']?.responseFormatter,
  }
]
