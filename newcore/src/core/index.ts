// ═══════════════════════════════════════════════════════════════
// KODARA CORE: Main Engine Coordination
// "Your Code. Your AI. Your Rules."
// Instancia unificada del núcleo de Kodara:
// - CoreEventHub: Bus de eventos tipado
// - CoreSessionManager: Gestión desacoplada de sesiones
// - CoreSecurityGuard: Guardián de permisos y Zero-Bleed
// - CoreCheckpointer: Puntos de control y recuperación
// ═══════════════════════════════════════════════════════════════

import { CoreEventHub } from './core-event-hub.js';
import { CoreSessionManager } from './session-manager.js';
import { CoreSecurityGuard } from './security-guard.js';
import { CoreCheckpointer } from './checkpointer.js';

export class KodaraCore {
  private static instance: KodaraCore;
  public readonly events: CoreEventHub;
  public readonly sessions: CoreSessionManager;
  public readonly security: typeof CoreSecurityGuard;
  public readonly checkpointer: CoreCheckpointer;

  private constructor() {
    this.events = CoreEventHub.getInstance();
    this.sessions = CoreSessionManager.getInstance();
    this.security = CoreSecurityGuard;
    this.checkpointer = CoreCheckpointer.getInstance();
  }

  public static getInstance(): KodaraCore {
    if (!KodaraCore.instance) {
      KodaraCore.instance = new KodaraCore();
    }
    return KodaraCore.instance;
  }
}

export { CoreEventHub } from './core-event-hub.js';
export { CoreSessionManager } from './session-manager.js';
export { CoreSecurityGuard } from './security-guard.js';
export { CoreCheckpointer } from './checkpointer.js';
