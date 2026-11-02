// ═══════════════════════════════════════════════════════════════
// KODARA AI PROVIDER ENGINE: Progressive Reasoning Parser (<think>)
// "Your Code. Your AI. Your Rules."
// Parsea en streaming los bloques de razonamiento profundo emitidos
// por DeepSeek-R1, separando la deliberación interna del resultado final.
// ═══════════════════════════════════════════════════════════════

export interface ParsedChunk {
  content: string;
  reasoning: string;
  isReasoning: boolean;
  transitionedToFinal: boolean;
}

export class StreamingReasoningParser {
  private inThinkBlock = false;
  private thinkClosed = false;
  private buffer = '';
  private accumulatedReasoning = '';
  private accumulatedContent = '';

  /**
   * Procesa un fragmento de texto crudo entrante y determina si pertenece
   * al proceso de pensamiento (<think>) o a la respuesta final visible.
   */
  public feed(chunkText: string, flush = false): ParsedChunk {
    this.buffer += chunkText;
    let content = '';
    let reasoning = '';
    let transitioned = false;

    if (flush) {
      if (this.inThinkBlock) {
        reasoning += this.buffer;
        this.accumulatedReasoning += this.buffer;
      } else {
        content += this.buffer;
        this.accumulatedContent += this.buffer;
      }
      this.buffer = '';
      return {
        content,
        reasoning,
        isReasoning: this.inThinkBlock,
        transitionedToFinal: false,
      };
    }

    // 1. Antes de abrir <think>
    if (!this.inThinkBlock && !this.thinkClosed) {
      if (this.buffer.includes('<think>')) {
        const parts = this.buffer.split('<think>');
        content += parts[0];
        this.accumulatedContent += parts[0];
        this.buffer = parts.slice(1).join('<think>');
        this.inThinkBlock = true;
      } else {
        // Verificar si el búfer actual es un prefijo parcial de "<think>" (ej. "<", "<th", "<think")
        let isPotentialPrefix = false;
        for (let i = 1; i < '<think>'.length; i++) {
          if ('<think>'.startsWith(this.buffer)) {
            isPotentialPrefix = true;
            break;
          }
        }

        if (isPotentialPrefix) {
          // Mantener en el búfer a la espera del próximo chunk
          return { content: '', reasoning: '', isReasoning: false, transitionedToFinal: false };
        } else {
          // No es prefijo de apertura: emitir como contenido
          content += this.buffer;
          this.accumulatedContent += this.buffer;
          this.buffer = '';
        }
      }
    }

    // 2. Dentro del bloque de pensamiento <think>...</think>
    if (this.inThinkBlock) {
      if (this.buffer.includes('</think>')) {
        const parts = this.buffer.split('</think>');
        reasoning += parts[0];
        this.accumulatedReasoning += parts[0];
        this.buffer = parts.slice(1).join('</think>').trimStart();
        this.inThinkBlock = false;
        this.thinkClosed = true;
        transitioned = true;

        if (this.buffer.length > 0) {
          content += this.buffer;
          this.accumulatedContent += this.buffer;
          this.buffer = '';
        }
      } else {
        // Verificar si la cola del búfer coincide parcialmente con el prefijo de "</think>" (ej. "</th")
        let matchLen = 0;
        for (let len = Math.min(this.buffer.length, '</think>'.length - 1); len >= 1; len--) {
          const tail = this.buffer.slice(-len);
          if ('</think>'.startsWith(tail)) {
            matchLen = len;
            break;
          }
        }

        if (matchLen > 0) {
          const emitLen = this.buffer.length - matchLen;
          const toEmit = this.buffer.slice(0, emitLen);
          this.buffer = this.buffer.slice(emitLen);
          if (toEmit) {
            reasoning += toEmit;
            this.accumulatedReasoning += toEmit;
          }
        } else {
          reasoning += this.buffer;
          this.accumulatedReasoning += this.buffer;
          this.buffer = '';
        }
      }
    } else if (this.thinkClosed) {
      content += this.buffer;
      this.accumulatedContent += this.buffer;
      this.buffer = '';
    }

    return {
      content,
      reasoning,
      isReasoning: this.inThinkBlock,
      transitionedToFinal: transitioned,
    };
  }

  public flush(): { content: string; reasoning: string } {
    const remaining = this.buffer;
    this.buffer = '';
    if (this.inThinkBlock) {
      this.accumulatedReasoning += remaining;
      return { content: '', reasoning: remaining };
    }
    this.accumulatedContent += remaining;
    return { content: remaining, reasoning: '' };
  }

  public getAccumulatedReasoning(): string {
    return this.accumulatedReasoning;
  }

  public getAccumulatedContent(): string {
    return this.accumulatedContent;
  }
}
