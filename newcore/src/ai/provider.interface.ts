// ═══════════════════════════════════════════════════════════════
// KODARA AI PROVIDER ENGINE: Interfaces & Contracts
// "Your Code. Your AI. Your Rules."
// Contrato estandarizado universal para proveedores de modelos
// locales y remotos (DeepSeek-R1, Ollama, OpenAI, Anthropic).
// ═══════════════════════════════════════════════════════════════

export interface AICapabilities {
  toolCalling: boolean;
  streaming: boolean;
  reasoning: boolean;        // Bloques de pensamiento profundo (<think>)
  longContext: boolean;      // Ventanas de contexto >= 32K
  multimodal: boolean;       // Soporte de visión (imágenes Base64)
  structuredOutput: boolean; // Respuestas JSON con esquema
}

export interface AIChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  images?: string[];         // Cadenas Base64 sin prefijo data:
  toolCalls?: any[];
  toolCallId?: string;
}

export interface AIChatRequest {
  model?: string;
  messages: AIChatMessage[];
  stream?: boolean;
  temperature?: number;
  maxTokens?: number;
  reasoningEffort?: 'low' | 'medium' | 'high';
  tools?: any[];
  timeoutMs?: number;
  options?: {
    numCtx?: number;
    numThreads?: number;
    repeatPenalty?: number;
    topP?: number;
    [key: string]: any;
  };
}

export interface AIStreamChunk {
  chunkId: string;
  content: string;
  reasoningContent?: string;
  isReasoning: boolean;
  done: boolean;
  toolCalls?: any[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIChatResponse {
  content: string;
  reasoning?: string;
  model: string;
  toolCalls?: any[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  durationMs: number;
}

export interface AIProvider {
  readonly id: string;
  readonly name: string;
  getCapabilities(model?: string): AICapabilities;
  isAvailable(): Promise<boolean>;
  chatStream(request: AIChatRequest): AsyncIterable<AIStreamChunk>;
  chatComplete(request: AIChatRequest): Promise<AIChatResponse>;
}
