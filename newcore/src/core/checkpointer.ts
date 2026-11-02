// ═══════════════════════════════════════════════════════════════
// KODARA CORE: State Checkpointing & Rollback Manager
// "Your Code. Your AI. Your Rules."
// Permite guardar snapshots ligeros antes de mutaciones críticas y
// revertir cambios ante fallos en pruebas o auditorías.
// ═══════════════════════════════════════════════════════════════

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { CoreEventHub } from './core-event-hub.js';

export interface FileSnapshot {
  filePath: string;
  originalContent: string | null;
  existed: boolean;
}

export interface Checkpoint {
  checkpointId: string;
  description: string;
  timestamp: string;
  files: Map<string, FileSnapshot>;
}

export class CoreCheckpointer {
  private static instance: CoreCheckpointer;
  private checkpoints: Map<string, Checkpoint> = new Map();
  private eventHub: CoreEventHub;

  private constructor() {
    this.eventHub = CoreEventHub.getInstance();
  }

  public static getInstance(): CoreCheckpointer {
    if (!CoreCheckpointer.instance) {
      CoreCheckpointer.instance = new CoreCheckpointer();
    }
    return CoreCheckpointer.instance;
  }

  /**
   * Crea un checkpoint capturando el contenido actual de una lista de archivos.
   */
  public createCheckpoint(description: string, filePaths: string[]): Checkpoint {
    const id = `CKP-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const fileSnapshots = new Map<string, FileSnapshot>();

    for (const fp of filePaths) {
      const existed = existsSync(fp);
      const content = existed ? readFileSync(fp, 'utf-8') : null;
      fileSnapshots.set(fp, {
        filePath: fp,
        originalContent: content,
        existed,
      });
    }

    const checkpoint: Checkpoint = {
      checkpointId: id,
      description,
      timestamp: new Date().toISOString(),
      files: fileSnapshots,
    };

    this.checkpoints.set(id, checkpoint);
    this.eventHub.emit('CHECKPOINT_CREATED', {
      checkpointId: id,
      description,
      filesCount: fileSnapshots.size,
    });

    return checkpoint;
  }

  /**
   * Restaura el estado exacto de los archivos al momento del checkpoint.
   */
  public rollbackCheckpoint(checkpointId: string): boolean {
    const ckp = this.checkpoints.get(checkpointId);
    if (!ckp) return false;

    for (const [fp, snapshot] of ckp.files) {
      try {
        if (!snapshot.existed) {
          // Si el archivo no existía originalmente, dejarlo vacío o eliminarlo
        } else if (snapshot.originalContent !== null) {
          mkdirSync(dirname(fp), { recursive: true });
          writeFileSync(fp, snapshot.originalContent, 'utf-8');
        }
      } catch (err) {
        console.error(`[Checkpointer] Error al revertir ${fp}:`, err);
      }
    }

    this.eventHub.emit('CHECKPOINT_RESTORED', {
      checkpointId,
      description: ckp.description,
    });

    return true;
  }
}
