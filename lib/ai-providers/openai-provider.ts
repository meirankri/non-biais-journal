import OpenAI from "openai";
import { BaseProvider } from "./base-provider";
import { AIProviderConfig, ProviderOptions } from "@/types/ai-providers";

export class OpenAIProvider extends BaseProvider {
  private client: OpenAI;
  name = "openai";
  model = "gpt-4o-mini";

  constructor(config: AIProviderConfig) {
    super(config);
    this.client = new OpenAI({
      apiKey: config.apiKey,
    });
  }

  async analyze(options: ProviderOptions) {
    const requestOptions: any = {
      model: this.model,
      messages: options?.messages,
    };

    if (options?.responseFormat) {
      requestOptions.response_format = options.responseFormat;
    }

    if (options?.useTool) {
      requestOptions.tools = [
        {
          type: "function",
          function: options.functionSpec,
        },
      ];
      requestOptions.tool_choice = {
        type: "function",
        function: { name: options?.functionSpec?.name },
      };
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

    if (message.content) {
      return JSON.parse(message.content);
    }

    if (message.tool_calls?.[0]?.function) {
      return JSON.parse(message.tool_calls[0].function.arguments);
    }
    return null;
  }
}
