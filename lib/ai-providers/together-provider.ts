import Together from "together-ai";
import { BaseProvider } from "./base-provider";
import { AIProviderConfig, ProviderOptions } from "@/types/ai-providers";

export class TogetherProvider extends BaseProvider {
  private client: Together;
  name = "together";
  model = "mistralai/Mixtral-8x7B-Instruct-v0.1";

  constructor(config: AIProviderConfig) {
    super(config);
    this.client = new Together();

    // new OpenAI({
    //   apiKey: config.apiKey,
    //   baseURL: "https://api.together.xyz/v1",
    // });
  }

  async analyze(options: ProviderOptions) {
    const requestOptions: any = {
      model: this.model,
      messages: options.messages,
    };

    if (options?.responseFormat) {
      requestOptions.response_format = { type: "json_object" };
    }

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
    console.log(message);
    if (message.content) {
      if (message.content.includes("```json")) {
        return JSON.parse(
          // get only the json content
          message.content.match(/```json\n([\s\S]*)\n```/)?.[1] || ""
        );
      }
      return message.content;
    }

    if (message.tool_calls) {
      return JSON.parse(message.tool_calls.arguments);
    }

    return null;
  }
}
