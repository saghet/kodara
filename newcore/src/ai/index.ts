// ═══════════════════════════════════════════════════════════════
// KODARA AI PROVIDER ENGINE: Central Facade & Registry
// "Your Code. Your AI. Your Rules."
// Orquesta los proveedores de IA, normaliza el streaming y
// garantiza el pensamiento profundo con DeepSeek-R1 por defecto.
// ═══════════════════════════════════════════════════════════════

import {
  AIProvider,
  AICapabilities,
  AIChatRequest,
  AIStreamChunk,
  AIChatResponse,
} from './provider.interface.js';
import { OllamaAIProvider } from './providers/ollama.provider.js';
import { DeepSeekR1Provider } from './providers/deepseek.provider.js';
import { OpenAICompatibleProvider } from './providers/openai-compatible.provider.js';
import { AnthropicProvider } from './providers/anthropic.provider.js';

export * from './provider.interface.js';
export * from './reasoning-parser.js';
export * from './providers/ollama.provider.js';
export * from './providers/deepseek.provider.js';
export * from './providers/openai-compatible.provider.js';
export * from './providers/anthropic.provider.js';

export class AIProviderEngine {
  private static instance: AIProviderEngine;
  private readonly providers: Map<string, AIProvider> = new Map();
  private defaultProviderId = 'deepseek-r1';

  private constructor() {
    this.registerDefaultProviders();
  }

  public static getInstance(): AIProviderEngine {
    if (!AIProviderEngine.instance) {
      AIProviderEngine.instance = new AIProviderEngine();
    }
    return AIProviderEngine.instance;
  }

  private registerDefaultProviders(): void {
    const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';

    // 1. DeepSeek-R1 con razonamiento analítico (Predeterminado de Kodara)
    const deepSeekProvider = new DeepSeekR1Provider({
      ollamaBaseUrl: ollamaUrl,
      deepseekApiKey: process.env.DEEPSEEK_API_KEY,
    });
    this.registerProvider(deepSeekProvider);

    // 2. Ollama genérico para modelos locales (llama3, mistral, qwen, etc.)
    const ollamaProvider = new OllamaAIProvider({ baseUrl: ollamaUrl });
    this.registerProvider(ollamaProvider);

    // 3. OpenAI y APIs compatibles (Groq, Together, vLLM, LMStudio)
    const openAIProvider = new OpenAICompatibleProvider();
    this.registerProvider(openAIProvider);

    // 4. Anthropic Claude
    const anthropicProvider = new AnthropicProvider();
    this.registerProvider(anthropicProvider);
  }

  public registerProvider(provider: AIProvider): void {
    this.providers.set(provider.id, provider);
  }

  public getProvider(id: string): AIProvider | undefined {
    return this.providers.get(id);
  }

  public getAllProviders(): AIProvider[] {
    return Array.from(this.providers.values());
  }

  public setDefaultProvider(providerId: string): void {
    if (!this.providers.has(providerId)) {
      throw new Error(`Provider "${providerId}" no está registrado en el AIProviderEngine.`);
    }
    this.defaultProviderId = providerId;
  }

  public getDefaultProvider(): AIProvider {
    return this.providers.get(this.defaultProviderId)!;
  }

  /**
   * Resuelve automáticamente el mejor proveedor según el nombre del modelo.
   */
  public resolveProviderForModel(modelName?: string): AIProvider {
    if (!modelName) {
      return this.getDefaultProvider();
    }

    const lower = modelName.toLowerCase();

    // Modelos Claude
    if (lower.startsWith('claude')) {
      const claude = this.providers.get('anthropic');
      if (claude) return claude;
    }

    // Modelos OpenAI (gpt, o1, o3)
    if (lower.startsWith('gpt') || lower.startsWith('o1') || lower.startsWith('o3')) {
      const openai = this.providers.get('openai-compatible');
      if (openai) return openai;
    }

    // Modelos DeepSeek R1
    if (lower.includes('deepseek-r1') || lower.includes('r1') || lower.includes('deepseek-reasoner')) {
      const deepseek = this.providers.get('deepseek-r1');
      if (deepseek) return deepseek;
    }

    // Modelos locales Ollama
    const ollama = this.providers.get('ollama');
    if (ollama) return ollama;

    return this.getDefaultProvider();
  }

  public async *chatStream(
    request: AIChatRequest,
    providerId?: string
  ): AsyncIterable<AIStreamChunk> {
    const provider = providerId
      ? this.providers.get(providerId)
      : this.resolveProviderForModel(request.model);

    if (!provider) {
      throw new Error(`No se encontró proveedor de IA válido para resolver la solicitud.`);
    }

    yield* provider.chatStream(request);
  }

  public async chatComplete(
    request: AIChatRequest,
    providerId?: string
  ): Promise<AIChatResponse> {
    const provider = providerId
      ? this.providers.get(providerId)
      : this.resolveProviderForModel(request.model);

    if (!provider) {
      throw new Error(`No se encontró proveedor de IA válido para resolver la solicitud.`);
    }

    return await provider.chatComplete(request);
  }

  public detectCapabilities(model?: string, providerId?: string): AICapabilities {
    const provider = providerId
      ? this.providers.get(providerId)
      : this.resolveProviderForModel(model);

    if (!provider) {
      return {
        toolCalling: false,
        streaming: false,
        reasoning: false,
        longContext: false,
        multimodal: false,
        structuredOutput: false,
      };
    }

    return provider.getCapabilities(model);
  }
}
