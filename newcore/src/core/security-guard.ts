// ═══════════════════════════════════════════════════════════════
// KODARA CORE: Central Security Guard & Permission Boundary
// "Your Code. Your AI. Your Rules."
// Valida cada operación física, restringe modificaciones al workspace
// activo (Zero-Bleed) y audita comandos contra la lista de autorización.
// ═══════════════════════════════════════════════════════════════

import { resolve, relative, isAbsolute, normalize } from 'path';
import { existsSync } from 'fs';
import { ProjectBoundaryGuard } from '../kodara/security/project-boundary-guard.js';

export interface CommandAuthorization {
  allowed: boolean;
  requiresConfirmation: boolean;
  reason?: string;
  sanitizedCommand: string;
}

export class CoreSecurityGuard {
  private static readonly DISALLOWED_PATTERNS = [
    /\brm\s+-rf\s+\/(?:\s|$)/i,
    /\bmkfs\b/i,
    /\bdd\s+if=.*of=\/dev\/[a-z]+/i,
    /(?::\(\)|:\s*\|\s*:)/i, // Forkbomb
    /\bchmod\s+-R\s+777\s+\//i,
    /\bchown\s+-R\s+root\s+\//i,
  ];

  private static readonly SENSITIVE_PATTERNS = [
    /\bsudo\b/i,
    /\bsystemctl\s+(?:stop|disable|mask)\b/i,
    /\bpkill\b/i,
    /\bkillall\b/i,
    /\bgit\s+reset\s+--hard\b/i,
    /\bgit\s+clean\s+-fdx\b/i,
  ];

  /**
   * Garantiza que cualquier ruta objetivo resida estrictamente dentro de la raíz del proyecto.
   * Lanza un error de seguridad si detecta path traversal o accesos externos.
   */
  public static assertPathInsideWorkspace(
    workspaceDir: string,
    targetPath: string,
    operationName = 'file_operation'
  ): string {
    const canonicalWorkspace = resolve(workspaceDir);
    const resolvedTarget = isAbsolute(targetPath)
      ? resolve(targetPath)
      : resolve(canonicalWorkspace, targetPath);

    const rel = relative(canonicalWorkspace, resolvedTarget);
    const isInside = !rel.startsWith('..') && !isAbsolute(rel);

    if (!isInside && resolvedTarget !== canonicalWorkspace) {
      throw new Error(
        `[SECURITY ZERO-BLEED] Operación '${operationName}' denegada: ` +
          `La ruta '${resolvedTarget}' se encuentra fuera de la frontera autorizada del workspace '${canonicalWorkspace}'.`
      );
    }

    return resolvedTarget;
  }

  /**
   * Evalúa la seguridad de un comando antes de pasarlo al runtime del sistema operativo.
   */
  public static authorizeCommand(command: string, executionMode: 'turbo' | 'supervised' = 'turbo'): CommandAuthorization {
    const trimmed = command.trim();

    // 1. Verificar comandos prohibidos terminantemente
    for (const pattern of this.DISALLOWED_PATTERNS) {
      if (pattern.test(trimmed)) {
        return {
          allowed: false,
          requiresConfirmation: false,
          reason: `Comando catastrófico o prohibido por las políticas de seguridad de Kodara (${pattern.source}).`,
          sanitizedCommand: trimmed,
        };
      }
    }

    // 2. Verificar comandos sensibles
    const isSensitive = this.SENSITIVE_PATTERNS.some((p) => p.test(trimmed));
    if (isSensitive) {
      if (executionMode === 'supervised') {
        return {
          allowed: true,
          requiresConfirmation: true,
          reason: 'Operación sensible detectada en Modo Supervisado.',
          sanitizedCommand: trimmed,
        };
      }
    }

    return {
      allowed: true,
      requiresConfirmation: false,
      sanitizedCommand: trimmed,
    };
  }

  /**
   * Carga las directivas de reglas locales (.kodararules) si existen en el workspace.
   */
  public static loadProjectRules(workspaceDir: string): string | null {
    return ProjectBoundaryGuard.loadProjectRules(workspaceDir);
  }
}
