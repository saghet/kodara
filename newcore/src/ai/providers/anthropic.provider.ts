// ═══════════════════════════════════════════════════════════════
// KODARA AI PROVIDER ENGINE: Anthropic Provider
// "Your Code. Your AI. Your Rules."
// Soporte para modelos Claude de Anthropic (Claude 3.5 Sonnet,
// Claude 3.7 con Extended Thinking, etc.) mediante Messages API.
// ═══════════════════════════════════════════════════════════════

import {
  AIProvider,
  AICapabilities,
  AIChatRequest,
  AIStreamChunk,
  AIChatResponse,
  AIChatMessage,
} from '../provider.interface.js';

export class AnthropicProvider implements AIProvider {
  public readonly id = 'anthropic';
  public readonly name = 'Anthropic Claude';
  private readonly baseUrl: string;
  private readonly apiKey?: string;

  constructor(options?: { baseUrl?: string; apiKey?: string }) {
    this.baseUrl = (options?.baseUrl || 'https://api.anthropic.com/v1').replace(/\/$/, '');
    this.apiKey = options?.apiKey || process.env.ANTHROPIC_API_KEY || '';
  }

  public getCapabilities(model?: string): AICapabilities {
    const isThinking = model ? /3-7/i.test(model) : false;
    return {
      toolCalling: true,
      streaming: true,
      reasoning: isThinking,
      longContext: true,
      multimodal: true,
      structuredOutput: true,
    };
  }

  public async isAvailable(): Promise<boolean> {
    return Boolean(this.apiKey && this.apiKey.length > 10);
  }

  public async *chatStream(request: AIChatRequest): AsyncIterable<AIStreamChunk> {
    const endpoint = `${this.baseUrl}/messages`;
    const model = request.model || 'claude-3-5-sonnet-20241022';

    let systemPrompt: string | undefined = undefined;
    const formattedMessages: any[] = [];

    for (const msg of request.messages) {
      if (msg.role === 'system') {
        systemPrompt = systemPrompt ? `${systemPrompt}\n\n${msg.content}` : msg.content;
      } else {
        if (msg.images && msg.images.length > 0) {
          const contentParts: any[] = [];
          for (const img of msg.images) {
            contentParts.push({
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/png',
                data: img.replace(/^data:image\/[a-z]+;base64,/, ''),
              },
            });
          }
          contentParts.push({ type: 'text', text: msg.content });
          formattedMessages.push({ role: msg.role, content: contentParts });
        } else {
          formattedMessages.push({ role: msg.role, content: msg.content });
        }
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey || '',
      'anthropic-version': '2023-06-01',
    };

    const payload: any = {
      model,
      messages: formattedMessages,
      max_tokens: request.maxTokens ?? 4096,
      stream: true,
      temperature: request.temperature ?? 0.7,
    };

    if (systemPrompt) {
      payload.system = systemPrompt;
    }

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
      throw new Error(`Anthropic Provider HTTP ${resp.status}: ${errorText}`);
    }

    if (!resp.body) {
      throw new Error('Anthropic Provider returned an empty response body stream.');
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

          try {
            const event = JSON.parse(dataStr);

            if (event.type === 'content_block_delta') {
              if (event.delta?.type === 'text_delta') {
                yield {
                  chunkId: `chunk-${Date.now()}`,
                  content: event.delta.text,
                  isReasoning: false,
                  done: false,
                };
              } else if (event.delta?.type === 'thinking_delta') {
                yield {
                  chunkId: `chunk-${Date.now()}`,
                  content: '',
                  reasoningContent: event.delta.thinking,
                  isReasoning: true,
                  done: false,
                };
              }
            } else if (event.type === 'message_stop') {
              yield {
                chunkId: `chunk-done-${Date.now()}`,
                content: '',
                isReasoning: false,
                done: true,
              };
              return;
            }
          } catch {
            // Ignorar eventos no parseables
          }
        }
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

    for await (const chunk of this.chatStream(request)) {
      if (chunk.content) fullContent += chunk.content;
      if (chunk.reasoningContent) fullReasoning += chunk.reasoningContent;
    }

    return {
      content: fullContent,
      reasoning: fullReasoning || undefined,
      model: request.model || 'claude-3-5-sonnet-20241022',
    };
  }
}
