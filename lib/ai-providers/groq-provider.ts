import OpenAI from "openai";
import { BaseProvider } from "./base-provider";
import { AIProviderConfig, ProviderOptions } from "@/types/ai-providers";
import { extractJsonFromString } from "@/utils/documentParser";

export class GroqProvider extends BaseProvider {
  private client: OpenAI;
  name = "groq";
  model = "llama-3.3-70b-specdec";

  constructor(config: AIProviderConfig) {
    super(config);
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: "https://api.groq.com/openai/v1",
    });
  }

  async analyze(options: ProviderOptions) {
    const requestOptions: any = {
      model: this.model,
      messages: options.messages,
    };

    if (options?.useTool) {
      requestOptions.functions = [options.functionSpec];
      requestOptions.function_call = "auto";
    }

    if (options?.temperature) {
      requestOptions.temperature = options.temperature;
    }

    if (options?.maxTokens) {
      requestOptions.max_tokens = options.maxTokens;
    }

    return this.client.chat.completions.create(requestOptions);
  }

  parseResponse(response: any) {
    const message = response.choices[0].message;

    if (message.function_call) {
      return JSON.parse(message.function_call.arguments);
    }

    if (message.content) {
      try {
        const content = message.content.trim();
        const getJsonFromContent = extractJsonFromString(content);
        return getJsonFromContent;
      } catch (e) {
        console.error("Error parsing Groq response", e);
      }
    }

    return null;
  }
}
