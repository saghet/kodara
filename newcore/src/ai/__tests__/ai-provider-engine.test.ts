// ═══════════════════════════════════════════════════════════════
// KODARA TEST SUITE: AI Provider Engine & Reasoning Parser
// "Your Code. Your AI. Your Rules."
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from 'bun:test';
import {
  AIProviderEngine,
  StreamingReasoningParser,
  AIProvider,
  AICapabilities,
  AIChatRequest,
  AIStreamChunk,
  AIChatResponse,
} from '../index.js';

describe('StreamingReasoningParser', () => {
  it('separa limpiamente el razonamiento <think>...</think> del contenido visible', () => {
    const parser = new StreamingReasoningParser();

    const chunk1 = parser.feed('<think>Analizando arquitectura y protocolos...');
    expect(chunk1.isReasoning).toBe(true);
    expect(chunk1.reasoning).toContain('Analizando');
    expect(chunk1.content).toBe('');

    const chunk2 = parser.feed(' El buffer circular previene desbordamiento.</think># Solución');
    expect(chunk2.reasoning).toContain('previene desbordamiento');
    expect(chunk2.content).toContain('# Solución');
    expect(chunk2.isReasoning).toBe(false);

    const chunk3 = parser.feed('\n\nImplementación completa en TypeScript.');
    expect(chunk3.content).toContain('Implementación completa');
    expect(chunk3.isReasoning).toBe(false);

    expect(parser.getAccumulatedReasoning()).toContain('Analizando arquitectura');
    expect(parser.getAccumulatedContent()).toContain('# Solución');
  });

  it('maneja etiquetas <think> fragmentadas a través de múltiples chunks de stream', () => {
    const parser = new StreamingReasoningParser();

    const c1 = parser.feed('<th');
    expect(c1.content).toBe('');
    expect(c1.reasoning).toBe('');

    const c2 = parser.feed('ink>Pensamiento profundo de DeepSeek');
    expect(c2.isReasoning).toBe(true);
    expect(c2.reasoning).toContain('Pensamiento profundo');

    const c3 = parser.feed('</th');
    expect(c3.content).toBe('');

    const c4 = parser.feed('ink>Contenido post-pensamiento.');
    expect(c4.content).toContain('Contenido post-pensamiento');
    expect(c4.isReasoning).toBe(false);
  });

  it('hace flush del búfer si el stream finaliza sin cerrar </think>', () => {
    const parser = new StreamingReasoningParser();
    parser.feed('<think>Pensamiento sin tag de cierre');
    const flushed = parser.feed('', true);
    expect(flushed.isReasoning).toBe(true);
    expect(parser.getAccumulatedReasoning()).toContain('Pensamiento sin tag de cierre');
  });
});

describe('AIProviderEngine Facade & Registry', () => {
  const engine = AIProviderEngine.getInstance();

  it('inicializa con los 4 proveedores estándar y DeepSeek-R1 como predeterminado', () => {
    const defaultProvider = engine.getDefaultProvider();
    expect(defaultProvider.id).toBe('deepseek-r1');
    expect(defaultProvider.name).toContain('DeepSeek-R1');

    const allProviders = engine.getAllProviders();
    expect(allProviders.length).toBeGreaterThanOrEqual(4);

    const providerIds = allProviders.map((p) => p.id);
    expect(providerIds).toContain('deepseek-r1');
    expect(providerIds).toContain('ollama');
    expect(providerIds).toContain('openai-compatible');
    expect(providerIds).toContain('anthropic');
  });

  it('resuelve automáticamente el proveedor idóneo según el nombre del modelo', () => {
    expect(engine.resolveProviderForModel('deepseek-r1:latest').id).toBe('deepseek-r1');
    expect(engine.resolveProviderForModel('deepseek-reasoner').id).toBe('deepseek-r1');
    expect(engine.resolveProviderForModel('claude-3-5-sonnet-20241022').id).toBe('anthropic');
    expect(engine.resolveProviderForModel('gpt-4o').id).toBe('openai-compatible');
    expect(engine.resolveProviderForModel('o1-mini').id).toBe('openai-compatible');
    expect(engine.resolveProviderForModel('llama3:latest').id).toBe('ollama');
    expect(engine.resolveProviderForModel(undefined).id).toBe('deepseek-r1');
  });

  it('detecta correctamente las capacidades de cada modelo', () => {
    const r1Caps = engine.detectCapabilities('deepseek-r1:latest');
    expect(r1Caps.reasoning).toBe(true);
    expect(r1Caps.streaming).toBe(true);
    expect(r1Caps.toolCalling).toBe(true);

    const llamaCaps = engine.detectCapabilities('llama3:latest');
    expect(llamaCaps.reasoning).toBe(false);
    expect(llamaCaps.streaming).toBe(true);

    const o1Caps = engine.detectCapabilities('o1-preview');
    expect(o1Caps.reasoning).toBe(true);
  });

  it('permite registrar y utilizar un proveedor personalizado extensible', async () => {
    class MockCustomProvider implements AIProvider {
      public readonly id = 'custom-test-provider';
      public readonly name = 'Custom Test';

      public getCapabilities(): AICapabilities {
        return {
          toolCalling: true,
          streaming: true,
          reasoning: true,
          longContext: false,
          multimodal: false,
          structuredOutput: true,
        };
      }

      public async isAvailable(): Promise<boolean> {
        return true;
      }

      public async *chatStream(request: AIChatRequest): AsyncIterable<AIStreamChunk> {
        yield {
          chunkId: 'chunk-1',
          content: '',
          reasoningContent: 'Razonamiento simulado',
          isReasoning: true,
          done: false,
        };
        yield {
          chunkId: 'chunk-2',
          content: `Echo: ${request.messages[0].content}`,
          isReasoning: false,
          done: false,
        };
        yield {
          chunkId: 'chunk-done',
          content: '',
          isReasoning: false,
          done: true,
        };
      }

      public async chatComplete(request: AIChatRequest): Promise<AIChatResponse> {
        return {
          content: `Echo: ${request.messages[0].content}`,
          reasoning: 'Razonamiento simulado',
          model: 'custom-model',
        };
      }
    }

    engine.registerProvider(new MockCustomProvider());
    const registered = engine.getProvider('custom-test-provider');
    expect(registered).toBeDefined();

    const response = await engine.chatComplete(
      { messages: [{ role: 'user', content: 'Prueba de integración' }] },
      'custom-test-provider'
    );
    expect(response.content).toBe('Echo: Prueba de integración');
    expect(response.reasoning).toBe('Razonamiento simulado');

    const streamChunks: AIStreamChunk[] = [];
    for await (const chunk of engine.chatStream(
      { messages: [{ role: 'user', content: 'Stream test' }] },
      'custom-test-provider'
    )) {
      streamChunks.push(chunk);
    }
    expect(streamChunks.length).toBe(3);
    expect(streamChunks[0].reasoningContent).toBe('Razonamiento simulado');
    expect(streamChunks[1].content).toBe('Echo: Stream test');
  });
});
