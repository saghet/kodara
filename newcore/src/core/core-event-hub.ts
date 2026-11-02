// ═══════════════════════════════════════════════════════════════
// KODARA CORE: Typed Event Hub
// "Your Code. Your AI. Your Rules."
// Bus central de eventos pub/sub tipado para agentes, herramientas,
// streams en vivo, auditoría y recuperación.
// ═══════════════════════════════════════════════════════════════

export type CoreEventType =
  | 'SESSION_START'
  | 'SESSION_END'
  | 'MESSAGE_RECEIVED'
  | 'MESSAGE_CHUNK'
  | 'PLAN_CREATED'
  | 'PLAN_PHASE_STARTED'
  | 'PLAN_PHASE_PROGRESS'
  | 'PLAN_PHASE_COMPLETED'
  | 'PLAN_COMPLETED'
  | 'PLAN_FAILED'
  | 'TOOL_CALL_PROPOSED'
  | 'TOOL_CALL_APPROVED'
  | 'TOOL_CALL_EXECUTED'
  | 'SECURITY_VIOLATION_BLOCKED'
  | 'CHECKPOINT_CREATED'
  | 'CHECKPOINT_RESTORED'
  | 'TELEMETRY_SAMPLE'
  | 'AGENT_STATE_CHANGED';

export interface CoreEvent<T = any> {
  eventId: string;
  type: CoreEventType;
  timestamp: string;
  source: string;
  sessionId?: string;
  projectId?: string;
  payload: T;
}

export type CoreEventListener<T = any> = (event: CoreEvent<T>) => void | Promise<void>;

export class CoreEventHub {
  private static instance: CoreEventHub;
  private listeners: Map<CoreEventType | '*', Set<CoreEventListener>> = new Map();
  private historyRingBuffer: CoreEvent[] = [];
  private readonly maxHistory = 500;

  private constructor() {}

  public static getInstance(): CoreEventHub {
    if (!CoreEventHub.instance) {
      CoreEventHub.instance = new CoreEventHub();
    }
    return CoreEventHub.instance;
  }

  public on<T = any>(type: CoreEventType | '*', listener: CoreEventListener<T>): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);
    return () => this.off(type, listener);
  }

  public off<T = any>(type: CoreEventType | '*', listener: CoreEventListener<T>): void {
    const set = this.listeners.get(type);
    if (set) {
      set.delete(listener);
    }
  }

  public emit<T = any>(
    type: CoreEventType,
    payload: T,
    options?: { source?: string; sessionId?: string; projectId?: string }
  ): CoreEvent<T> {
    const event: CoreEvent<T> = {
      eventId: `EVT-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      type,
      timestamp: new Date().toISOString(),
      source: options?.source || 'kodara-core',
      sessionId: options?.sessionId,
      projectId: options?.projectId,
      payload,
    };

    this.historyRingBuffer.push(event);
    if (this.historyRingBuffer.length > this.maxHistory) {
      this.historyRingBuffer.shift();
    }

    // Notificar oyentes específicos
    const specificListeners = this.listeners.get(type);
    if (specificListeners) {
      for (const listener of specificListeners) {
        try {
          listener(event);
        } catch (err) {
          console.error(`[CoreEventHub] Error en listener para ${type}:`, err);
        }
      }
    }

    // Notificar oyentes comodín (*)
    const wildcardListeners = this.listeners.get('*');
    if (wildcardListeners) {
      for (const listener of wildcardListeners) {
        try {
          listener(event);
        } catch (err) {
          console.error(`[CoreEventHub] Error en wildcard listener para ${type}:`, err);
        }
      }
    }

    return event;
  }

  public getRecentEvents(limit = 50, filterType?: CoreEventType): CoreEvent[] {
    const slice = filterType
      ? this.historyRingBuffer.filter((e) => e.type === filterType)
      : this.historyRingBuffer;
    return slice.slice(-limit);
  }

  public formatSSE(event: CoreEvent): string {
    return `data: ${JSON.stringify(event)}\n\n`;
  }
}
