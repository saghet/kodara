// ═══════════════════════════════════════════════════════════════
// KODARA CONTROLLERS: Dual Memory (Project & Core Memory)
// "Your Code. Your AI. Your Rules."
// Desacopla la gestión de memoria de proyectos y memoria central.
// ═══════════════════════════════════════════════════════════════

import { FastifyInstance } from 'fastify';
import { KodaraProjectMemory } from '../../kodara/evolution/project-memory.js';
import { KodaraCoreMemory } from '../../kodara/evolution/core-memory.js';
import { ProjectMemoryEngine, MemoryTier, ADRStatus } from '../../project-memory/index.js';

export function registerMemoryRoutes(app: FastifyInstance): void {
  const pmem = ProjectMemoryEngine.getInstance();

  // ── Módulo Jerárquico de Memoria en 6 Dimensiones (Fase 7) ──
  app.get<{ Params: { tier: MemoryTier }; Querystring: { projectId: string } }>(
    '/api/kodara/memory/tiers/:tier',
    async (req, reply) => {
      const projId = req.query?.projectId || 'proj_workspace';
      return await pmem.listEntriesByTier(projId, req.params.tier);
    }
  );

  app.post<{
    Params: { tier: MemoryTier };
    Body: { projectId: string; title: string; content: string; tags?: string[]; metadata?: any };
  }>('/api/kodara/memory/tiers/:tier', async (req) => {
    const entry = await pmem.storeEntry({
      projectId: req.body.projectId,
      tier: req.params.tier,
      title: req.body.title,
      content: req.body.content,
      tags: req.body.tags || [],
      metadata: req.body.metadata || {},
    });
    return { ok: true, entry };
  });

  // ── Architectural Decision Records (ADRs) ──
  app.get<{ Querystring: { projectId: string } }>('/api/kodara/memory/adrs', async (req) => {
    const projId = req.query?.projectId || 'proj_workspace';
    return await pmem.listADRs(projId);
  });

  app.post<{
    Body: {
      projectId: string;
      adrNumber: number;
      title: string;
      status: ADRStatus;
      context: string;
      decision: string;
      consequences: string;
      authorAgent: string;
    };
  }>('/api/kodara/memory/adrs', async (req) => {
    const adr = await pmem.recordADR(req.body);
    return { ok: true, adr };
  });

  app.post<{ Params: { id: string }; Body: { status: ADRStatus } }>(
    '/api/kodara/memory/adrs/:id/status',
    async (req) => {
      const updated = await pmem.updateADRStatus(req.params.id, req.body.status);
      return { ok: true, adr: updated };
    }
  );

  // ── Recuperación Contextual Relevante (RAG Ligero) ──
  app.post<{
    Body: { projectId: string; query: string; tiers?: MemoryTier[]; limit?: number; maxTokens?: number };
  }>('/api/kodara/memory/retrieve', async (req) => {
    const contextPrompt = await pmem.retrieveRelevantContext(req.body);
    return { ok: true, contextPrompt };
  });

  // ── Compactación de Sesión ──
  app.post<{
    Body: { messages: any[]; metadata?: any };
  }>('/api/kodara/memory/compact', async (req) => {
    const compacted = pmem.compactConversation(req.body.messages, req.body.metadata);
    return { ok: true, compacted };
  });

  // ── Kodara Project Memory (Legacy & Evolution) ──
  app.get<{ Querystring: { projectId?: string } }>('/api/kodara/memory/project', async (req) => {
    return await KodaraProjectMemory.listMemories(req.query?.projectId);
  });

  app.post<{
    Body: {
      projectId: string;
      projectName: string;
      language?: 'rust' | 'typescript' | 'python' | 'security' | 'general' | 'go';
      errorSignature: string;
      errorContext: string;
      rootCause: string;
      verifiedFix: string;
    };
  }>('/api/kodara/memory/project', async (req) => {
    const entry = await KodaraProjectMemory.recordApplicationLearning(req.body as any);
    return { ok: true, entry };
  });

  // ── Kodara Core Memory ──
  app.get('/api/kodara/memory/core', async () => {
    return await KodaraCoreMemory.listCoreMemories();
  });

  app.post<{
    Body: {
      ideComponent: string;
      issueSignature: string;
      telemetrySummary: string;
      rootCause: string;
      supervisedProposal: string;
    };
  }>('/api/kodara/memory/core', async (req) => {
    const entry = await KodaraCoreMemory.recordInternalIdeIssue(req.body);
    return { ok: true, entry };
  });

  app.post<{
    Params: { id: string };
    Body: { status: 'APPROVED' | 'REJECTED' };
  }>('/api/kodara/memory/core/:id/decision', async (req) => {
    await KodaraCoreMemory.updateApprovalStatus(req.params.id, req.body.status);
    return { ok: true, entries: await KodaraCoreMemory.listCoreMemories() };
  });
}
