// ═══════════════════════════════════════════════════════════════
// KODARA CONTROLLERS: Projects, Conversations & Filesystem
// "Your Code. Your AI. Your Rules."
// Desacopla la gestión de proyectos, árbol de directorios y
// mensajes conversacionales del monolito server.ts.
// ═══════════════════════════════════════════════════════════════

import { FastifyInstance } from 'fastify';
import { resolve, join, dirname } from 'path';
import { existsSync, mkdirSync, readdirSync } from 'fs';
import * as projectsTable from '../../db/tables/projects.js';
import { ProjectBoundaryGuard } from '../../kodara/security/project-boundary-guard.js';
import { KodaraPlanExecutor } from '../../kodara/plan-executor.js';
import { KodaraOrderCompiler } from '../../kodara/order-compiler.js';

export function registerProjectRoutes(app: FastifyInstance): void {
  // ── Explorador de Directorios del Sistema de Archivos ──
  app.get<{ Querystring: { path?: string } }>('/api/fs/directories', async (req, reply) => {
    const rootUser = '/home/saghet';
    let target = req.query.path ? resolve(req.query.path) : '/home/saghet/Documents';

    if (!target.startsWith(rootUser)) {
      target = '/home/saghet/Documents';
    }

    if (!existsSync(target)) {
      try {
        mkdirSync(target, { recursive: true });
      } catch {
        target = rootUser;
      }
    }

    try {
      const entries = readdirSync(target, { withFileTypes: true });
      const directories = entries
        .filter((d) => d.isDirectory() && !d.name.startsWith('.'))
        .map((d) => {
          const full = join(target, d.name);
          let subdirsCount = 0;
          try {
            subdirsCount = readdirSync(full, { withFileTypes: true }).filter((s) => s.isDirectory() && !s.name.startsWith('.')).length;
          } catch {}
          return {
            name: d.name,
            path: full,
            subdirsCount,
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name));

      const parentPath = target !== rootUser ? dirname(target) : null;

      return {
        currentPath: target,
        parentPath,
        directories,
      };
    } catch (err: any) {
      return reply.code(500).send({ error: `Error leyendo directorios: ${err.message}` });
    }
  });

  app.post<{ Body: { parentPath: string; folderName: string } }>('/api/fs/mkdir', async (req, reply) => {
    const { parentPath, folderName } = req.body || {};
    if (!folderName || !folderName.trim()) {
      return reply.code(400).send({ error: 'El nombre de la carpeta es obligatorio' });
    }
    const cleanFolder = folderName.trim().replace(/[^a-zA-Z0-9_\-\.]/g, '');
    const base = parentPath ? resolve(parentPath) : '/home/saghet/Documents';

    if (!base.startsWith('/home/saghet')) {
      return reply.code(403).send({ error: 'Ruta no autorizada fuera del directorio de usuario' });
    }

    const fullPath = join(base, cleanFolder);
    try {
      mkdirSync(fullPath, { recursive: true });
      return reply.code(201).send({ success: true, path: fullPath, name: cleanFolder });
    } catch (err: any) {
      return reply.code(500).send({ error: `Error creando directorio: ${err.message}` });
    }
  });

  // ── Gestión de Proyectos ──
  app.get('/api/projects', async () => {
    return await projectsTable.listProjectsWithConversations();
  });

  app.post<{ Body: { name: string; path?: string; description?: string } }>('/api/projects', async (req, reply) => {
    try {
      const { name, path, description } = req.body || {};
      if (!name || !name.trim()) {
        return reply.code(400).send({ error: 'El nombre del proyecto/carpeta es obligatorio' });
      }
      const trimmedName = name.trim();

      const existing = await projectsTable.getProjectByName(trimmedName);
      if (existing) {
        return reply.code(409).send({
          error: `Ya existe un proyecto o carpeta con el nombre "${trimmedName}". Por favor elige otro nombre o selecciona la carpeta existente.`
        });
      }

      const finalPath = path && path.trim() ? path.trim() : `/home/saghet/Documents/${trimmedName.replace(/\s+/g, '')}`;

      try {
        if (!existsSync(finalPath)) {
          mkdirSync(finalPath, { recursive: true });
        }
      } catch (dirErr: any) {
        console.warn(`[WARN] No se pudo crear directorio físico ${finalPath}:`, dirErr?.message);
      }
      ProjectBoundaryGuard.ensureProjectManifest(trimmedName, finalPath);

      const projectWithConv = await projectsTable.createProjectWithInitialConversation(
        trimmedName,
        finalPath,
        description || ''
      );
      return reply.code(201).send(projectWithConv);
    } catch (err: any) {
      console.error('[ERROR] Error al crear proyecto:', err);
      return reply.code(500).send({ error: `Error creando proyecto: ${err?.message || err}` });
    }
  });

  app.patch<{ Params: { id: string }; Body: { name?: string; path?: string; description?: string } }>(
    '/api/projects/:id',
    async (req, reply) => {
      const updated = await projectsTable.updateProject(req.params.id, req.body || {});
      if (!updated) return reply.code(404).send({ error: 'Proyecto no encontrado' });
      return updated;
    }
  );

  app.delete<{ Params: { id: string } }>('/api/projects/:id', async (req, reply) => {
    const ok = await projectsTable.deleteProject(req.params.id);
    if (!ok) return reply.code(404).send({ error: 'Proyecto no encontrado' });
    return { success: true, deletedProjectId: req.params.id };
  });

  // ── Conversaciones del Proyecto ──
  app.post<{ Params: { id: string }; Body: { title: string } }>('/api/projects/:id/conversations', async (req, reply) => {
    try {
      const project = await projectsTable.getProjectById(req.params.id);
      if (!project) {
        return reply.code(404).send({ error: `El proyecto "${req.params.id}" no existe o fue eliminado.` });
      }
      const title = req.body?.title || 'Nueva Conversación';
      const conv = await projectsTable.createConversation(req.params.id, title);
      return reply.code(201).send(conv);
    } catch (err: any) {
      return reply.code(500).send({ error: `Error creando conversación: ${err?.message || err}` });
    }
  });

  app.patch<{ Params: { id: string }; Body: { title: string } }>('/api/conversations/:id', async (req, reply) => {
    const { title } = req.body || {};
    if (!title || !title.trim()) {
      return reply.code(400).send({ error: 'El nuevo título es obligatorio' });
    }
    const updated = await projectsTable.renameConversation(req.params.id, title);
    if (!updated) return reply.code(404).send({ error: 'Conversación no encontrada' });
    return updated;
  });

  app.patch<{ Params: { id: string }; Body: { targetProjectId: string } }>(
    '/api/conversations/:id/move',
    async (req, reply) => {
      const { targetProjectId } = req.body || {};
      if (!targetProjectId) {
        return reply.code(400).send({ error: 'targetProjectId es obligatorio' });
      }
      const moved = await projectsTable.moveConversation(req.params.id, targetProjectId);
      if (!moved) return reply.code(404).send({ error: 'Conversación o proyecto destino no encontrado' });
      return moved;
    }
  );

  app.delete<{ Params: { id: string } }>('/api/conversations/:id', async (req, reply) => {
    const ok = await projectsTable.deleteConversation(req.params.id);
    if (!ok) return reply.code(404).send({ error: 'Conversación no encontrada' });
    return { success: true, deletedConversationId: req.params.id };
  });

  app.get<{ Params: { id: string } }>('/api/conversations/:id/messages', async (req) => {
    const msgs = await projectsTable.getConversationMessages(req.params.id);
    return msgs.map((m: any) => ({
      ...m,
      content: KodaraPlanExecutor.stripSymbolicButtonHallucinations(m.content || ''),
    }));
  });

  app.post<{ Params: { id: string }; Body: { role: 'user' | 'assistant'; content: string; meta?: any } }>(
    '/api/conversations/:id/messages',
    async (req) => {
      const { role, content, meta } = req.body;
      return await projectsTable.saveProjectMessage(req.params.id, role, content, meta);
    }
  );

  app.get<{ Params: { id: string } }>('/api/kodara/conversations/:id/history', async (req, reply) => {
    const convId = req.params.id;
    if (!convId) {
      return reply.code(400).send({ error: 'conversationId es requerido' });
    }
    const { mergedMessages, userTurns } = await KodaraOrderCompiler.loadFullConversationHistory(convId);
    const compiled = await KodaraOrderCompiler.compileFromConversation({
      conversationId: convId,
      clientHistory: mergedMessages,
    });
    return {
      conversation_id: convId,
      messages: mergedMessages,
      user_turns_count: userTurns.length,
      compiled_orders: compiled.orders,
      arrow_target: compiled.arrow_target,
    };
  });
}
