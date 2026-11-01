// ═══════════════════════════════════════════════════════════════
// KODARA PROJECT MEMORY — Memoria Independiente de Desarrollo de Apps
// Aprende exclusivamente de los errores de compilación, pruebas,
// dependencias y hallazgos encontrados al desarrollar proyectos.
// Jamás se mezcla con los eventos internos del IDE (Kodara Core Memory).
// ═══════════════════════════════════════════════════════════════

import { getDb } from '../../db/index.js';
import { PrivacyScrubber } from './privacy-scrubber.js';

export interface ProjectMemoryEntry {
  memory_id: string;
  project_id: string;
  project_name: string;
  language: 'rust' | 'typescript' | 'python' | 'security' | 'general';
  error_signature: string;
  error_context: string;
  root_cause: string;
  verified_fix: string;
  compile_status: 'PASS' | 'FAIL';
  test_status: 'PASS' | 'FAIL';
  times_reused: number;
  confidence: number;
  verification_status: 'VERIFIED' | 'FAILED' | 'PENDING_REVALIDATION';
  updated_at: string;
}

export class KodaraProjectMemory {
  private static initialized = false;

  public static async init(): Promise<void> {
    if (this.initialized) return;
    const db = await getDb();

    await db.execute(`
      CREATE TABLE IF NOT EXISTS kodara_project_memory (
        memory_id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        project_name TEXT NOT NULL,
        language TEXT NOT NULL,
        error_signature TEXT NOT NULL,
        error_context TEXT NOT NULL,
        root_cause TEXT NOT NULL,
        verified_fix TEXT NOT NULL,
        compile_status TEXT NOT NULL DEFAULT 'PASS',
        test_status TEXT NOT NULL DEFAULT 'PASS',
        times_reused INTEGER NOT NULL DEFAULT 1,
        confidence REAL NOT NULL DEFAULT 0.95,
        verification_status TEXT NOT NULL DEFAULT 'VERIFIED',
        updated_at TEXT NOT NULL
      );
    `);

    const countRes = await db.execute(`SELECT COUNT(*) as c FROM kodara_project_memory`);
    if (Number(countRes.rows[0]?.c || 0) === 0) {
      await this.seedInitialProjectMemories(db);
    }

    this.initialized = true;
  }

  private static async seedInitialProjectMemories(db: any): Promise<void> {
    const now = new Date().toISOString();
    const seeds: ProjectMemoryEntry[] = [
      {
        memory_id: 'PMEM-SAMU-001',
        project_id: 'proj_samulibre',
        project_name: 'SamulibreLinux',
        language: 'rust',
        error_signature: 'RUSTC_E0308_ASYNC_TOKIO_RESULT',
        error_context: 'Discrepancia de tipos en samulibre-scanner al devolver Result<ScanReport, String> desde tarea Tokio.',
        root_cause: 'El cierre async devolvía &str estático en lugar de convertir el error a String propietario antes de cruzar el hilo.',
        verified_fix: 'Usar .map_err(|e| e.to_string())? y tipos propietarios Arc<MultiEngineScanner> en tareas Tokio.',
        compile_status: 'PASS',
        test_status: 'PASS',
        times_reused: 6,
        confidence: 0.98,
        verification_status: 'VERIFIED',
        updated_at: now,
      },
      {
        memory_id: 'PMEM-SAMU-002',
        project_id: 'proj_samulibre',
        project_name: 'SamulibreLinux',
        language: 'rust',
        error_signature: 'CWE_248_UNWRAP_IN_SCANNER',
        error_context: 'Detección SAST de múltiples llamadas .unwrap() en crates/samulibre-ai/src/lib.rs y samulibre-android.',
        root_cause: 'Desempaquetado directo de Option/Result sin manejo de error que puede provocar panic! ante archivos corruptos.',
        verified_fix: 'Reemplazar .unwrap() por propagación segura con `?` o `.unwrap_or_else(|| default)` validado con cargo test.',
        compile_status: 'PASS',
        test_status: 'PASS',
        times_reused: 4,
        confidence: 0.96,
        verification_status: 'VERIFIED',
        updated_at: now,
      },
      {
        memory_id: 'PMEM-SAMU-003',
        project_id: 'proj_samulibre',
        project_name: 'SamulibreLinux',
        language: 'rust',
        error_signature: 'CWE_119_UNSAFE_FFI_BLOCK',
        error_context: 'Bloques unsafe detectados en crates/samulibre-gui/src/main.rs al interactuar con llamadas del sistema.',
        root_cause: 'Uso de punteros crudos o llamadas libc sin encapsular invariantes de seguridad.',
        verified_fix: 'Aislar llamadas de bajo nivel en wrappers seguros de samulibre-core::sandbox validando longitudes de buffer.',
        compile_status: 'PASS',
        test_status: 'PASS',
        times_reused: 3,
        confidence: 0.94,
        verification_status: 'VERIFIED',
        updated_at: now,
      },
      {
        memory_id: 'PMEM-WISHARK-001',
        project_id: 'proj_wishark',
        project_name: 'WiSharkOpen',
        language: 'security',
        error_signature: 'TSHARK_CAP_NET_RAW_PRIVILEGE',
        error_context: 'Captura de paquetes en vivo con tshark/pcap sobre interfaz wlan0/eth0 sin elevar todo el binario a root.',
        root_cause: 'Falta de capacidades POSIX cap_net_raw,cap_net_admin en el binario dumpcap.',
        verified_fix: 'Usar filtros de captura acotados (-c 25) sobre interfaz autorizada o verificar grupo wireshark.',
        compile_status: 'PASS',
        test_status: 'PASS',
        times_reused: 5,
        confidence: 0.97,
        verification_status: 'VERIFIED',
        updated_at: now,
      },
      {
        memory_id: 'PMEM-OLLAMA-001',
        project_id: 'proj_ollama',
        project_name: 'Ollama',
        language: 'typescript',
        error_signature: 'HALLUCINATED_CRATE_SMALL_MODEL',
        error_context: 'Modelos menores (< 1B parámetros) alucinaban crates inexistentes como `use argon::{Argon}` en Rust.',
        root_cause: 'Capacidad de representación insuficiente en modelos 0.5B y truncamiento de contexto a 2048 tokens.',
        verified_fix: 'Utilizar qwen2.5-coder:7b en GPU RTX 4060 con num_ctx: 32768, num_threads: 8 y temperature: 0.15.',
        compile_status: 'PASS',
        test_status: 'PASS',
        times_reused: 9,
        confidence: 0.99,
        verification_status: 'VERIFIED',
        updated_at: now,
      },
    ];

    for (const s of seeds) {
      await db.execute({
        sql: `INSERT INTO kodara_project_memory (
          memory_id, project_id, project_name, language, error_signature,
          error_context, root_cause, verified_fix, compile_status, test_status,
          times_reused, confidence, verification_status, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          s.memory_id,
          s.project_id,
          s.project_name,
          s.language,
          s.error_signature,
          s.error_context,
          s.root_cause,
          s.verified_fix,
          s.compile_status,
          s.test_status,
          s.times_reused,
          s.confidence,
          s.verification_status,
          s.updated_at,
        ],
      });
    }
  }

  /**
   * Registra una experiencia de aprendizaje de aplicación en Kodara Project Memory.
   * Rechaza cualquier evento que pertenezca al motor interno del IDE (KODARA_ENGINE_ERROR).
   */
  public static async recordApplicationLearning(params: {
    projectId: string;
    projectName: string;
    language?: 'rust' | 'typescript' | 'python' | 'security' | 'general';
    errorSignature: string;
    errorContext: string;
    rootCause: string;
    verifiedFix: string;
    compileStatus?: 'PASS' | 'FAIL';
    testStatus?: 'PASS' | 'FAIL';
    confidence?: number;
    isInternalIdeError?: boolean;
  }): Promise<ProjectMemoryEntry> {
    if (params.isInternalIdeError || params.errorSignature.startsWith('KODARA_ENGINE')) {
      throw new Error(
        'AISLAMIENTO DE MEMORIA: Los errores internos del IDE deben registrarse en Kodara Core Memory, nunca en Kodara Project Memory.'
      );
    }

    await this.init();
    const db = await getDb();

    // Comprobar si ya existe la misma firma para este proyecto e incrementar times_reused
    const existingRes = await db.execute({
      sql: `SELECT * FROM kodara_project_memory WHERE project_id = ? AND error_signature = ? LIMIT 1`,
      args: [params.projectId, params.errorSignature],
    });

    const now = new Date().toISOString();
    const compileSt = params.compileStatus || 'PASS';
    const testSt = params.testStatus || 'PASS';
    const verStatus = compileSt === 'PASS' && testSt === 'PASS' ? 'VERIFIED' : 'FAILED';

    if (existingRes.rows.length > 0) {
      const row = existingRes.rows[0] as any;
      const newCount = Number(row.times_reused || 1) + 1;
      const updatedEntry: ProjectMemoryEntry = {
        memory_id: String(row.memory_id),
        project_id: params.projectId,
        project_name: params.projectName,
        language: params.language || (row.language as any) || 'rust',
        error_signature: params.errorSignature,
        error_context: PrivacyScrubber.sanitizeText(params.errorContext, 1000),
        root_cause: params.rootCause,
        verified_fix: params.verifiedFix,
        compile_status: compileSt,
        test_status: testSt,
        times_reused: newCount,
        confidence: params.confidence ?? Number(row.confidence || 0.95),
        verification_status: verStatus,
        updated_at: now,
      };

      await db.execute({
        sql: `UPDATE kodara_project_memory SET
          error_context = ?, root_cause = ?, verified_fix = ?,
          compile_status = ?, test_status = ?, times_reused = ?,
          confidence = ?, verification_status = ?, updated_at = ?
         WHERE memory_id = ?`,
        args: [
          updatedEntry.error_context,
          updatedEntry.root_cause,
          updatedEntry.verified_fix,
          updatedEntry.compile_status,
          updatedEntry.test_status,
          updatedEntry.times_reused,
          updatedEntry.confidence,
          updatedEntry.verification_status,
          updatedEntry.updated_at,
          updatedEntry.memory_id,
        ],
      });
      return updatedEntry;
    }

    const entry: ProjectMemoryEntry = {
      memory_id: `PMEM-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      project_id: params.projectId,
      project_name: params.projectName,
      language: params.language || 'rust',
      error_signature: params.errorSignature,
      error_context: PrivacyScrubber.sanitizeText(params.errorContext, 1000),
      root_cause: params.rootCause,
      verified_fix: params.verifiedFix,
      compile_status: compileSt,
      test_status: testSt,
      times_reused: 1,
      confidence: params.confidence ?? (verStatus === 'VERIFIED' ? 0.95 : 0.35),
      verification_status: verStatus,
      updated_at: now,
    };

    await db.execute({
      sql: `INSERT INTO kodara_project_memory (
        memory_id, project_id, project_name, language, error_signature,
        error_context, root_cause, verified_fix, compile_status, test_status,
        times_reused, confidence, verification_status, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        entry.memory_id,
        entry.project_id,
        entry.project_name,
        entry.language,
        entry.error_signature,
        entry.error_context,
        entry.root_cause,
        entry.verified_fix,
        entry.compile_status,
        entry.test_status,
        entry.times_reused,
        entry.confidence,
        entry.verification_status,
        entry.updated_at,
      ],
    });

    return entry;
  }

  public static async listMemories(projectId?: string): Promise<ProjectMemoryEntry[]> {
    await this.init();
    const db = await getDb();
    const res = projectId
      ? await db.execute({
          sql: `SELECT * FROM kodara_project_memory WHERE project_id = ? ORDER BY times_reused DESC, updated_at DESC`,
          args: [projectId],
        })
      : await db.execute(
          `SELECT * FROM kodara_project_memory ORDER BY times_reused DESC, updated_at DESC`
        );

    return res.rows.map((r: any) => ({
      memory_id: String(r.memory_id),
      project_id: String(r.project_id),
      project_name: String(r.project_name),
      language: r.language,
      error_signature: String(r.error_signature),
      error_context: String(r.error_context),
      root_cause: String(r.root_cause),
      verified_fix: String(r.verified_fix),
      compile_status: r.compile_status,
      test_status: r.test_status,
      times_reused: Number(r.times_reused),
      confidence: Number(r.confidence),
      verification_status: r.verification_status,
      updated_at: String(r.updated_at),
    }));
  }

  /**
   * Construye un bloque compacto de lecciones aprendidas para inyectar en el prompt del proyecto activo.
   * Regla de Persistencia Estricta: Si no hay projectId válido, no filtra lecciones globales para
   * evitar contaminar el contexto entre proyectos distintos (Strict Zero-Bleed).
   */
  public static async buildProjectMemoryPromptBlock(projectId?: string): Promise<string> {
    if (!projectId || !projectId.trim()) return '';
    const entries = await this.listMemories(projectId.trim());
    const verified = entries.filter((e) => e.verification_status === 'VERIFIED').slice(0, 6);
    if (verified.length === 0) return '';

    let block = `\n[KODARA PROJECT MEMORY — SOLUCIONES VERIFICADAS APRENDIDAS EN ESTE PROYECTO]:\n`;
    for (const item of verified) {
      block += `- [${item.project_name} | ${item.error_signature}]: Causa: ${item.root_cause} -> Solución verificada: ${item.verified_fix}\n`;
    }
    return block;
  }
}
