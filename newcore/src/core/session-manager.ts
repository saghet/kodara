// ═══════════════════════════════════════════════════════════════
// KODARA CORE: Session & Context Manager
// "Your Code. Your AI. Your Rules."
// Administra el ciclo de vida de sesiones de desarrollo, proyectos
// activos, conversaciones e historial, desacoplado del protocolo HTTP.
// ═══════════════════════════════════════════════════════════════

import * as projectsTable from '../db/tables/projects.js';
import { CoreEventHub } from './core-event-hub.js';

export interface ActiveSession {
  sessionId: string;
  projectId?: string;
  projectName?: string;
  workspaceDir: string;
  conversationId: string;
  executionMode: 'turbo' | 'supervised';
  activeModel: string;
  createdAt: string;
  lastActivityAt: string;
}

export class CoreSessionManager {
  private static instance: CoreSessionManager;
  private activeSessions: Map<string, ActiveSession> = new Map();
  private eventHub: CoreEventHub;

  private constructor() {
    this.eventHub = CoreEventHub.getInstance();
  }

  public static getInstance(): CoreSessionManager {
    if (!CoreSessionManager.instance) {
      CoreSessionManager.instance = new CoreSessionManager();
    }
    return CoreSessionManager.instance;
  }

  /**
   * Obtiene o inicializa una sesión de desarrollo activa.
   */
  public async getOrCreateSession(params: {
    sessionId?: string;
    projectId?: string;
    projectName?: string;
    workspaceDir?: string;
    conversationId?: string;
    executionMode?: 'turbo' | 'supervised';
    activeModel?: string;
  }): Promise<ActiveSession> {
    const sId = params.sessionId || params.conversationId || `sess_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    let existing = this.activeSessions.get(sId);
    if (!existing) {
      let effectiveConvId = params.conversationId;
      if (!effectiveConvId) {
        if (params.projectId) {
          const conv = await projectsTable.createConversation(params.projectId, 'Nueva Conversación');
          effectiveConvId = conv.id;
        } else {
          effectiveConvId = `conv_${Date.now()}`;
        }
      }

      existing = {
        sessionId: sId,
        projectId: params.projectId,
        projectName: params.projectName,
        workspaceDir: params.workspaceDir || process.cwd(),
        conversationId: effectiveConvId,
        executionMode: params.executionMode || 'turbo',
        activeModel: params.activeModel || 'deepseek-r1',
        createdAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
      };

      this.activeSessions.set(sId, existing);
      this.eventHub.emit('SESSION_START', existing, {
        sessionId: sId,
        projectId: existing.projectId,
      });
    } else {
      // Actualizar metadatos si han cambiado
      if (params.projectId) existing.projectId = params.projectId;
      if (params.projectName) existing.projectName = params.projectName;
      if (params.workspaceDir) existing.workspaceDir = params.workspaceDir;
      if (params.executionMode) existing.executionMode = params.executionMode;
      if (params.activeModel) existing.activeModel = params.activeModel;
      existing.lastActivityAt = new Date().toISOString();
    }

    return existing;
  }

  public getSession(sessionId: string): ActiveSession | undefined {
    return this.activeSessions.get(sessionId);
  }

  public closeSession(sessionId: string): boolean {
    const s = this.activeSessions.get(sessionId);
    if (s) {
      this.activeSessions.delete(sessionId);
      this.eventHub.emit('SESSION_END', { sessionId }, { sessionId, projectId: s.projectId });
      return true;
    }
    return false;
  }
}
