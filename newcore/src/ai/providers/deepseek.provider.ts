// ═══════════════════════════════════════════════════════════════
// KODARA AI PROVIDER ENGINE: DeepSeek-R1 Specialized Provider
// "Your Code. Your AI. Your Rules."
// Motor especializado para DeepSeek-R1 (Local GPU Ollama y DeepSeek API).
// Extrae de forma progresiva el razonamiento (<think>) para emitirlo
// por separado de la respuesta ejecutable de código.
// ═══════════════════════════════════════════════════════════════

import {
  AIProvider,
  AICapabilities,
  AIChatRequest,
  AIStreamChunk,
  AIChatResponse,
} from '../provider.interface.js';
import { StreamingReasoningParser } from '../reasoning-parser.js';
import { OllamaAIProvider } from './ollama.provider.js';

export class DeepSeekR1Provider implements AIProvider {
  public readonly id = 'deepseek-r1';
  public readonly name = 'DeepSeek-R1 Reasoning Engine';
  private localOllama: OllamaAIProvider;
  private apiKey?: string;
  private apiEndpoint: string;

  constructor(options?: { ollamaBaseUrl?: string; apiKey?: string; apiEndpoint?: string }) {
    this.localOllama = new OllamaAIProvider(options?.ollamaBaseUrl || 'http://127.0.0.1:11434');
    this.apiKey = options?.apiKey || process.env.DEEPSEEK_API_KEY;
    this.apiEndpoint = options?.apiEndpoint || 'https://api.deepseek.com/chat/completions';
  }

  public getCapabilities(): AICapabilities {
    return {
      toolCalling: true,
      streaming: true,
      reasoning: true,       // Soporte nativo de pensamiento profundo
      longContext: true,     // 32K context window
      multimodal: false,     // R1 es puro lenguaje/código
      structuredOutput: true,
    };
  }

  public async isAvailable(): Promise<boolean> {
    if (this.apiKey) return true;
    return await this.localOllama.isAvailable();
  }

  public async *chatStream(request: AIChatRequest): AsyncIterable<AIStreamChunk> {
    const parser = new StreamingReasoningParser();

    // Si no hay API key remota, ejecutar contra la instancia local de Ollama (deepseek-r1:latest)
    if (!this.apiKey) {
      const localRequest: AIChatRequest = {
        ...request,
        model: request.model?.startsWith('deepseek') ? request.model : 'deepseek-r1:latest',
        temperature: request.temperature ?? 0.6,
      };

      for await (const rawChunk of this.localOllama.chatStream(localRequest)) {
        const parsed = parser.feed(rawChunk.content);

        // Si se extrajo razonamiento
        if (parsed.reasoning) {
          yield {
            chunkId: rawChunk.chunkId,
            content: '',
            reasoningContent: parsed.reasoning,
            isReasoning: true,
            done: false,
          };
        }

        // Si se extrajo contenido final visible
        if (parsed.content) {
          yield {
            chunkId: rawChunk.chunkId,
            content: parsed.content,
            isReasoning: false,
            done: false,
            usage: rawChunk.usage,
          };
        }

        if (rawChunk.done) {
          const flush = parser.flush();
          if (flush.reasoning) {
            yield {
              chunkId: rawChunk.chunkId,
              content: '',
              reasoningContent: flush.reasoning,
              isReasoning: true,
              done: false,
            };
          }
          if (flush.content) {
            yield {
              chunkId: rawChunk.chunkId,
              content: flush.content,
              isReasoning: false,
              done: false,
            };
          }
          yield {
            chunkId: rawChunk.chunkId,
            content: '',
            isReasoning: false,
            done: true,
            usage: rawChunk.usage,
          };
        }
      }
      return;
    }

    // Modo Remoto con DeepSeek API Oficial
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
    };

    const resp = await fetch(this.apiEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'deepseek-reasoner',
        messages: request.messages,
        stream: true,
        temperature: request.temperature ?? 0.6,
        max_tokens: request.maxTokens ?? 8192,
      }),
    });

    if (!resp.ok) {
      throw new Error(`[DeepSeek API] Error ${resp.status}: ${await resp.text()}`);
    }

    if (!resp.body) throw new Error('[DeepSeek API] Response body is null');

    const reader = resp.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          if (trimmed === 'data: [DONE]') {
            yield { chunkId: `chk_${Date.now()}`, content: '', isReasoning: false, done: true };
            return;
          }

          try {
            const data = JSON.parse(trimmed.slice(6));
            const delta = data.choices?.[0]?.delta;
            const reasoning = delta?.reasoning_content || '';
            const content = delta?.content || '';

            if (reasoning) {
              yield {
                chunkId: `chk_${Date.now()}`,
                content: '',
                reasoningContent: reasoning,
                isReasoning: true,
                done: false,
              };
            }
            if (content) {
              yield {
                chunkId: `chk_${Date.now()}`,
                content,
                isReasoning: false,
                done: false,
              };
            }
          } catch {}
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  public async chatComplete(request: AIChatRequest): Promise<AIChatResponse> {
    const t0 = Date.now();
    let content = '';
    let reasoning = '';
    let usage: any;

    for await (const chunk of this.chatStream(request)) {
      if (chunk.isReasoning && chunk.reasoningContent) {
        reasoning += chunk.reasoningContent;
      } else {
        content += chunk.content;
      }
      if (chunk.usage) usage = chunk.usage;
    }

    return {
      content,
      reasoning: reasoning || undefined,
      model: request.model || 'deepseek-r1:latest',
      usage,
      durationMs: Date.now() - t0,
    };
  }
}
