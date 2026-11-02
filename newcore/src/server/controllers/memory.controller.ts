// ═══════════════════════════════════════════════════════════════
// KODARA CONTROLLERS: Dual Memory (Project & Core Memory)
// "Your Code. Your AI. Your Rules."
// Desacopla la gestión de memoria de proyectos y memoria central.
// ═══════════════════════════════════════════════════════════════

import { FastifyInstance } from 'fastify';
import { KodaraProjectMemory } from '../../kodara/evolution/project-memory.js';
import { KodaraCoreMemory } from '../../kodara/evolution/core-memory.js';

export function registerMemoryRoutes(app: FastifyInstance): void {
  // ── Kodara Project Memory ──
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
