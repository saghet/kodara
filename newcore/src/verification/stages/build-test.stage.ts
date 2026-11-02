// ═══════════════════════════════════════════════════════════════
// KODARA VERIFICATION ENGINE: Stage 3 - Build & Test Execution
// "Your Code. Your AI. Your Rules."
// Compila el código modificado y ejecuta las suites de prueba
// de forma asíncrona y no bloqueante mediante SystemRuntimeEngine.
// ═══════════════════════════════════════════════════════════════

import { SystemRuntimeEngine } from '../../runtime/index.js';
import { StageResult } from '../verification.interface.js';

export class BuildTestStage {
  public static async execute(
    workspaceDir: string,
    testCommand?: string,
    buildCommand?: string
  ): Promise<StageResult> {
    const start = Date.now();
    const runtime = SystemRuntimeEngine.getInstance();
    const findings: string[] = [];

    // 1. Ejecución opcional de comando de construcción (build)
    if (buildCommand) {
      const buildRes = await runtime.executeCommandSafe({
        command: buildCommand,
        workspaceDir,
        timeoutMs: 60000,
      });

      if (buildRes.exitCode !== 0) {
        return {
          stage: 'BUILD_AND_TEST',
          passed: false,
          durationMs: Date.now() - start,
          findings: [`Fallo en la fase de construcción (\`${buildCommand}\`): exit code ${buildRes.exitCode}`],
          errorDetails: buildRes.stderr || buildRes.stdout,
          commandRun: buildCommand,
        };
      }
      findings.push(`Compilación exitosa: \`${buildCommand}\` completado con código 0.`);
    }

    // 2. Ejecución obligatoria de suite de pruebas
    const effectiveTestCmd = testCommand || 'bun test';
    const testRes = await runtime.executeCommandSafe({
      command: effectiveTestCmd,
      workspaceDir,
      timeoutMs: 90000,
    });

    const passed = testRes.exitCode === 0;
    if (passed) {
      findings.push(`Pruebas superadas exitosamente: \`${effectiveTestCmd}\` exit code 0.`);
    } else {
      findings.push(`Fallo en las pruebas unitarias: \`${effectiveTestCmd}\` falló con código ${testRes.exitCode}.`);
    }

    return {
      stage: 'BUILD_AND_TEST',
      passed,
      durationMs: Date.now() - start,
      findings,
      errorDetails: passed ? undefined : (testRes.stderr || testRes.stdout).slice(-600),
      commandRun: effectiveTestCmd,
    };
  }
}
