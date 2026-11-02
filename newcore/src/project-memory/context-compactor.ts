// ═══════════════════════════════════════════════════════════════
// KODARA PROJECT MEMORY ENGINE: Context Compactor & Session Recovery
// "Your Code. Your AI. Your Rules."
// Compacta el historial conversacional cuando se aproxima al límite
// de contexto del modelo, preservando intenciones, decisiones y tareas.
// ═══════════════════════════════════════════════════════════════

import { CompactedSessionResult } from './memory.interface.js';

export interface MessageLike {
  role: string;
  content: string;
}

export class ContextCompactor {
  /**
   * Determina si el conjunto de mensajes requiere compactación de contexto.
   */
  public static shouldCompact(messages: MessageLike[], maxTokensThreshold = 12000): boolean {
    const totalChars = messages.reduce((acc, m) => acc + (m.content?.length || 0), 0);
    const estimatedTokens = Math.ceil(totalChars / 4);
    return estimatedTokens >= maxTokensThreshold;
  }

  /**
   * Compacta mensajes antiguos en un resumen cognitivo estructurado,
   * preservando verbatim los mensajes más recientes.
   */
  public static compactSession(
    messages: MessageLike[],
    preserveRecentCount = 4,
    metadata?: { activeTasks?: string[]; projectName?: string }
  ): CompactedSessionResult {
    if (messages.length <= preserveRecentCount) {
      const prompt = messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
      return {
        compactedPrompt: prompt,
        preservedRecentMessages: messages,
        summary: 'Sesión breve dentro de los límites de contexto (sin compactación requerida).',
        tokensEstimated: Math.ceil(prompt.length / 4),
      };
    }

    const olderMessages = messages.slice(0, messages.length - preserveRecentCount);
    const recentMessages = messages.slice(messages.length - preserveRecentCount);

    // Extraer intenciones clave y acciones de los mensajes antiguos
    const userIntents: string[] = [];
    const keyActions: string[] = [];

    for (const msg of olderMessages) {
      if (msg.role === 'user') {
        const firstLine = msg.content.trim().split('\n')[0].slice(0, 120);
        if (firstLine) userIntents.push(firstLine);
      } else if (msg.role === 'assistant') {
        if (msg.content.includes('✅') || msg.content.includes('Completado') || msg.content.includes('Fase ')) {
          const matched = msg.content
            .split('\n')
            .filter((l) => l.includes('✅') || l.includes('Completado'))
            .map((l) => l.trim().slice(0, 100));
          keyActions.push(...matched.slice(0, 3));
        }
      }
    }

    const summaryParts: string[] = [
      `### 🧠 Resumen Ejecutivo de Sesión Compactada (Memoria de Sesión)`,
      `**Proyecto**: ${metadata?.projectName || 'Workspace Activo'} | **Mensajes compactados**: ${olderMessages.length}`,
      `\n**Intenciones y Requerimientos Abordados**:`,
      ...userIntents.slice(-6).map((intent) => `- 🎯 "${intent}"`),
    ];

    if (keyActions.length > 0) {
      summaryParts.push(`\n**Hitos y Acciones Clave Completadas**:`);
      summaryParts.push(...Array.from(new Set(keyActions)).slice(-6).map((action) => `- ${action}`));
    }

    if (metadata?.activeTasks && metadata.activeTasks.length > 0) {
      summaryParts.push(`\n**Tareas en Progreso o Pendientes**:`);
      summaryParts.push(...metadata.activeTasks.map((t) => `- ⏳ ${t}`));
    }

    const summary = summaryParts.join('\n');

    const promptParts = [
      summary,
      `\n---\n*Continuación directa del diálogo (últimos ${recentMessages.length} mensajes preservados)*:\n`,
      ...recentMessages.map((m) => `${m.role.toUpperCase()}: ${m.content}`),
    ];

    const compactedPrompt = promptParts.join('\n\n');

    return {
      compactedPrompt,
      preservedRecentMessages: recentMessages,
      summary,
      tokensEstimated: Math.ceil(compactedPrompt.length / 4),
    };
  }
}
