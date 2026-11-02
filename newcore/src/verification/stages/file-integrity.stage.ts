// ═══════════════════════════════════════════════════════════════
// KODARA VERIFICATION ENGINE: Stage 1 - File Integrity
// "Your Code. Your AI. Your Rules."
// Valida que los archivos afectados existan, no estén truncados,
// tengan balance de llaves/paréntesis y carezcan de sintaxis rota.
// ═══════════════════════════════════════════════════════════════

import { existsSync, readFileSync, statSync } from 'fs';
import { resolve, join } from 'path';
import { StageResult } from '../verification.interface.js';

export class FileIntegrityStage {
  public static async execute(
    workspaceDir: string,
    targetFiles: string[] = []
  ): Promise<StageResult> {
    const start = Date.now();
    const findings: string[] = [];
    let passed = true;

    if (targetFiles.length === 0) {
      return {
        stage: 'FILE_INTEGRITY',
        passed: true,
        durationMs: Date.now() - start,
        findings: ['No se especificaron archivos objetivo; integridad omitida formalmente.'],
      };
    }

    for (const relPath of targetFiles) {
      const fullPath = resolve(workspaceDir, relPath);

      // 1. Existencia física
      if (!existsSync(fullPath)) {
        passed = false;
        findings.push(`Archivo inexistente: "${relPath}".`);
        continue;
      }

      // 2. Archivo no vacío (0 bytes)
      const stat = statSync(fullPath);
      if (stat.size === 0) {
        passed = false;
        findings.push(`Archivo vacío (0 bytes detectados): "${relPath}".`);
        continue;
      }

      // 3. Balance sintáctico básico para archivos de código
      const isCodeFile = /\.(ts|js|rs|py|json|go)$/i.test(relPath);
      if (isCodeFile) {
        try {
          const content = readFileSync(fullPath, 'utf-8');

          if (relPath.endsWith('.json')) {
            JSON.parse(content);
          } else {
            const openBraces = (content.match(/\{/g) || []).length;
            const closeBraces = (content.match(/\}/g) || []).length;
            if (openBraces !== closeBraces) {
              passed = false;
              findings.push(
                `Desbalance de llaves en "${relPath}": ${openBraces} abiertas vs ${closeBraces} cerradas.`
              );
            }

            const openParens = (content.match(/\(/g) || []).length;
            const closeParens = (content.match(/\)/g) || []).length;
            if (openParens !== closeParens) {
              passed = false;
              findings.push(
                `Desbalance de paréntesis en "${relPath}": ${openParens} abiertos vs ${closeParens} cerrados.`
              );
            }
          }
        } catch (err: any) {
          passed = false;
          findings.push(`Error de análisis de integridad en "${relPath}": ${err.message}`);
        }
      }
    }

    if (passed && findings.length === 0) {
      findings.push(`Todos los ${targetFiles.length} archivos verificados pasaron la auditoría de integridad.`);
    }

    return {
      stage: 'FILE_INTEGRITY',
      passed,
      durationMs: Date.now() - start,
      findings,
      errorDetails: passed ? undefined : findings.join(' | '),
    };
  }
}
