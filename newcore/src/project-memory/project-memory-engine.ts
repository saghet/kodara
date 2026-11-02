// ═══════════════════════════════════════════════════════════════
// KODARA PROJECT MEMORY ENGINE: Core Facade & Persistence
// "Your Code. Your AI. Your Rules."
// Motor unificado de memoria en 6 dimensiones con persistencia
// SQLite, registro de ADRs, catálogo de errores/soluciones y RAG.
// ═══════════════════════════════════════════════════════════════

import { getDb } from '../db/index.js';
import { CoreEventHub } from '../core/core-event-hub.js';
import {
  MemoryTier,
  MemoryEntry,
  ArchitecturalDecisionRecord,
  ADRStatus,
  ErrorSolutionRecord,
  ContextRetrievalQuery,
  CompactedSessionResult,
} from './memory.interface.js';
import { ContextIndexer } from './context-indexer.js';
import { ContextCompactor, MessageLike } from './context-compactor.js';

export class ProjectMemoryEngine {
  private static instance: ProjectMemoryEngine;
  private initialized = false;

  private constructor() {}

  public static getInstance(): ProjectMemoryEngine {
    if (!ProjectMemoryEngine.instance) {
      ProjectMemoryEngine.instance = new ProjectMemoryEngine();
    }
    return ProjectMemoryEngine.instance;
  }

  public async init(): Promise<void> {
    if (this.initialized) return;
    const db = await getDb();

    // 1. Tabla de Entradas de Memoria (Sesión, Proyecto, Técnica, Tareas)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS kodara_project_memory_entries (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        tier TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        metadata_json TEXT NOT NULL,
        tags_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // 2. Tabla de Architectural Decision Records (ADRs)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS kodara_adrs (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        adr_number INTEGER NOT NULL,
        title TEXT NOT NULL,
        status TEXT NOT NULL,
        context TEXT NOT NULL,
        decision TEXT NOT NULL,
        consequences TEXT NOT NULL,
        author_agent TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // 3. Tabla de Memoria de Errores y Soluciones Verificadas
    await db.execute(`
      CREATE TABLE IF NOT EXISTS kodara_error_solutions (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        signature TEXT NOT NULL,
        symptom TEXT NOT NULL,
        root_cause TEXT NOT NULL,
        solution TEXT NOT NULL,
        verified INTEGER NOT NULL,
        reused_count INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    try {
      await db.execute(`CREATE INDEX IF NOT EXISTS idx_mem_proj_tier ON kodara_project_memory_entries(project_id, tier)`);
      await db.execute(`CREATE INDEX IF NOT EXISTS idx_adrs_proj ON kodara_adrs(project_id)`);
      await db.execute(`CREATE INDEX IF NOT EXISTS idx_err_proj_sig ON kodara_error_solutions(project_id, signature)`);
    } catch {}

    this.initialized = true;
  }

  // ── 1. GESTIÓN DE ENTRADAS DE MEMORIA (Tiers: SESSION, PROJECT, TECHNICAL, TASK) ──

  public async storeEntry(
    input: Omit<MemoryEntry, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<MemoryEntry> {
    await this.init();
    const id = `MEM-${input.tier}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const entry: MemoryEntry = {
      id,
      projectId: input.projectId,
      tier: input.tier,
      title: input.title,
      content: input.content,
      metadata: input.metadata || {},
      tags: input.tags || [],
      createdAt: now,
      updatedAt: now,
    };

    const db = await getDb();
    await db.execute({
      sql: `INSERT INTO kodara_project_memory_entries
        (id, project_id, tier, title, content, metadata_json, tags_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        entry.id,
        entry.projectId,
        entry.tier,
        entry.title,
        entry.content,
        JSON.stringify(entry.metadata),
        JSON.stringify(entry.tags),
        entry.createdAt,
        entry.updatedAt,
      ],
    });

    try {
      CoreEventHub.getInstance().publish({
        type: 'MEMORY_STORED',
        data: { id: entry.id, projectId: entry.projectId, tier: entry.tier, title: entry.title },
      });
    } catch {}

    return entry;
  }

  public async listEntriesByTier(projectId: string, tier: MemoryTier): Promise<MemoryEntry[]> {
    await this.init();
    const db = await getDb();
    const res = await db.execute({
      sql: `SELECT * FROM kodara_project_memory_entries WHERE project_id = ? AND tier = ? ORDER BY created_at DESC`,
      args: [projectId, tier],
    });

    return (res.rows || []).map((row: any) => ({
      id: row.id,
      projectId: row.project_id,
      tier: row.tier,
      title: row.title,
      content: row.content,
      metadata: JSON.parse(row.metadata_json || '{}'),
      tags: JSON.parse(row.tags_json || '[]'),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  // ── 2. ARCHITECTURAL DECISION RECORDS (ADR) ──

  public async recordADR(
    input: Omit<ArchitecturalDecisionRecord, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ArchitecturalDecisionRecord> {
    await this.init();
    const id = `ADR-${input.adrNumber}-${Date.now().toString(36)}`;
    const now = new Date().toISOString();

    const adr: ArchitecturalDecisionRecord = {
      id,
      projectId: input.projectId,
      adrNumber: input.adrNumber,
      title: input.title,
      status: input.status,
      context: input.context,
      decision: input.decision,
      consequences: input.consequences,
      authorAgent: input.authorAgent,
      createdAt: now,
      updatedAt: now,
    };

    const db = await getDb();
    await db.execute({
      sql: `INSERT INTO kodara_adrs
        (id, project_id, adr_number, title, status, context, decision, consequences, author_agent, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        adr.id,
        adr.projectId,
        adr.adrNumber,
        adr.title,
        adr.status,
        adr.context,
        adr.decision,
        adr.consequences,
        adr.authorAgent,
        adr.createdAt,
        adr.updatedAt,
      ],
    });

    // También indexar como entrada de memoria en tier ARCHITECTURAL_DECISION
    await this.storeEntry({
      projectId: adr.projectId,
      tier: 'ARCHITECTURAL_DECISION',
      title: `ADR-${adr.adrNumber}: ${adr.title}`,
      content: `Contexto: ${adr.context}\nDecisión: ${adr.decision}\nConsecuencias: ${adr.consequences}`,
      tags: ['adr', 'architecture', adr.status.toLowerCase()],
      metadata: { adrId: adr.id, adrNumber: adr.adrNumber, status: adr.status },
    });

    return adr;
  }

  public async updateADRStatus(adrId: string, status: ADRStatus): Promise<ArchitecturalDecisionRecord> {
    await this.init();
    const db = await getDb();
    const now = new Date().toISOString();
    await db.execute({
      sql: `UPDATE kodara_adrs SET status = ?, updated_at = ? WHERE id = ?`,
      args: [status, now, adrId],
    });

    const res = await db.execute({
      sql: `SELECT * FROM kodara_adrs WHERE id = ?`,
      args: [adrId],
    });
    if (!res.rows || res.rows.length === 0) {
      throw new Error(`ADR "${adrId}" no encontrado.`);
    }
    const row: any = res.rows[0];
    return {
      id: row.id,
      projectId: row.project_id,
      adrNumber: row.adr_number,
      title: row.title,
      status: row.status,
      context: row.context,
      decision: row.decision,
      consequences: row.consequences,
      authorAgent: row.author_agent,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  public async listADRs(projectId: string): Promise<ArchitecturalDecisionRecord[]> {
    await this.init();
    const db = await getDb();
    const res = await db.execute({
      sql: `SELECT * FROM kodara_adrs WHERE project_id = ? ORDER BY adr_number ASC`,
      args: [projectId],
    });

    return (res.rows || []).map((row: any) => ({
      id: row.id,
      projectId: row.project_id,
      adrNumber: row.adr_number,
      title: row.title,
      status: row.status,
      context: row.context,
      decision: row.decision,
      consequences: row.consequences,
      authorAgent: row.author_agent,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  // ── 3. MEMORIA DE ERRORES Y SOLUCIONES (ERROR_SOLUTION) ──

  public async recordErrorSolution(
    input: Omit<ErrorSolutionRecord, 'id' | 'createdAt' | 'updatedAt' | 'reusedCount'>
  ): Promise<ErrorSolutionRecord> {
    await this.init();
    const db = await getDb();
    const now = new Date().toISOString();

    // Si ya existía la misma firma, incrementar el contador de reutilización
    const existing = await this.findErrorSolution(input.projectId, input.signature);
    if (existing) {
      const newCount = existing.reusedCount + 1;
      await db.execute({
        sql: `UPDATE kodara_error_solutions SET reused_count = ?, updated_at = ?, verified = ? WHERE id = ?`,
        args: [newCount, now, input.verified ? 1 : 0, existing.id],
      });
      return { ...existing, reusedCount: newCount, updatedAt: now };
    }

    const id = `ERR-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const record: ErrorSolutionRecord = {
      id,
      projectId: input.projectId,
      signature: input.signature,
      symptom: input.symptom,
      rootCause: input.rootCause,
      solution: input.solution,
      verified: input.verified,
      reusedCount: 1,
      createdAt: now,
      updatedAt: now,
    };

    await db.execute({
      sql: `INSERT INTO kodara_error_solutions
        (id, project_id, signature, symptom, root_cause, solution, verified, reused_count, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        record.id,
        record.projectId,
        record.signature,
        record.symptom,
        record.rootCause,
        record.solution,
        record.verified ? 1 : 0,
        record.reusedCount,
        record.createdAt,
        record.updatedAt,
      ],
    });

    // También indexar en la tabla general de entradas
    await this.storeEntry({
      projectId: record.projectId,
      tier: 'ERROR_SOLUTION',
      title: `Error: ${record.signature}`,
      content: `Síntoma: ${record.symptom}\nCausa Raíz: ${record.rootCause}\nSolución: ${record.solution}`,
      tags: ['error', 'solution', record.signature.toLowerCase()],
      metadata: { signature: record.signature, verified: record.verified },
    });

    return record;
  }

  public async findErrorSolution(projectId: string, signature: string): Promise<ErrorSolutionRecord | null> {
    await this.init();
    const db = await getDb();
    const res = await db.execute({
      sql: `SELECT * FROM kodara_error_solutions WHERE project_id = ? AND signature = ?`,
      args: [projectId, signature],
    });

    if (!res.rows || res.rows.length === 0) return null;
    const row: any = res.rows[0];
    return {
      id: row.id,
      projectId: row.project_id,
      signature: row.signature,
      symptom: row.symptom,
      rootCause: row.root_cause,
      solution: row.solution,
      verified: Boolean(row.verified),
      reusedCount: row.reused_count,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  // ── 4. RECUPERACIÓN CONTEXTUAL RELEVANTE (RAG LIGERO SIN VOLCADO DE REPO) ──

  public async retrieveRelevantContext(queryInput: ContextRetrievalQuery): Promise<string> {
    await this.init();
    const db = await getDb();

    let sql = `SELECT * FROM kodara_project_memory_entries WHERE project_id = ?`;
    const args: any[] = [queryInput.projectId];

    if (queryInput.tiers && queryInput.tiers.length > 0) {
      const placeholders = queryInput.tiers.map(() => '?').join(', ');
      sql += ` AND tier IN (${placeholders})`;
      args.push(...queryInput.tiers);
    }

    sql += ` ORDER BY created_at DESC LIMIT 50`;

    const res = await db.execute({ sql, args });
    const allEntries: MemoryEntry[] = (res.rows || []).map((row: any) => ({
      id: row.id,
      projectId: row.project_id,
      tier: row.tier,
      title: row.title,
      content: row.content,
      metadata: JSON.parse(row.metadata_json || '{}'),
      tags: JSON.parse(row.tags_json || '[]'),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    if (allEntries.length === 0) {
      return '';
    }

    const maxTokens = queryInput.maxTokens || 2000;
    const limit = queryInput.limit || 5;
    const relevant = ContextIndexer.retrieveRelevant(allEntries, queryInput.query, maxTokens, limit);

    if (relevant.length === 0) {
      return '';
    }

    const lines: string[] = [
      `[MEMORIA CONTEXTUAL RELEVANTE DEL PROYECTO (${relevant.length} registros seleccionados)]:`
    ];

    for (const item of relevant) {
      lines.push(`• [${item.entry.tier}] ${item.entry.title}:`);
      lines.push(`  ${item.entry.content.replace(/\n/g, '\n  ')}`);
    }

    return lines.join('\n');
  }

  // ── 5. COMPACTACIÓN DE CONTEXTO Y RECUPERACIÓN DE SESIÓN ──

  public compactConversation(
    messages: MessageLike[],
    metadata?: { activeTasks?: string[]; projectName?: string }
  ): CompactedSessionResult {
    return ContextCompactor.compactSession(messages, 4, metadata);
  }
}
