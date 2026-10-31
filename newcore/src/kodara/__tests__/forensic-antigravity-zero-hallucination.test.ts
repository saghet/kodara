import { describe, expect, test } from 'bun:test';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { Database } from 'bun:sqlite';
import { spawnSync } from 'node:child_process';
import { DynamicContextRouter } from '../knowledge/dynamic-context-router.js';
import { GoldenExemplarsEngine } from '../knowledge/golden-exemplars.js';
import { KodaraPhilosophyEngine } from '../knowledge/kodara-philosophy.js';

describe('🥋 Auditoría Suprema de Pai Mei: Cero Alucinación y Autenticidad FOSS de Antigravity', () => {
  const rootDir = resolve(import.meta.dir, '../../..');
  const dbPath = resolve(rootDir, 'data/opencentravity.db');

  test('1. Génesis y Almacenamiento: Base de datos SQLite real y persistencia física', () => {
    expect(existsSync(dbPath)).toBe(true);
    const stat = statSync(dbPath);
    expect(stat.size).toBeGreaterThan(10000); // Base de datos con datos reales > 10KB

    const db = new Database(dbPath, { readonly: true });

    // Verificar existencia de tablas maestras
    const tables = db.query("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[];
    const tableNames = tables.map((t) => t.name);

    expect(tableNames).toContain('projects');
    expect(tableNames).toContain('project_conversations');
    expect(tableNames).toContain('project_messages');
    expect(tableNames).toContain('kodara_project_memory');
    expect(tableNames).toContain('kodara_core_memory');
    expect(tableNames).toContain('kodara_executable_plans');

    // Verificar que los datos no son mocks vacíos
    const projCount = (db.query('SELECT COUNT(*) as c FROM projects').get() as { c: number }).c;
    expect(projCount).toBeGreaterThan(0);

    const memCount = (db.query('SELECT COUNT(*) as c FROM kodara_project_memory').get() as { c: number }).c;
    expect(memCount).toBeGreaterThan(0);

    db.close();
  });

  test('2. Compilación Física Real: Binario ELF de SamuLibre y versión v2.00.31', () => {
    const samuUiPath = '/home/saghet/Documents/SamulibreLinux/data/ui/index.html';
    const samuBinPath = '/home/saghet/Documents/SamulibreLinux/target/release/samulibre-gui';

    expect(existsSync(samuUiPath)).toBe(true);
    const uiContent = readFileSync(samuUiPath, 'utf8');
    expect(uiContent).toContain('v2.00.31');

    expect(existsSync(samuBinPath)).toBe(true);
    const binStat = statSync(samuBinPath);
    expect(binStat.size).toBeGreaterThan(1000000); // Binario real compilado > 1MB

    // Validar con comando file que es un ejecutable ELF x86-64
    const fileRes = spawnSync('file', [samuBinPath], { encoding: 'utf8' });
    expect(fileRes.stdout).toContain('ELF 64-bit');
    expect(fileRes.stdout).toContain('executable');
  });

  test('3. Doble Forja y Sandbox en Linux: Ejecución física sin dependencias externas', () => {
    const pyScript = resolve(rootDir, 'scratch/verify_port_auditor.py');
    const rsScript = resolve(rootDir, 'scratch/verify_port_scanner_tokio.rs');

    expect(existsSync(pyScript)).toBe(true);
    expect(existsSync(rsScript)).toBe(true);

    // Ejecutar físicamente el script en Python y verificar salida estructurada
    const pyRun = spawnSync('python3', [pyScript], { encoding: 'utf8', timeout: 5000 });
    expect(pyRun.status).toBe(0);

    const parsed = JSON.parse(pyRun.stdout);
    expect(parsed.status).toBe('SUCCESS');
    expect(parsed.target).toBe('127.0.0.1');
    expect(parsed.total_ports_probed).toBeGreaterThan(0);

    // Validar código Rust Tokio
    const rsContent = readFileSync(rsScript, 'utf8');
    expect(rsContent).toContain('pub struct TokioPortScanner');
    expect(rsContent).toContain('tokio::sync::Semaphore');
    expect(rsContent).toContain('TcpStream::connect');
  });

  test('4. Integridad Cognitiva: Ruteador Semántico y 6 Ejemplares Golden sin placebos', () => {
    // 6 ejemplares contrastivos
    const exemplars = GoldenExemplarsEngine.getAllExemplars();
    expect(exemplars.length).toBe(6);

    const ids = exemplars.map((e) => e.id);
    expect(ids).toContain('file-hashing-stream');
    expect(ids).toContain('safe-port-scanner');
    expect(ids).toContain('dos-defense-ethics');
    expect(ids).toContain('overthewire-wargames-defense');

    for (const ex of exemplars) {
      expect(ex.antigravityResponse.code.length).toBeGreaterThan(50);
      expect(ex.antigravityResponse.interpretation.length).toBeGreaterThan(20);
    }

    // Ruteador semántico inmune a typos
    const routedOtw = DynamicContextRouter.routeContext('auditoria de vulnerabilidades en overthewire con dednegacion');
    expect(routedOtw.primaryDomain).toBe('CYBERSECURITY_TACTICAL');
    expect(routedOtw.activeModules).toContain('AntiDosDefenseDoctrine (Pai Mei Educational Guardrail)');
  });

  test('5. Manifiesto y Filosofía FOSS: Piedra Angular Soberana', () => {
    const identity = KodaraPhilosophyEngine.getIdentity();
    expect(identity.license).toContain('100% Free & Open Source');
    expect(identity.genericName).toBe('Cabina Táctica de Ciberseguridad, Desarrollo Seguro y Evolución Autónoma');

    const pillars = KodaraPhilosophyEngine.getPillars();
    expect(pillars.length).toBe(4);

    const ethics = KodaraPhilosophyEngine.getEthicsComparison();
    expect(ethics.length).toBeGreaterThanOrEqual(3);
  });

  test('6. Verificación Visual de la Cabina: Avatar Circular LinkedIn y Paridad de Antigravity', () => {
    const dashboardPath = resolve(rootDir, 'src/web/dashboard.html');
    expect(existsSync(dashboardPath)).toBe(true);

    const html = readFileSync(dashboardPath, 'utf8');

    // Avatar circular de Pai Mei
    expect(html).toContain('id="brandPaiMeiAvatar"');
    expect(html).toContain('.pai-mei-avatar-ring');
    expect(html).toContain('#0a66c2');
    expect(html).toContain('#10b981');
    expect(html).toContain('title="Maestro Pai Mei — Mentor Cognitivo y Guardián Marcial de Kodara"');

    // Sidebar CRUD y paridad Antigravity
    expect(html).toContain('agProjectsFilterBar');
    expect(html).toContain('createNewProjectConversation');
    expect(html).toContain('startInlineRename');
    expect(html).toContain('agConfirmDeleteModal');

    // Memorias duales y Piedra Angular
    expect(html).toContain('wbPane_projectMemory');
    expect(html).toContain('wbPane_coreMemory');
    expect(html).toContain('toggleKodaraPhilosophyManifesto');
  });

  test('7. Garantía de Cero Placebos: Prohibición de funciones ficticias y falsos TODOs', () => {
    const kodaraSrcDir = resolve(rootDir, 'src/kodara');
    // Excluir la carpeta __tests__ del escaneo de código de producción
    const grepRes = spawnSync('grep', ['-rn', '--exclude-dir=__tests__', '// TODO', kodaraSrcDir], { encoding: 'utf8' });

    // Cada ocurrencia de '// TODO' en el código fuente de kodara debe ser una regla explícita de prohibición
    const lines = grepRes.stdout.trim().split('\n').filter(Boolean);
    expect(lines.length).toBeGreaterThan(0);
    for (const line of lines) {
      const isProhibitionRule =
        line.includes('Prohibición') ||
        line.includes('PROHIBIDO') ||
        line.includes('CERO FRICCIÓN') ||
        line.includes('sin // TODOs') ||
        line.includes('comentarios como') ||
        line.includes('Usa `// TODO') ||
        line.includes('Blindaje de Fricción') ||
        line.includes('CERO CÓDIGO INCOMPLETO') ||
        line.includes('Defectos:');
      expect(isProhibitionRule).toBe(true);
    }
  });
});
