// ═══════════════════════════════════════════════════════════════
// Kodara — Tabla y Gestor de Proyectos e Historial
// Persistencia local en SQLite para el árbol de Proyectos de Kodara IDE
// ═══════════════════════════════════════════════════════════════

import { getDb } from '../index.js';
import { nanoid } from 'nanoid';

export interface ProjectRecord {
  id: string;
  name: string;
  path: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  conversations?: ConversationRecord[];
}

export interface ConversationRecord {
  id: string;
  projectId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  timeAgo?: string;
  messagesCount?: number;
}

export interface ProjectMessageRecord {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  meta?: any;
  createdAt: string;
}

/**
 * Inicializa las tablas de proyectos y conversaciones si no existen
 */
export async function initProjectsSchema(): Promise<void> {
  const db = await getDb();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      path TEXT NOT NULL,
      description TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS project_conversations (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      title TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS project_messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      meta TEXT DEFAULT '{}',
      created_at TEXT NOT NULL,
      FOREIGN KEY(conversation_id) REFERENCES project_conversations(id) ON DELETE CASCADE
    );
  `);

  // Semilla de proyectos detectados en el sistema si la tabla está vacía
  const countRes = await db.execute('SELECT COUNT(*) as c FROM projects');
  if ((countRes.rows[0].c as number) === 0) {
    await seedDefaultProjects();
  }
}

async function seedDefaultProjects(): Promise<void> {
  const now = new Date().toISOString();
  const db = await getDb();

  const defaultProjects = [
    {
      id: 'proj_ollama',
      name: 'Ollama',
      path: '/home/saghet/Documents/Ollama',
      description: 'Infraestructura local de IA con aceleración GPU NVIDIA RTX 4060',
      conversations: [
        { id: 'conv_ollama_1', title: 'Instalación y Configuración de Ollama', timeDiffMs: 5 * 60 * 1000 }
      ]
    },
    {
      id: 'proj_samulibre',
      name: 'SamulibreLinux',
      path: '/home/saghet/Documents/SamulibreLinux',
      description: 'Antivirus SamuLibre, EDR, Virtual Patcher & Privacy Suite (Rust Workspace)',
      conversations: [
        { id: 'conv_samu_1', title: 'Compilación Y Plan SamuLibre EDR', timeDiffMs: 24 * 60 * 60 * 1000 }
      ]
    },
    {
      id: 'proj_wishark',
      name: 'WiSharkOpen',
      path: '/home/saghet/Documents/WiSharkOpen',
      description: 'Suite de análisis de red y seguridad cibernética en Linux',
      conversations: [
        { id: 'conv_wi_1', title: 'Aegis RedTeam Linux Defense', timeDiffMs: 24 * 60 * 60 * 1000 }
      ]
    },
    {
      id: 'proj_cli',
      name: 'CLI Project',
      path: '/home/saghet/Documents/Ollama/Velocity',
      description: 'Herramientas de línea de comandos y utilidades del sistema',
      conversations: []
    }
  ];

  for (const p of defaultProjects) {
    await db.execute({
      sql: 'INSERT INTO projects (id, name, path, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      args: [p.id, p.name, p.path, p.description, now, now]
    });

    for (const c of p.conversations) {
      const cDate = new Date(Date.now() - c.timeDiffMs).toISOString();
      await db.execute({
        sql: 'INSERT INTO project_conversations (id, project_id, title, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
        args: [c.id, p.id, c.title, cDate, cDate]
      });
    }
  }
}

export async function listProjectsWithConversations(): Promise<ProjectRecord[]> {
  await initProjectsSchema();
  const db = await getDb();

  const pRes = await db.execute('SELECT * FROM projects ORDER BY updated_at DESC');
  const projects: ProjectRecord[] = pRes.rows.map(r => ({
    id: r.id as string,
    name: r.name as string,
    path: r.path as string,
    description: (r.description as string) || '',
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
    conversations: []
  }));

  const cRes = await db.execute('SELECT * FROM project_conversations ORDER BY updated_at DESC');
  const conversationsByProject = new Map<string, ConversationRecord[]>();

  const calcTimeAgo = (isoStr: string) => {
    const diff = Date.now() - new Date(isoStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'ahora';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  for (const r of cRes.rows) {
    const pId = r.project_id as string;
    if (!conversationsByProject.has(pId)) {
      conversationsByProject.set(pId, []);
    }
    conversationsByProject.get(pId)!.push({
      id: r.id as string,
      projectId: pId,
      title: r.title as string,
      createdAt: r.created_at as string,
      updatedAt: r.updated_at as string,
      timeAgo: calcTimeAgo(r.updated_at as string)
    });
  }

  for (const proj of projects) {
    proj.conversations = conversationsByProject.get(proj.id) || [];
  }

  return projects;
}

export async function createConversation(projectId: string, title: string): Promise<ConversationRecord> {
  await initProjectsSchema();
  const db = await getDb();
  const id = 'conv_' + nanoid(10);
  const now = new Date().toISOString();

  await db.execute({
    sql: 'INSERT INTO project_conversations (id, project_id, title, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
    args: [id, projectId, title, now, now]
  });

  await db.execute({
    sql: 'UPDATE projects SET updated_at = ? WHERE id = ?',
    args: [now, projectId]
  });

  return { id, projectId, title, createdAt: now, updatedAt: now, timeAgo: 'ahora' };
}

export async function getConversationMessages(conversationId: string): Promise<ProjectMessageRecord[]> {
  await initProjectsSchema();
  const db = await getDb();
  const res = await db.execute({
    sql: 'SELECT * FROM project_messages WHERE conversation_id = ? ORDER BY created_at ASC',
    args: [conversationId]
  });

  return res.rows.map(r => ({
    id: r.id as string,
    conversationId: r.conversation_id as string,
    role: r.role as any,
    content: r.content as string,
    meta: r.meta ? JSON.parse(r.meta as string) : {},
    createdAt: r.created_at as string
  }));
}

export async function saveProjectMessage(
  conversationId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  meta: any = {}
): Promise<ProjectMessageRecord> {
  await initProjectsSchema();
  const db = await getDb();
  const id = 'msg_' + nanoid(12);
  const now = new Date().toISOString();

  await db.execute({
    sql: 'INSERT INTO project_messages (id, conversation_id, role, content, meta, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    args: [id, conversationId, role, content, JSON.stringify(meta), now]
  });

  await db.execute({
    sql: 'UPDATE project_conversations SET updated_at = ? WHERE id = ?',
    args: [now, conversationId]
  });

  return { id, conversationId, role, content, meta, createdAt: now };
}

export async function createProject(
  name: string,
  path: string,
  description: string = ''
): Promise<ProjectRecord> {
  await initProjectsSchema();
  const db = await getDb();
  const id = 'proj_' + nanoid(8);
  const now = new Date().toISOString();

  await db.execute({
    sql: 'INSERT INTO projects (id, name, path, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    args: [id, name.trim(), path.trim(), description.trim(), now, now]
  });

  return {
    id,
    name: name.trim(),
    path: path.trim(),
    description: description.trim(),
    createdAt: now,
    updatedAt: now,
    conversations: []
  };
}

export async function updateProject(
  id: string,
  updates: { name?: string; path?: string; description?: string }
): Promise<ProjectRecord | null> {
  await initProjectsSchema();
  const db = await getDb();
  const existingRes = await db.execute({
    sql: 'SELECT * FROM projects WHERE id = ?',
    args: [id]
  });
  if (existingRes.rows.length === 0) return null;

  const current = existingRes.rows[0];
  const newName = updates.name !== undefined ? updates.name.trim() : (current.name as string);
  const newPath = updates.path !== undefined ? updates.path.trim() : (current.path as string);
  const newDesc = updates.description !== undefined ? updates.description.trim() : (current.description as string);
  const now = new Date().toISOString();

  await db.execute({
    sql: 'UPDATE projects SET name = ?, path = ?, description = ?, updated_at = ? WHERE id = ?',
    args: [newName, newPath, newDesc, now, id]
  });

  return {
    id,
    name: newName,
    path: newPath,
    description: newDesc,
    createdAt: current.created_at as string,
    updatedAt: now,
    conversations: []
  };
}

export async function deleteProject(id: string): Promise<boolean> {
  await initProjectsSchema();
  const db = await getDb();
  // Eliminar mensajes de las conversaciones de este proyecto
  await db.execute({
    sql: 'DELETE FROM project_messages WHERE conversation_id IN (SELECT id FROM project_conversations WHERE project_id = ?)',
    args: [id]
  });
  await db.execute({
    sql: 'DELETE FROM project_conversations WHERE project_id = ?',
    args: [id]
  });
  const res = await db.execute({
    sql: 'DELETE FROM projects WHERE id = ?',
    args: [id]
  });
  return (res.rowsAffected ?? 1) > 0;
}

export async function renameConversation(id: string, newTitle: string): Promise<ConversationRecord | null> {
  await initProjectsSchema();
  const db = await getDb();
  const res = await db.execute({
    sql: 'SELECT * FROM project_conversations WHERE id = ?',
    args: [id]
  });
  if (res.rows.length === 0) return null;

  const conv = res.rows[0];
  const now = new Date().toISOString();
  const title = newTitle.trim() || 'Conversación sin título';

  await db.execute({
    sql: 'UPDATE project_conversations SET title = ?, updated_at = ? WHERE id = ?',
    args: [title, now, id]
  });

  return {
    id,
    projectId: conv.project_id as string,
    title,
    createdAt: conv.created_at as string,
    updatedAt: now,
    timeAgo: 'ahora'
  };
}

export async function moveConversation(id: string, targetProjectId: string): Promise<ConversationRecord | null> {
  await initProjectsSchema();
  const db = await getDb();
  const convRes = await db.execute({
    sql: 'SELECT * FROM project_conversations WHERE id = ?',
    args: [id]
  });
  if (convRes.rows.length === 0) return null;

  const projRes = await db.execute({
    sql: 'SELECT * FROM projects WHERE id = ?',
    args: [targetProjectId]
  });
  if (projRes.rows.length === 0) return null;

  const now = new Date().toISOString();
  await db.execute({
    sql: 'UPDATE project_conversations SET project_id = ?, updated_at = ? WHERE id = ?',
    args: [targetProjectId, now, id]
  });

  const conv = convRes.rows[0];
  return {
    id,
    projectId: targetProjectId,
    title: conv.title as string,
    createdAt: conv.created_at as string,
    updatedAt: now,
    timeAgo: 'ahora'
  };
}

export async function deleteConversation(id: string): Promise<boolean> {
  await initProjectsSchema();
  const db = await getDb();
  await db.execute({
    sql: 'DELETE FROM project_messages WHERE conversation_id = ?',
    args: [id]
  });
  const res = await db.execute({
    sql: 'DELETE FROM project_conversations WHERE id = ?',
    args: [id]
  });
  return (res.rowsAffected ?? 1) > 0;
}
