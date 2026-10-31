// ═══════════════════════════════════════════════════════════════
// Kodara — Gestor de Sesiones, Árbol de Objetivos en Vivo y Reportes
// Almacenamiento en SQLite local y exportación de informes en 1 clic
// ═══════════════════════════════════════════════════════════════

import { getDb } from '../db/index.js';
import { nanoid } from 'nanoid';
import type { ParsedToolExecution, DiscoveredPort, SecurityFinding } from './output-preprocessor.js';

export interface TargetTreeNode {
  target: string;
  type: 'host' | 'project' | 'web';
  updatedAt: string;
  ports: DiscoveredPort[];
  findings: SecurityFinding[];
  notes: string[];
}

export interface AuditLogEntry {
  id: string;
  toolId: string;
  target: string;
  command: string;
  intrusionLevel: string;
  rawLineCount: number;
  wasCompressed: boolean;
  digest: string;
  createdAt: string;
}

export class KodaraWorkspaceDB {
  private static initialized = false;

  public static async init(): Promise<void> {
    if (this.initialized) return;
    const db = await getDb();

    await db.execute(`
      CREATE TABLE IF NOT EXISTS kodara_targets (
        target TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS kodara_ports (
        id TEXT PRIMARY KEY,
        target TEXT NOT NULL,
        port INTEGER NOT NULL,
        protocol TEXT NOT NULL,
        state TEXT NOT NULL,
        service TEXT NOT NULL,
        version TEXT NOT NULL
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS kodara_findings (
        id TEXT PRIMARY KEY,
        target TEXT NOT NULL,
        severity TEXT NOT NULL,
        title TEXT NOT NULL,
        location TEXT NOT NULL,
        description TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS kodara_notes (
        id TEXT PRIMARY KEY,
        target TEXT NOT NULL,
        note TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS kodara_audit_log (
        id TEXT PRIMARY KEY,
        tool_id TEXT NOT NULL,
        target TEXT NOT NULL,
        command TEXT NOT NULL,
        intrusion_level TEXT NOT NULL,
        raw_lines INTEGER NOT NULL,
        was_compressed INTEGER NOT NULL,
        digest TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);

    const countRes = await db.execute('SELECT COUNT(*) as c FROM kodara_targets');
    if ((countRes.rows[0].c as number) === 0) {
      await this.seedInitialTargets();
    }

    this.initialized = true;
  }

  private static async seedInitialTargets(): Promise<void> {
    const db = await getDb();
    const now = new Date().toISOString();

    // 1. Nodo de Red Local
    await db.execute({
      sql: 'INSERT OR IGNORE INTO kodara_targets (target, type, updated_at) VALUES (?, ?, ?)',
      args: ['127.0.0.1', 'host', now]
    });
    await db.execute({
      sql: 'INSERT INTO kodara_ports (id, target, port, protocol, state, service, version) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: ['p_11434', '127.0.0.1', 11434, 'tcp', 'open', 'ollama-api', 'Ollama Local LLM Engine (CUDA)']
    });
    await db.execute({
      sql: 'INSERT INTO kodara_ports (id, target, port, protocol, state, service, version) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: ['p_3777', '127.0.0.1', 3777, 'tcp', 'open', 'kodara-core', 'Kodara Security Cockpit Server']
    });
    await db.execute({
      sql: 'INSERT INTO kodara_notes (id, target, note, created_at) VALUES (?, ?, ?, ?)',
      args: ['n_init_1', '127.0.0.1', 'Servicios de inferencia y cabina escuchando exclusivamente en loopback local (127.0.0.1).', now]
    });

    // 2. Proyecto Local Auditado (SamulibreLinux)
    const samuPath = '/home/saghet/Documents/SamulibreLinux';
    await db.execute({
      sql: 'INSERT OR IGNORE INTO kodara_targets (target, type, updated_at) VALUES (?, ?, ?)',
      args: [samuPath, 'project', now]
    });
    await db.execute({
      sql: 'INSERT INTO kodara_findings (id, target, severity, title, location, description, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [
        'f_samu_1',
        samuPath,
        'INFO',
        'Workspace Rust de 11 Crates Registrado',
        'Cargo.toml',
        'Arquitectura modular verificada: samulibre-scanner, samulibre-shield, samulibre-watcher, samulibre-vpn.',
        now
      ]
    });
    await db.execute({
      sql: 'INSERT INTO kodara_notes (id, target, note, created_at) VALUES (?, ?, ?, ?)',
      args: ['n_samu_1', samuPath, 'Listo para auditoría estática SAST (Semgrep/Trivy) y análisis de concurrencia Tokio.', now]
    });
  }

  public static async recordExecution(parsed: ParsedToolExecution, intrusionLevel: string): Promise<void> {
    await this.init();
    const db = await getDb();
    const now = new Date().toISOString();

    const targetType = parsed.target.startsWith('/')
      ? 'project'
      : parsed.target.startsWith('http')
      ? 'web'
      : 'host';

    await db.execute({
      sql: 'INSERT OR REPLACE INTO kodara_targets (target, type, updated_at) VALUES (?, ?, ?)',
      args: [parsed.target, targetType, now]
    });

    // Actualizar puertos si se descubrieron nuevos
    if (parsed.ports.length > 0) {
      await db.execute({
        sql: 'DELETE FROM kodara_ports WHERE target = ?',
        args: [parsed.target]
      });
      for (const p of parsed.ports) {
        await db.execute({
          sql: 'INSERT INTO kodara_ports (id, target, port, protocol, state, service, version) VALUES (?, ?, ?, ?, ?, ?, ?)',
          args: ['port_' + nanoid(8), parsed.target, p.port, p.protocol, p.state, p.service, p.version]
        });
      }
    }

    // Registrar nuevos hallazgos
    for (const f of parsed.findings) {
      await db.execute({
        sql: 'INSERT INTO kodara_findings (id, target, severity, title, location, description, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        args: ['find_' + nanoid(8), parsed.target, f.severity, f.title, f.location, f.description, now]
      });
    }

    // Registrar notas
    for (const n of parsed.notes) {
      await db.execute({
        sql: 'INSERT INTO kodara_notes (id, target, note, created_at) VALUES (?, ?, ?, ?)',
        args: ['note_' + nanoid(8), parsed.target, n, now]
      });
    }

    // Guardar en bitácora de auditoría
    await db.execute({
      sql: `INSERT INTO kodara_audit_log 
            (id, tool_id, target, command, intrusion_level, raw_lines, was_compressed, digest, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        'aud_' + nanoid(10),
        parsed.toolId,
        parsed.target,
        parsed.commandExecuted,
        intrusionLevel,
        parsed.rawLineCount,
        parsed.wasCompressed ? 1 : 0,
        parsed.llmDigest,
        now
      ]
    });
  }

  public static async addNote(target: string, note: string): Promise<void> {
    await this.init();
    const db = await getDb();
    const now = new Date().toISOString();
    await db.execute({
      sql: 'INSERT OR IGNORE INTO kodara_targets (target, type, updated_at) VALUES (?, ?, ?)',
      args: [target, target.startsWith('/') ? 'project' : 'host', now]
    });
    await db.execute({
      sql: 'INSERT INTO kodara_notes (id, target, note, created_at) VALUES (?, ?, ?, ?)',
      args: ['note_' + nanoid(8), target, note, now]
    });
  }

  public static async getTargetTree(): Promise<TargetTreeNode[]> {
    await this.init();
    const db = await getDb();

    const tRes = await db.execute('SELECT * FROM kodara_targets ORDER BY updated_at DESC');
    const pRes = await db.execute('SELECT * FROM kodara_ports ORDER BY port ASC');
    const fRes = await db.execute('SELECT * FROM kodara_findings ORDER BY created_at DESC');
    const nRes = await db.execute('SELECT * FROM kodara_notes ORDER BY created_at DESC');

    const nodes: TargetTreeNode[] = tRes.rows.map(r => ({
      target: r.target as string,
      type: (r.type as any) || 'host',
      updatedAt: r.updated_at as string,
      ports: [],
      findings: [],
      notes: []
    }));

    const map = new Map<string, TargetTreeNode>();
    for (const n of nodes) map.set(n.target, n);

    for (const r of pRes.rows) {
      const node = map.get(r.target as string);
      if (node) {
        node.ports.push({
          port: Number(r.port),
          protocol: r.protocol as string,
          state: r.state as string,
          service: r.service as string,
          version: r.version as string
        });
      }
    }

    for (const r of fRes.rows) {
      const node = map.get(r.target as string);
      if (node) {
        node.findings.push({
          id: r.id as string,
          severity: r.severity as any,
          title: r.title as string,
          location: r.location as string,
          description: r.description as string
        });
      }
    }

    for (const r of nRes.rows) {
      const node = map.get(r.target as string);
      if (node) {
        node.notes.push(r.note as string);
      }
    }

    return nodes;
  }

  public static async getAuditLogs(limit = 25): Promise<AuditLogEntry[]> {
    await this.init();
    const db = await getDb();
    const res = await db.execute({
      sql: 'SELECT * FROM kodara_audit_log ORDER BY created_at DESC LIMIT ?',
      args: [limit]
    });

    return res.rows.map(r => ({
      id: r.id as string,
      toolId: r.tool_id as string,
      target: r.target as string,
      command: r.command as string,
      intrusionLevel: r.intrusion_level as string,
      rawLineCount: Number(r.raw_lines),
      wasCompressed: Boolean(r.was_compressed),
      digest: r.digest as string,
      createdAt: r.created_at as string
    }));
  }

  public static async exportMarkdownReport(): Promise<string> {
    const tree = await this.getTargetTree();
    const logs = await this.getAuditLogs(50);
    const now = new Date().toLocaleString('es-ES');

    let md = `# 🛡️ INFORME TÉCNICO DE CIBERSEGURIDAD Y AUDITORÍA — KODARA\n`;
    md += `> **Lema**: *"Your code, Your IA, Your Rules"*\n`;
    md += `> **Fecha de Generación**: ${now}\n`;
    md += `> **Entorno de Ejecución**: 100% Local Offline • AMD Ryzen 9 7940HS (8C/16T) • 32 GB RAM • NVIDIA RTX 4060\n\n`;
    md += `---\n\n`;

    md += `## 1. Mapa de Objetivos y Activos Auditados (${tree.length})\n\n`;
    for (const node of tree) {
      md += `### 🎯 Objetivo: \`${node.target}\` (${node.type.toUpperCase()})\n`;
      if (node.ports.length > 0) {
        md += `#### Puertos y Servicios Activos:\n`;
        md += `| Puerto | Protocolo | Estado | Servicio | Versión |\n`;
        md += `| :--- | :--- | :--- | :--- | :--- |\n`;
        for (const p of node.ports) {
          md += `| **${p.port}** | ${p.protocol} | ${p.state} | \`${p.service}\` | ${p.version} |\n`;
        }
        md += `\n`;
      }

      if (node.findings.length > 0) {
        md += `#### Hallazgos y Vulnerabilidades (${node.findings.length}):\n`;
        for (const f of node.findings) {
          md += `- **[${f.severity}] ${f.title}** (\`${f.location}\`): ${f.description}\n`;
        }
        md += `\n`;
      }

      if (node.notes.length > 0) {
        md += `#### Notas de Inteligencia:\n`;
        for (const n of node.notes) {
          md += `- ${n}\n`;
        }
        md += `\n`;
      }
    }

    md += `---\n\n`;
    md += `## 2. Bitácora Auditada de Comandos Ejecutados (${logs.length})\n\n`;
    if (logs.length === 0) {
      md += `*Aún no se han ejecutado comandos interactivos en esta sesión.*\n`;
    } else {
      for (const l of logs) {
        md += `### ⚡ [${l.createdAt}] \`${l.command}\`\n`;
        md += `- **Herramienta**: ${l.toolId} | **Intrusión**: ${l.intrusionLevel} | **Líneas procesadas**: ${l.rawLineCount}\n\n`;
        md += `${l.digest}\n\n`;
      }
    }

    return md;
  }
}
