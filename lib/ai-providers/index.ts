import { AIProviderConfig } from "@/types/ai-providers";
import { TogetherProvider } from "./together-provider";
import { MistralProvider } from "./mistral-provider";
import { GroqProvider } from "./groq-provider";
import { OpenAIProvider } from "./openai-provider";

export const createProvider = (type: string, config: AIProviderConfig) => {
  switch (type) {
    case "together":
      return new TogetherProvider(config);
    case "mistral":
      return new MistralProvider(config);
    case "groq":
      return new GroqProvider(config);
    case "openai":
      return new OpenAIProvider(config);
    default:
      throw new Error(`Provider ${type} non supporté`);
  }
};
