// ═══════════════════════════════════════════════════════════════
// KODARA MULTI-AGENT SYSTEM: Inter-Agent Whiteboard & Coordination
// "Your Code. Your AI. Your Rules."
// Pizarra compartida, paso de mensajes estructurados entre agentes
// y sistema de bloqueos de archivos en memoria para prevenir conflictos.
// ═══════════════════════════════════════════════════════════════

import { WhiteboardNote, AgentRole } from '../agent-definition.interface.js';
import { CoreEventHub } from '../../core/core-event-hub.js';

export class AgentWhiteboard {
  private static instance: AgentWhiteboard;
  private notes: WhiteboardNote[] = [];
  private fileLocks = new Map<string, { agentId: string; lockedAt: number }>();

  private constructor() {}

  public static getInstance(): AgentWhiteboard {
    if (!AgentWhiteboard.instance) {
      AgentWhiteboard.instance = new AgentWhiteboard();
    }
    return AgentWhiteboard.instance;
  }

  /**
   * Publica una nota o mensaje en la pizarra compartida.
   */
  public postNote(noteInput: Omit<WhiteboardNote, 'id' | 'timestamp'>): WhiteboardNote {
    const note: WhiteboardNote = {
      ...noteInput,
      id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };

    this.notes.push(note);
    if (this.notes.length > 500) {
      this.notes.shift();
    }

    try {
      CoreEventHub.getInstance().publish({
        type: 'AGENT_MESSAGE',
        data: {
          noteId: note.id,
          fromAgentId: note.fromAgentId,
          fromRole: note.fromRole,
          toAgentId: note.toAgentId,
          topic: note.topic,
          content: note.content,
        },
      });
    } catch {}

    return note;
  }

  /**
   * Lee notas de la pizarra con filtros opcionales.
   */
  public getNotes(filter?: {
    toAgentId?: string;
    topic?: string;
    fromRole?: AgentRole;
  }): WhiteboardNote[] {
    return this.notes.filter((note) => {
      if (filter?.toAgentId && note.toAgentId !== filter.toAgentId && note.toAgentId !== undefined) {
        return false;
      }
      if (filter?.topic && !note.topic.toLowerCase().includes(filter.topic.toLowerCase())) {
        return false;
      }
      if (filter?.fromRole && note.fromRole !== filter.fromRole) {
        return false;
      }
      return true;
    });
  }

  /**
   * Intenta adquirir un bloqueo exclusivo sobre un archivo para evitar modificaciones simultáneas.
   */
  public acquireFileLock(filePath: string, agentId: string): boolean {
    const existing = this.fileLocks.get(filePath);
    if (existing && existing.agentId !== agentId) {
      // Si el bloqueo tiene más de 120 segundos, expirarlo automáticamente
      if (Date.now() - existing.lockedAt > 120000) {
        this.fileLocks.delete(filePath);
      } else {
        return false; // Bloqueado por otro agente
      }
    }

    this.fileLocks.set(filePath, { agentId, lockedAt: Date.now() });
    return true;
  }

  /**
   * Libera el bloqueo de un archivo.
   */
  public releaseFileLock(filePath: string, agentId: string): boolean {
    const existing = this.fileLocks.get(filePath);
    if (existing && existing.agentId === agentId) {
      this.fileLocks.delete(filePath);
      return true;
    }
    return false;
  }

  /**
   * Consulta el estado de bloqueo de un archivo.
   */
  public isFileLocked(filePath: string): { locked: boolean; heldBy?: string } {
    const existing = this.fileLocks.get(filePath);
    if (!existing) return { locked: false };
    if (Date.now() - existing.lockedAt > 120000) {
      this.fileLocks.delete(filePath);
      return { locked: false };
    }
    return { locked: true, heldBy: existing.agentId };
  }

  public clearNotes(): void {
    this.notes = [];
    this.fileLocks.clear();
  }
}
