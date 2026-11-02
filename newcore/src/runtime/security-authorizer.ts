// ═══════════════════════════════════════════════════════════════
// KODARA SYSTEM RUNTIME ENGINE: Central Security Authorizer
// "Your Code. Your AI. Your Rules."
// Valida, autoriza y audita cada comando del sistema operativo,
// garantizando confinamiento en el workspace (Zero-Bleed) y
// bloqueando comandos destructivos antes de su invocación física.
// ═══════════════════════════════════════════════════════════════

import { resolve, relative, isAbsolute } from 'path';
import { CoreEventHub } from '../core/core-event-hub.js';

export interface AuthorizationRequest {
  command: string;
  cwd?: string;
  workspaceDir: string;
  executionMode?: 'turbo' | 'supervised';
  agentId?: string;
}

export interface AuthorizationDecision {
  allowed: boolean;
  requiresConfirmation: boolean;
  sanitizedCommand: string;
  effectiveCwd: string;
  reason?: string;
}

export interface RuntimeAuditEntry {
  id: string;
  timestamp: string;
  command: string;
  cwd: string;
  agentId: string;
  decision: 'ALLOWED' | 'CONFIRMATION_REQUIRED' | 'BLOCKED';
  reason?: string;
  durationMs?: number;
  exitCode?: number;
}

export class SecurityAuthorizer {
  private static readonly CATASTROPHIC_PATTERNS = [
    /\brm\s+-rf\s+\/(?:\s|$)/i,
    /\bmkfs\b/i,
    /\bdd\s+if=.*of=\/dev\/[a-z]+/i,
    /(?::\(\)|:\s*\|\s*:)/i, // Forkbomb
    /\bchmod\s+-R\s+777\s+\//i,
    /\bchown\s+-R\s+root\s+\//i,
    /\bshutdown\b/i,
    /\breboot\b/i,
    /\binit\s+0\b/i,
  ];

  private static readonly SENSITIVE_PATTERNS = [
    /\bsudo\b/i,
    /\bsystemctl\s+(?:stop|disable|mask|poweroff)\b/i,
    /\bpkill\b/i,
    /\bkillall\b/i,
    /\bgit\s+reset\s+--hard\b/i,
    /\bgit\s+clean\s+-fdx\b/i,
    /\bdocker\s+(?:system\s+prune|rm\s+-f)\b/i,
  ];

  private static auditHistory: RuntimeAuditEntry[] = [];

  /**
   * Evalúa y autoriza formalmente la ejecución de un comando.
   */
  public static authorize(req: AuthorizationRequest): AuthorizationDecision {
    const rawCmd = req.command.trim();
    const effectiveCwd = req.cwd ? resolve(req.workspaceDir, req.cwd) : resolve(req.workspaceDir);

    // 1. Validar frontera del workspace (Zero-Bleed)
    const rel = relative(resolve(req.workspaceDir), effectiveCwd);
    const isInside = !rel.startsWith('..') && !isAbsolute(rel);
    if (!isInside) {
      const decision: AuthorizationDecision = {
        allowed: false,
        requiresConfirmation: false,
        sanitizedCommand: rawCmd,
        effectiveCwd,
        reason: `Violación Zero-Bleed: El directorio de ejecución (${effectiveCwd}) está fuera del workspace permitido (${req.workspaceDir}).`,
      };
      this.recordAudit(req, 'BLOCKED', decision.reason);
      return decision;
    }

    // 2. Verificar patrones destructivos y catastróficos
    for (const pattern of this.CATASTROPHIC_PATTERNS) {
      if (pattern.test(rawCmd)) {
        const decision: AuthorizationDecision = {
          allowed: false,
          requiresConfirmation: false,
          sanitizedCommand: rawCmd,
          effectiveCwd,
          reason: `Comando prohibido por política de seguridad crítica (patrón catastrófico detectado: ${pattern}).`,
        };
        this.recordAudit(req, 'BLOCKED', decision.reason);
        return decision;
      }
    }

    // 3. Verificar operaciones sensibles en modo supervisado
    let requiresConfirmation = false;
    for (const pattern of this.SENSITIVE_PATTERNS) {
      if (pattern.test(rawCmd)) {
        requiresConfirmation = true;
        break;
      }
    }

    if (requiresConfirmation && req.executionMode === 'supervised') {
      const decision: AuthorizationDecision = {
        allowed: true,
        requiresConfirmation: true,
        sanitizedCommand: rawCmd,
        effectiveCwd,
        reason: 'Operación sensible detectada: requiere confirmación explícita del usuario.',
      };
      this.recordAudit(req, 'CONFIRMATION_REQUIRED', decision.reason);
      return decision;
    }

    // 4. Autorizado para ejecución
    const decision: AuthorizationDecision = {
      allowed: true,
      requiresConfirmation: false,
      sanitizedCommand: rawCmd,
      effectiveCwd,
    };
    this.recordAudit(req, 'ALLOWED');
    return decision;
  }

  public static getAuditLog(limit = 50): RuntimeAuditEntry[] {
    return this.auditHistory.slice(-limit);
  }

  private static recordAudit(
    req: AuthorizationRequest,
    decision: 'ALLOWED' | 'CONFIRMATION_REQUIRED' | 'BLOCKED',
    reason?: string
  ): void {
    const entry: RuntimeAuditEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      command: req.command,
      cwd: req.cwd || req.workspaceDir,
      agentId: req.agentId || 'kodara-runtime',
      decision,
      reason,
    };

    this.auditHistory.push(entry);
    if (this.auditHistory.length > 500) {
      this.auditHistory.shift();
    }

    try {
      CoreEventHub.getInstance().publish({
        type: 'TOOL_CALLED',
        data: {
          runtimeAuthorization: entry,
        },
      });
    } catch {
      // Si el EventHub no está inicializado, no interrumpir
    }
  }
}
