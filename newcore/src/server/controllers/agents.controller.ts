// ═══════════════════════════════════════════════════════════════
// KODARA MULTI-AGENT SWARM CONTROLLER
// Expone el estado del enjambre de 10 agentes y la pizarra colaborativa
// ═══════════════════════════════════════════════════════════════

import type { FastifyInstance } from 'fastify';
import { SPECIALIZED_AGENT_PROFILES } from '../../agents/roles/profiles.js';
import { AgentWhiteboard } from '../../agents/coordination/agent-whiteboard.js';
import { AgentRole } from '../../agents/agent-definition.interface.js';

export function registerAgentSwarmControllers(app: FastifyInstance) {
  const whiteboard = AgentWhiteboard.getInstance();

  /**
   * GET /api/kodara/swarm/agents
   * Devuelve el catálogo de 10 agentes especializados y sus permisos
   */
  app.get('/api/kodara/swarm/agents', async () => {
    const agents = Object.values(SPECIALIZED_AGENT_PROFILES).map((profile) => ({
      ...profile,
      status: 'IDLE', // IDLE | WORKING | PAUSED
      activeTaskId: null,
      activeWorktree: null,
    }));
    return { success: true, count: agents.length, agents };
  });

  /**
   * GET /api/kodara/swarm/whiteboard
   * Devuelve las notas y bloqueos activos de archivos de la pizarra
   */
  app.get<{ Querystring: { topic?: string; limit?: string } }>('/api/kodara/swarm/whiteboard', async (req) => {
    const topic = req.query.topic;
    const notes = whiteboard.getNotes({ topic });
    const locks = whiteboard.getAllLocks();

    return {
      success: true,
      notesCount: notes.length,
      notes,
      locks,
    };
  });

  /**
   * POST /api/kodara/swarm/whiteboard
   * Publica una nota en la pizarra colaborativa del enjambre
   */
  app.post<{
    Body: {
      authorRole?: AgentRole;
      fromRole?: AgentRole;
      fromAgentId?: string;
      toAgentId?: string;
      topic: string;
      title?: string;
      content: string;
      tags?: string[];
    };
  }>('/api/kodara/swarm/whiteboard', async (req, reply) => {
    const role = req.body.authorRole || req.body.fromRole || 'ORCHESTRATOR';
    const topic = req.body.topic;
    const content = req.body.content;
    const title = req.body.title || topic;

    if (!topic || !content) {
      return reply.code(400).send({ error: 'Faltan campos requeridos (topic, content)' });
    }

    const note = whiteboard.postNote({
      fromAgentId: req.body.fromAgentId || `agent-${role.toLowerCase()}`,
      fromRole: role,
      authorRole: role,
      toAgentId: req.body.toAgentId,
      topic,
      title,
      content,
    } as any);

    return { success: true, note };
  });
}
