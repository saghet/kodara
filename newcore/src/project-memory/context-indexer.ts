// ═══════════════════════════════════════════════════════════════
// KODARA PROJECT MEMORY ENGINE: Lightweight Context Indexer
// "Your Code. Your AI. Your Rules."
// Recuperación contextual relevante mediante TF-IDF y similitud léxica.
// Evita introducir todo el repositorio indiscriminadamente al modelo.
// ═══════════════════════════════════════════════════════════════

import { MemoryEntry } from './memory.interface.js';

export interface ScoredMemoryEntry {
  entry: MemoryEntry;
  score: number;
}

export class ContextIndexer {
  private static readonly STOP_WORDS = new Set([
    'de', 'la', 'que', 'el', 'en', 'y', 'a', 'los', 'se', 'del', 'las', 'un', 'por', 'con', 'no',
    'una', 'su', 'para', 'es', 'al', 'lo', 'como', 'más', 'o', 'pero', 'sus', 'le', 'ya', 'o',
    'the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'to', 'for', 'of', 'with', 'as',
  ]);

  /**
   * Tokeniza un texto extrayendo términos relevantes en minúsculas.
   */
  public static tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-zA-Z0-9_\u00C0-\u017F\s-]/g, ' ')
      .split(/\s+/)
      .filter((term) => term.length >= 2 && !this.STOP_WORDS.has(term));
  }

  /**
   * Calcula el puntaje de relevancia de una entrada frente a una consulta.
   */
  public static scoreEntry(entry: MemoryEntry, queryTokens: string[]): number {
    if (queryTokens.length === 0) return 1.0;

    const titleTokens = this.tokenize(entry.title);
    const contentTokens = this.tokenize(entry.content);
    const tagTokens = entry.tags.map((t) => t.toLowerCase());

    let score = 0;

    for (const qTerm of queryTokens) {
      // Coincidencia exacta en tags (peso 5.0)
      if (tagTokens.includes(qTerm)) {
        score += 5.0;
      }
      // Coincidencia en título (peso 3.0)
      const titleMatches = titleTokens.filter((t) => t === qTerm || t.includes(qTerm)).length;
      score += titleMatches * 3.0;

      // Coincidencia en contenido (peso 1.0)
      const contentMatches = contentTokens.filter((t) => t === qTerm || t.includes(qTerm)).length;
      score += Math.min(contentMatches, 10) * 1.0;
    }

    return score;
  }

  /**
   * Recupera las entradas más relevantes que se ajusten al presupuesto de tokens.
   */
  public static retrieveRelevant(
    entries: MemoryEntry[],
    query: string,
    maxTokens = 2000,
    limit = 5
  ): ScoredMemoryEntry[] {
    const queryTokens = this.tokenize(query);

    const scored = entries
      .map((entry) => ({
        entry,
        score: this.scoreEntry(entry, queryTokens),
      }))
      .filter((item) => item.score > 0 || queryTokens.length === 0)
      .sort((a, b) => b.score - a.score);

    const results: ScoredMemoryEntry[] = [];
    let estimatedTokens = 0;

    for (const item of scored) {
      if (results.length >= limit) break;

      // Estimación conservadora: 1 token ≈ 4 caracteres
      const entryTokens = Math.ceil((item.entry.title.length + item.entry.content.length) / 4);
      if (estimatedTokens + entryTokens > maxTokens && results.length > 0) {
        continue; // Omitir si excede el presupuesto y ya tenemos al menos una entrada
      }

      results.push(item);
      estimatedTokens += entryTokens;
    }

    return results;
  }
}
