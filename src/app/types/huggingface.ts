export interface HuggingFaceModelStatus {
  loaded: boolean;
  state: "Loadable" | "TooBig" ;
  compute_type: "cpu" | "gpu";
  framework: "transformers" | string;
}

export interface HuggingFaceModel {
  name: string;
  path: string;
  type: 'conversational' | 'text-generation' | 'text2text-generation';
  formatter?: (messages: HuggingFaceChatMessage[]) => string;
  responseFormatter?: (response: string) => string;
  status?: HuggingFaceModelStatus;
}

export interface HuggingFaceChatMessage {
  role: 'user' | 'bot';
  content: string;
}


export interface HuggingFaceOptions {
  temperature: number;
  return_full_text: boolean;
  wait_for_model: boolean;
}

export interface HuggingFaceRequest extends HuggingFaceOptions {
  inputs: {
    past_user_inputs: string[];
    generated_responses: string[];
    text: string;
  };
}

export interface HuggingFaceResponse {
  generated_text: string;
  conversation: {
    generated_responses: string[];
    past_user_inputs: string[];
  };
  warnings?: string[];
}
