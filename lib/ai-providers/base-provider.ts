import {
  AIProvider,
  AIProviderConfig,
  ProviderOptions,
} from "@/types/ai-providers";

export abstract class BaseProvider implements AIProvider {
  protected config: AIProviderConfig;
  abstract name: string;
  abstract model: string;

  constructor(config: AIProviderConfig) {
    this.config = config;
  }

  abstract analyze(options: ProviderOptions): Promise<any>;
  abstract parseResponse(response: any): Record<string, any> | null;
}
