export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

type PropertyType = {
  type: string;
  description?: string;
  enum?: string[];
  properties?: Record<string, PropertyType>;
  required?: string[];
};

type FunctionParameters = {
  type: string;
  properties: Record<string, PropertyType>;
  required?: string[];
};

export type FunctionSpec = {
  name: string;
  description: string;
  parameters: FunctionParameters;
};

export interface ProviderOptions {
  messages: Message[];
  useTool?: boolean;
  temperature?: number;
  maxTokens?: number;
  functionSpec?: FunctionSpec;
  topP?: number;
  responseFormat?: { type: string };
}
export interface AIProvider {
  name: string;
  model: string;
  analyze(options: ProviderOptions): Promise<any>;
}

export interface AIResponse {
  functionArgs: Record<string, any>;
}

export interface AIProviderConfig {
  apiKey: string;
  model?: string;
  baseURL?: string;
}
