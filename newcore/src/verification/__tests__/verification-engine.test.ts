// ═══════════════════════════════════════════════════════════════
// KODARA TEST SUITE: Verification Engine & Auto-Repair (Fase 8)
// "Your Code. Your AI. Your Rules."
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { resolve, join } from 'path';
import { writeFileSync, unlinkSync, mkdirSync, rmdirSync, existsSync } from 'fs';
import {
  VerificationEngine,
  FileIntegrityStage,
  StaticAnalysisStage,
  BuildTestStage,
  AutoRepairLoop,
} from '../index.js';
import { ProjectMemoryEngine } from '../../project-memory/index.js';

describe('Verification Engine & Auto-Repair Loop (Fase 8)', () => {
  const engine = VerificationEngine.getInstance();
  const testDir = resolve(process.cwd(), 'scratch', `test_verif_${Date.now()}`);

  beforeEach(() => {
    if (!existsSync(testDir)) {
      mkdirSync(testDir, { recursive: true });
    }
  });

  afterEach(() => {
    try {
      if (existsSync(testDir)) {
        // Limpiar archivos de prueba
      }
    } catch {}
  });

  it('1. FileIntegrityStage: Detecta archivos inexistentes, vacíos y desbalance sintáctico', async () => {
    // Archivo vacío
    const emptyFile = join(testDir, 'empty.ts');
    writeFileSync(emptyFile, '');

    // Archivo con llaves desbalanceadas
    const brokenFile = join(testDir, 'broken.ts');
    writeFileSync(brokenFile, 'export function test() { const a = 1;'); // Falta llave de cierre

    const result = await FileIntegrityStage.execute(testDir, ['empty.ts', 'broken.ts', 'non_existent.ts']);
    expect(result.passed).toBe(false);
    expect(result.findings.some((f) => f.includes('Archivo vacío'))).toBe(true);
    expect(result.findings.some((f) => f.includes('Desbalance de llaves'))).toBe(true);
    expect(result.findings.some((f) => f.includes('Archivo inexistente'))).toBe(true);

    // Archivo limpio
    const cleanFile = join(testDir, 'clean.ts');
    writeFileSync(cleanFile, 'export function clean() { return 42; }');
    const cleanResult = await FileIntegrityStage.execute(testDir, ['clean.ts']);
    expect(cleanResult.passed).toBe(true);
  });

  it('2. StaticAnalysisStage: Detecta vulnerabilidades SAST críticas y patrones inseguros', async () => {
    const vulnerableFile = join(testDir, 'vuln.ts');
    writeFileSync(vulnerableFile, `
      const userInput = "console.log('injected')";
      eval(userInput);
      const secret = "sk-abcdef1234567890abcdef123456";
    `);

    const result = await StaticAnalysisStage.execute(testDir, ['vuln.ts']);
    expect(result.passed).toBe(false);
    expect(result.findings.some((f) => f.includes('SAST-001'))).toBe(true);
    expect(result.findings.some((f) => f.includes('SAST-002'))).toBe(true);

    const safeFile = join(testDir, 'safe.ts');
    writeFileSync(safeFile, 'export const safeValue = 100;');
    const safeResult = await StaticAnalysisStage.execute(testDir, ['safe.ts']);
    expect(safeResult.passed).toBe(true);
  });

  it('3. BuildTestStage: Ejecuta comandos de forma asíncrona y valida exitCode 0', async () => {
    // Comando exitoso
    const successRes = await BuildTestStage.execute(testDir, 'echo "test pass"');
    expect(successRes.passed).toBe(true);
    expect(successRes.findings.some((f) => f.includes('exit code 0') || f.includes('código 0'))).toBe(true);

    // Comando fallido intencional
    const failRes = await BuildTestStage.execute(testDir, 'false');
    expect(failRes.passed).toBe(false);
  });

  it('4. VerificationEngine: Ejecuta el pipeline completo de 4 etapas sobre un workspace limpio', async () => {
    const cleanFile = join(testDir, 'app.ts');
    writeFileSync(cleanFile, 'export function main() { console.log("OK"); }');

    const report = await engine.verifyWorkspace({
      projectId: 'proj_verif_test',
      workspaceDir: testDir,
      targetFiles: ['app.ts'],
      testCommand: 'echo "unit tests passed"',
    });

    expect(report.passed).toBe(true);
    expect(report.stages.length).toBe(4);
    expect(report.stages.every((s) => s.passed)).toBe(true);
    expect(report.summary).toContain('100%');
  });

  it('5. AutoRepairLoop: Diagnostica falla, aplica parche correctivo y re-verifica con éxito', async () => {
    const faultyFile = join(testDir, 'repair_me.ts');
    writeFileSync(faultyFile, 'export function sum(a: number, b: number) { return a - b; }'); // Error de lógica

    let testCommand = 'test -f missing_asset.txt'; // Falla intencionalmente

    const initialReport = await engine.verifyWorkspace({
      projectId: 'proj_repair_test',
      workspaceDir: testDir,
      targetFiles: ['repair_me.ts'],
      testCommand,
    });
    expect(initialReport.passed).toBe(false);

    // Ejecutar AutoRepairLoop con patch handler que corrige la falla
    const repairResult = await engine.verifyAndAutoRepair(
      {
        projectId: 'proj_repair_test',
        workspaceDir: testDir,
        targetFiles: ['repair_me.ts'],
        testCommand,
        maxRepairAttempts: 3,
      },
      async (report, attempt) => {
        // Crear el archivo faltante para corregir el error en el intento 1
        writeFileSync(join(testDir, 'missing_asset.txt'), 'asset fixed');
        return {
          applied: true,
          description: 'Creado missing_asset.txt requerido por las pruebas.',
          modifiedFiles: ['missing_asset.txt'],
        };
      }
    );

    expect(repairResult.success).toBe(true);
    expect(repairResult.attemptsCount).toBe(1);
    expect(repairResult.attempts[0].verifiedSuccess).toBe(true);
    expect(repairResult.finalReport.passed).toBe(true);

    // Comprobar que la solución se persistió en ProjectMemoryEngine
    const pmem = ProjectMemoryEngine.getInstance();
    const solutions = await pmem.listEntriesByTier('proj_repair_test', 'ERROR_SOLUTION');
    expect(solutions.length).toBeGreaterThanOrEqual(1);
  });

  it('6. AutoRepairLoop: Se detiene limpiamente al alcanzar el límite máximo de reintentos', async () => {
    const unfixableFile = join(testDir, 'unfixable.ts');
    writeFileSync(unfixableFile, 'export const x = 1;');

    const repairResult = await engine.verifyAndAutoRepair(
      {
        projectId: 'proj_unfixable',
        workspaceDir: testDir,
        targetFiles: ['unfixable.ts'],
        testCommand: 'false', // Siempre falla
        maxRepairAttempts: 2,
      },
      async () => {
        return { applied: true, description: 'Intento fallido sin solución', modifiedFiles: [] };
      }
    );

    expect(repairResult.success).toBe(false);
    expect(repairResult.attemptsCount).toBe(2);
    expect(repairResult.finalReport.passed).toBe(false);
  });
});
