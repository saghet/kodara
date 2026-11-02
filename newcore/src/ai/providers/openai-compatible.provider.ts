// ═══════════════════════════════════════════════════════════════
// KODARA AI PROVIDER ENGINE: OpenAI Compatible Provider
// "Your Code. Your AI. Your Rules."
// Soporte universal para APIs compatibles con OpenAI (OpenAI,
// Groq, Together, Mistral, vLLM, LMStudio, LocalAI, etc.).
// ═══════════════════════════════════════════════════════════════

import {
  AIProvider,
  AICapabilities,
  AIChatRequest,
  AIStreamChunk,
  AIChatResponse,
  AIChatMessage,
} from '../provider.interface.js';
import { StreamingReasoningParser } from '../reasoning-parser.js';

export class OpenAICompatibleProvider implements AIProvider {
  public readonly id: string;
  public readonly name: string;
  private readonly baseUrl: string;
  private readonly apiKey?: string;

  constructor(options?: { id?: string; name?: string; baseUrl?: string; apiKey?: string }) {
    this.id = options?.id || 'openai-compatible';
    this.name = options?.name || 'OpenAI Compatible';
    this.baseUrl = (options?.baseUrl || 'https://api.openai.com/v1').replace(/\/$/, '');
    this.apiKey = options?.apiKey || process.env.OPENAI_API_KEY || '';
  }

  public getCapabilities(model?: string): AICapabilities {
    const isReasoningModel = model ? /^(o1|o3|deepseek-reasoner)/i.test(model) : false;
    return {
      toolCalling: true,
      streaming: true,
      reasoning: isReasoningModel,
      longContext: true,
      multimodal: true,
      structuredOutput: true,
    };
  }

  public async isAvailable(): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/models`;
      const headers: Record<string, string> = {};
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }
      const resp = await fetch(url, { headers, signal: AbortSignal.timeout(3000) });
      return resp.ok;
    } catch {
      return false;
    }
  }

  public async *chatStream(request: AIChatRequest): AsyncIterable<AIStreamChunk> {
    const endpoint = this.baseUrl.endsWith('/v1')
      ? `${this.baseUrl}/chat/completions`
      : `${this.baseUrl}/v1/chat/completions`;

    const messages = this.formatMessages(request.messages);
    const model = request.model || 'gpt-4o';
    const parser = new StreamingReasoningParser();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const payload: any = {
      model,
      messages,
      stream: true,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 4096,
    };

    if (request.tools && request.tools.length > 0) {
      payload.tools = request.tools;
    }

    const resp = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: request.timeoutMs ? AbortSignal.timeout(request.timeoutMs) : undefined,
    });

    if (!resp.ok) {
      const errorText = await resp.text();
      throw new Error(`OpenAI Provider HTTP ${resp.status}: ${errorText}`);
    }

    if (!resp.body) {
      throw new Error('OpenAI Provider returned an empty response body stream.');
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

        for (const rawLine of lines) {
          const line = rawLine.trim();
          if (!line.startsWith('data:')) continue;
          const dataStr = line.replace(/^data:\s*/, '').trim();

          if (dataStr === '[DONE]') {
            const flushChunk = parser.feed('', true);
            if (flushChunk.content || flushChunk.reasoning) {
              yield {
                chunkId: `chunk-${Date.now()}`,
                content: flushChunk.content,
                reasoningContent: flushChunk.reasoning,
                isReasoning: flushChunk.isReasoning,
                done: false,
              };
            }
            yield {
              chunkId: `chunk-done-${Date.now()}`,
              content: '',
              isReasoning: false,
              done: true,
            };
            return;
          }

          try {
            const parsed = JSON.parse(dataStr);
            const delta = parsed.choices?.[0]?.delta;
            if (!delta) continue;

            // Proveedores como DeepSeek API remota envían reasoning_content nativo
            if (delta.reasoning_content) {
              yield {
                chunkId: parsed.id || `chunk-${Date.now()}`,
                content: '',
                reasoningContent: delta.reasoning_content,
                isReasoning: true,
                done: false,
              };
            }

            if (delta.content) {
              const processed = parser.feed(delta.content, false);
              if (processed.content || processed.reasoning) {
                yield {
                  chunkId: parsed.id || `chunk-${Date.now()}`,
                  content: processed.content,
                  reasoningContent: processed.reasoning,
                  isReasoning: processed.isReasoning,
                  done: false,
                };
              }
            }

            if (delta.tool_calls) {
              yield {
                chunkId: parsed.id || `chunk-${Date.now()}`,
                content: '',
                isReasoning: false,
                done: false,
                toolCalls: delta.tool_calls,
              };
            }
          } catch {
            // Ignorar líneas malformadas
          }
        }
      }

      // Flush final de buffer
      const flushChunk = parser.feed('', true);
      if (flushChunk.content || flushChunk.reasoning) {
        yield {
          chunkId: `chunk-${Date.now()}`,
          content: flushChunk.content,
          reasoningContent: flushChunk.reasoning,
          isReasoning: flushChunk.isReasoning,
          done: false,
        };
      }
      yield {
        chunkId: `chunk-done-${Date.now()}`,
        content: '',
        isReasoning: false,
        done: true,
      };
    } finally {
      reader.releaseLock();
    }
  }

  public async chatComplete(request: AIChatRequest): Promise<AIChatResponse> {
    let fullContent = '';
    let fullReasoning = '';
    const toolCalls: any[] = [];

    for await (const chunk of this.chatStream(request)) {
      if (chunk.content) fullContent += chunk.content;
      if (chunk.reasoningContent) fullReasoning += chunk.reasoningContent;
      if (chunk.toolCalls) toolCalls.push(...chunk.toolCalls);
    }

    return {
      content: fullContent,
      reasoning: fullReasoning || undefined,
      model: request.model || 'gpt-4o',
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
    };
  }

  private formatMessages(messages: AIChatMessage[]): any[] {
    return messages.map((msg) => {
      if (msg.images && msg.images.length > 0) {
        const contentParts: any[] = [{ type: 'text', text: msg.content }];
        for (const img of msg.images) {
          contentParts.push({
            type: 'image_url',
            image_url: {
              url: img.startsWith('data:') ? img : `data:image/png;base64,${img}`,
            },
          });
        }
        return { role: msg.role, content: contentParts };
      }
      return { role: msg.role, content: msg.content };
    });
  }
}
