// ═══════════════════════════════════════════════════════════════
// KODARA VERIFICATION ENGINE: Stage 2 - Static Analysis (SAST)
// "Your Code. Your AI. Your Rules."
// Escaneo estático de seguridad, detección de inyecciones,
// secretos expuestos y construcciones peligrosas antes de compilar.
// ═══════════════════════════════════════════════════════════════

import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { StageResult } from '../verification.interface.js';

export interface SASTRule {
  id: string;
  severity: 'HIGH' | 'CRITICAL' | 'MEDIUM';
  description: string;
  pattern: RegExp;
}

export class StaticAnalysisStage {
  private static readonly RULES: SASTRule[] = [
    {
      id: 'SAST-001',
      severity: 'CRITICAL',
      description: 'Uso peligroso de eval() o new Function() que permite inyección de código arbitrario.',
      pattern: /\b(?:eval|new\s+Function)\s*\(/i,
    },
    {
      id: 'SAST-002',
      severity: 'CRITICAL',
      description: 'Clave privada o secreto sensible hardcodeado en el código fuente.',
      pattern: /(?:-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----|sk-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{20,})/i,
    },
    {
      id: 'SAST-003',
      severity: 'HIGH',
      description: 'Posible inyección SQL mediante concatenación directa en la consulta.',
      pattern: /\bSELECT\b.*\bFROM\b.*\bWHERE\b.*=\s*['"]?\s*\+\s*[a-zA-Z0-9_]+/i,
    },
    {
      id: 'SAST-004',
      severity: 'HIGH',
      description: 'Invocación desprotegida de comando shell vulnerable a Command Injection.',
      pattern: /\bchild_process\.(?:exec|execSync)\s*\(\s*`[^`]*\${[a-zA-Z0-9_]+}[^`]*`\s*\)/i,
    },
  ];

  public static async execute(
    workspaceDir: string,
    targetFiles: string[] = []
  ): Promise<StageResult> {
    const start = Date.now();
    const findings: string[] = [];
    let passed = true;

    for (const relPath of targetFiles) {
      const fullPath = resolve(workspaceDir, relPath);
      if (!existsSync(fullPath)) continue;

      const isCodeFile = /\.(ts|js|rs|py|go)$/i.test(relPath);
      if (!isCodeFile) continue;

      const content = readFileSync(fullPath, 'utf-8');

      for (const rule of this.RULES) {
        if (rule.pattern.test(content)) {
          passed = false;
          findings.push(
            `[${rule.severity}] ${rule.id} en "${relPath}": ${rule.description}`
          );
        }
      }
    }

    if (passed) {
      findings.push('Análisis SAST completado sin hallazgos críticos ni de alta severidad (0 HIGH, 0 CRITICAL).');
    }

    return {
      stage: 'STATIC_ANALYSIS',
      passed,
      durationMs: Date.now() - start,
      findings,
      errorDetails: passed ? undefined : findings.join(' | '),
    };
  }
}
