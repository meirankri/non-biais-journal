import { Mistral } from "@mistralai/mistralai";
import { BaseProvider } from "./base-provider";
import { AIProviderConfig, ProviderOptions } from "@/types/ai-providers";

export class MistralProvider extends BaseProvider {
  private client: Mistral;
  name = "mistral";
  model = "mistral-large-latest";

  constructor(config: AIProviderConfig) {
    super(config);
    this.client = new Mistral({
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
      requestOptions.toolChoice = {
        type: "function",
        function: { name: options?.functionSpec?.name },
      };
    }

    if (options?.temperature) {
      requestOptions.temperature = options.temperature;
    }

    if (options?.maxTokens) {
      requestOptions.maxTokens = options.maxTokens;
    }

    return this.client.chat.complete(requestOptions);
  }

  parseResponse(response: any) {
    const message = response.choices[0].message;
    console.log(message);
    if (message.content) {
      if (message.content.includes("```json")) {
        return JSON.parse(
          message.content.replace("```json", "").replace("```", "")
        );
      }
      return JSON.parse(message.content);
    }

    if (message.toolCalls?.[0]?.function) {
      return JSON.parse(message.toolCalls[0].function.arguments);
    }
    return null;
  }
}
