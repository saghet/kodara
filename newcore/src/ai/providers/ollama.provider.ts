// ═══════════════════════════════════════════════════════════════
// KODARA AI PROVIDER ENGINE: Native Ollama Provider
// "Your Code. Your AI. Your Rules."
// Adaptador de alto rendimiento para inferencia local con Ollama
// (/api/chat, streaming NDJSON, imágenes Base64 y multi-turn).
// ═══════════════════════════════════════════════════════════════

import {
  AIProvider,
  AICapabilities,
  AIChatRequest,
  AIStreamChunk,
  AIChatResponse,
} from '../provider.interface.js';

export class OllamaAIProvider implements AIProvider {
  public readonly id = 'ollama';
  public readonly name = 'Ollama Local Engine';
  private baseUrl: string;

  constructor(options?: string | { baseUrl?: string }) {
    if (typeof options === 'string') {
      this.baseUrl = options.replace(/\/$/, '');
    } else {
      this.baseUrl = (options?.baseUrl || 'http://127.0.0.1:11434').replace(/\/$/, '');
    }
  }

  public getCapabilities(model = ''): AICapabilities {
    const m = model.toLowerCase();
    const isMicro = m.includes('135m');
    const hasVision = m.includes('vl') || m.includes('llava') || m.includes('gemma3') || m.includes('minicpm');
    const isReasoning = m.includes('deepseek') || m.includes('r1');

    return {
      toolCalling: !isMicro,
      streaming: true,
      reasoning: isReasoning,
      longContext: !isMicro,
      multimodal: hasVision,
      structuredOutput: true,
    };
  }

  public async isAvailable(): Promise<boolean> {
    try {
      const resp = await fetch(`${this.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(2000),
      });
      return resp.ok;
    } catch {
      return false;
    }
  }

  public async *chatStream(request: AIChatRequest): AsyncIterable<AIStreamChunk> {
    const model = request.model || 'deepseek-r1:latest';
    const numCtx = request.options?.numCtx ?? (model.includes('135m') ? 2048 : 32768);
    const numThreads = request.options?.numThreads ?? 8;
    const temperature = request.temperature ?? 0.6;

    const payload = {
      model,
      messages: request.messages.map((m) => ({
        role: m.role,
        content: m.content,
        ...(m.images && m.images.length > 0 ? { images: m.images } : {}),
      })),
      stream: true,
      options: {
        temperature,
        top_p: request.options?.topP ?? 0.92,
        repeat_penalty: request.options?.repeatPenalty ?? 1.15,
        num_ctx: numCtx,
        num_threads: numThreads,
      },
    };

    const resp = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      throw new Error(`[OllamaAIProvider] HTTP error ${resp.status}: ${await resp.text()}`);
    }

    if (!resp.body) {
      throw new Error('[OllamaAIProvider] Response body is null');
    }

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
          if (!trimmed) continue;
          try {
            const data = JSON.parse(trimmed);
            const token = data.message?.content || '';
            const isDone = data.done === true;

            yield {
              chunkId: `chk_${Date.now()}`,
              content: token,
              isReasoning: false,
              done: isDone,
              usage: isDone
                ? {
                    promptTokens: data.prompt_eval_count || 0,
                    completionTokens: data.eval_count || 0,
                    totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
                  }
                : undefined,
            };
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
    let usage: any;

    for await (const chunk of this.chatStream(request)) {
      content += chunk.content;
      if (chunk.usage) usage = chunk.usage;
    }

    return {
      content,
      model: request.model || 'deepseek-r1:latest',
      usage,
      durationMs: Date.now() - t0,
    };
  }
}
