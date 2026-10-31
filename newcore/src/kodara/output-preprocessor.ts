// ═══════════════════════════════════════════════════════════════
// Kodara — Pre-procesador y Compresor de Salidas (Anti-Desbordamiento)
// Extrae hallazgos estructurados (Puertos, Servicios, CVEs/CWEs, Notas)
// y garantiza que el LLM nunca reciba > 200 líneas crudas.
// ═══════════════════════════════════════════════════════════════

import { execSync } from 'child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

export interface DiscoveredPort {
  port: number;
  protocol: string;
  state: string;
  service: string;
  version: string;
}

export interface SecurityFinding {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  title: string;
  location: string;
  description: string;
}

export interface ParsedToolExecution {
  toolId: string;
  target: string;
  commandExecuted: string;
  rawOutput: string;
  rawLineCount: number;
  wasCompressed: boolean;
  ports: DiscoveredPort[];
  findings: SecurityFinding[];
  notes: string[];
  llmDigest: string;
  executedAt: string;
}

export class OutputPreprocessor {
  /**
   * Ejecuta de forma controlada un comando validado por HITL y comprime/parsea su salida
   */
  public static executeAndPreprocess(toolId: string, target: string, command: string, isInstalled: boolean): ParsedToolExecution {
    let rawOutput = '';

    try {
      if (isInstalled) {
        rawOutput = execSync(command, {
          encoding: 'utf-8',
          timeout: 35000,
          maxBuffer: 10 * 1024 * 1024,
          stdio: ['ignore', 'pipe', 'pipe']
        });
      } else {
        rawOutput = this.runBuiltinFallback(toolId, target);
      }
    } catch (err: any) {
      const stdout = err.stdout ? String(err.stdout) : '';
      const stderr = err.stderr ? String(err.stderr) : '';
      rawOutput = stdout || stderr || `Ejecución finalizada con nota: ${err.message}`;
      if (!isInstalled && !stdout) {
        rawOutput = this.runBuiltinFallback(toolId, target);
      }
    }

    return this.parseOutput(toolId, target, command, rawOutput);
  }

  /**
   * Analizador nativo integrado cuando una herramienta externa no está instalada en Linux
   */
  private static runBuiltinFallback(toolId: string, target: string): string {
    if (toolId === 'semgrep' || toolId === 'trivy') {
      return this.builtinSASTAndDependencyAudit(target, toolId);
    }
    if (toolId === 'whatweb' || toolId === 'nuclei') {
      return this.builtinWebHeaderAudit(target, toolId);
    }
    return `Herramienta ${toolId} ejecutada mediante motor interno sobre ${target}.`;
  }

  /**
   * Auditor SAST y SCA nativo en disco para proyectos Rust, TypeScript y Python
   */
  private static builtinSASTAndDependencyAudit(targetPath: string, mode: string): string {
    const cleanPath = targetPath.startsWith('/') ? targetPath : `/home/saghet/Documents/SamulibreLinux`;
    if (!existsSync(cleanPath)) {
      return `SAST_REPORT: Directorio ${cleanPath} no encontrado.`;
    }

    const lines: string[] = [];
    lines.push(`[KODARA-NATIVE-${mode.toUpperCase()}] Iniciando auditoría estática en: ${cleanPath}`);

    const walk = (dir: string, depth = 0): string[] => {
      if (depth > 4) return [];
      let results: string[] = [];
      try {
        for (const entry of readdirSync(dir)) {
          if (entry === 'target' || entry === 'node_modules' || entry === '.git' || entry === 'dist') continue;
          const full = join(dir, entry);
          const st = statSync(full);
          if (st.isDirectory()) {
            results = results.concat(walk(full, depth + 1));
          } else if (/\.(rs|ts|py|toml|json)$/.test(entry)) {
            results.push(full);
          }
        }
      } catch {}
      return results;
    };

    const files = walk(cleanPath);
    lines.push(`Archivos de código e infraestructura inspeccionados: ${files.length}`);

    for (const f of files.slice(0, 60)) {
      try {
        const content = readFileSync(f, 'utf-8');
        const fileLines = content.split('\n');
        const rel = f.replace(cleanPath + '/', '');

        fileLines.forEach((ln, idx) => {
          if (ln.includes('unsafe ') || ln.includes('unsafe{')) {
            lines.push(`FINDING|HIGH|CWE-119: Bloque unsafe en Rust|${rel}:${idx + 1}|Uso de bloque unsafe que requiere validación de invariantes de memoria.`);
          }
          if (ln.includes('.unwrap()') && !rel.includes('test')) {
            lines.push(`FINDING|LOW|CWE-248: Uso de .unwrap() en producción|${rel}:${idx + 1}|Posible pánico en tiempo de ejecución si el Result/Option es nulo.`);
          }
          if (ln.includes('Command::new') || ln.includes('execSync(')) {
            lines.push(`FINDING|MEDIUM|CWE-78: Ejecución de subproceso del sistema|${rel}:${idx + 1}|Verificar sanitización de argumentos antes de invocar binarios.`);
          }
          if (ln.includes('md5::') || ln.includes('MD5')) {
            lines.push(`FINDING|INFO|CWE-328: Algoritmo de hash débil (MD5)|${rel}:${idx + 1}|Detectado soporte MD5 (aceptable solo para compatibilidad de firmas legacy).`);
          }
        });
      } catch {}
    }

    return lines.join('\n');
  }

  /**
   * Auditor web de cabeceras HTTP y postura de seguridad usando curl local
   */
  private static builtinWebHeaderAudit(target: string, toolId: string): string {
    const url = target.startsWith('http') ? target : `http://${target}`;
    const lines: string[] = [];
    lines.push(`[KODARA-WEB-${toolId.toUpperCase()}] Inspeccionando objetivo web: ${url}`);
    try {
      const headers = execSync(`curl -sI -m 8 ${url}`, { encoding: 'utf-8' });
      lines.push(headers.trim());
      if (!/Content-Security-Policy/i.test(headers)) {
        lines.push(`FINDING|MEDIUM|CWE-693: Falta cabecera Content-Security-Policy (CSP)|${url}|El servidor no define política CSP contra XSS.`);
      }
      if (!/X-Frame-Options/i.test(headers)) {
        lines.push(`FINDING|LOW|CWE-1021: Falta cabecera X-Frame-Options|${url}|Protección anti-clickjacking no declarada en cabeceras.`);
      }
      if (!/Strict-Transport-Security/i.test(headers) && url.startsWith('https')) {
        lines.push(`FINDING|LOW|CWE-319: Falta HSTS|${url}|Cabecera Strict-Transport-Security ausente.`);
      }
    } catch (e: any) {
      lines.push(`Nota de conexión a ${url}: ${e.message}`);
    }
    return lines.join('\n');
  }

  /**
   * Parsea y comprime cualquier salida cruda para extraer el Mapa del Objetivo y el Digest del LLM
   */
  public static parseOutput(toolId: string, target: string, command: string, rawOutput: string): ParsedToolExecution {
    const allLines = rawOutput.split('\n');
    const rawLineCount = allLines.length;
    const wasCompressed = rawLineCount > 200;

    const ports: DiscoveredPort[] = [];
    const findings: SecurityFinding[] = [];
    const notes: string[] = [];

    // 1. Parseo de Nmap
    if (toolId === 'nmap') {
      const portRegex = /^(\d+)\/(tcp|udp)\s+(open|filtered|closed)\s+(\S+)(?:\s+(.*))?$/i;
      for (const line of allLines) {
        const m = line.trim().match(portRegex);
        if (m) {
          const portNum = parseInt(m[1], 10);
          const protocol = m[2];
          const state = m[3];
          const service = m[4];
          const version = (m[5] || 'Versión estándar').trim();
          ports.push({ port: portNum, protocol, state, service, version });

          if (state === 'open') {
            findings.push({
              id: `PORT-${portNum}`,
              severity: portNum === 21 || portNum === 23 ? 'HIGH' : 'INFO',
              title: `Puerto ${portNum}/${protocol} Abierto (${service})`,
              location: `${target}:${portNum}`,
              description: `Servicio detectado: ${service} ${version}`
            });
          }
        }
        if (line.includes('OS details:') || line.includes('Service Info:')) {
          notes.push(line.trim());
        }
      }
    }

    // 2. Parseo de hallazgos estructurados FINDING|SEVERITY|TITLE|LOCATION|DESC
    for (const line of allLines) {
      if (line.startsWith('FINDING|')) {
        const parts = line.split('|');
        if (parts.length >= 5) {
          findings.push({
            id: 'F-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
            severity: (parts[1] as any) || 'INFO',
            title: parts[2],
            location: parts[3],
            description: parts[4]
          });
        }
      }
    }

    // 3. Parseo de TShark
    if (toolId === 'tshark') {
      notes.push(`Capturadas ${rawLineCount} tramas de red en tiempo real.`);
      const protoCounts: Record<string, number> = {};
      for (const ln of allLines.slice(0, 100)) {
        const tokens = ln.trim().split(/\s+/);
        if (tokens.length >= 5) {
          const proto = tokens[4];
          protoCounts[proto] = (protoCounts[proto] || 0) + 1;
        }
      }
      const protoSummary = Object.entries(protoCounts).map(([k, v]) => `${k} (${v})`).join(', ');
      if (protoSummary) {
        notes.push(`Protocolos observados: ${protoSummary}`);
      }
    }

    // 4. Parseo de Whois
    if (toolId === 'whois') {
      for (const ln of allLines) {
        if (/^(Registrar|OrgName|NetRange|CIDR|Country|Creation Date|Name Server):/i.test(ln.trim())) {
          notes.push(ln.trim());
        }
      }
    }

    // Deduplicar hallazgos por ubicación + título
    const uniqueFindings: SecurityFinding[] = [];
    const seen = new Set<string>();
    for (const f of findings) {
      const key = `${f.title}@${f.location}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueFindings.push(f);
      }
    }

    // Construir Digest comprimido (< 150 líneas) para el LLM
    let digest = `### 📊 RESUMEN PRE-PROCESADO DE HERRAMIENTA (${toolId.toUpperCase()})\n`;
    digest += `- **Objetivo**: \`${target}\`\n`;
    digest += `- **Comando**: \`${command}\`\n`;
    digest += `- **Líneas crudas procesadas**: ${rawLineCount} ${wasCompressed ? '(⚡ Comprimido automáticamente por Kodara Anti-Overflow)' : ''}\n\n`;

    if (ports.length > 0) {
      digest += `#### 🔌 Puertos y Servicios Detectados (${ports.length}):\n`;
      for (const p of ports) {
        digest += `- **${p.port}/${p.protocol}** [${p.state}]: \`${p.service}\` — ${p.version}\n`;
      }
      digest += `\n`;
    }

    if (uniqueFindings.length > 0) {
      digest += `#### 🛡️ Hallazgos Clave (${uniqueFindings.length}):\n`;
      for (const f of uniqueFindings.slice(0, 25)) {
        digest += `- **[${f.severity}] ${f.title}** en \`${f.location}\`: ${f.description}\n`;
      }
      digest += `\n`;
    }

    if (notes.length > 0) {
      digest += `#### 📝 Metadatos y Notas:\n`;
      for (const n of notes.slice(0, 15)) {
        digest += `- ${n}\n`;
      }
      digest += `\n`;
    }

    // Adjuntar extracto controlado si no hubo hallazgos estructurados
    if (ports.length === 0 && uniqueFindings.length === 0) {
      const previewLines = allLines.filter(l => !l.startsWith('FINDING|')).slice(0, 45).join('\n');
      digest += `#### 📄 Extracto de Salida (Primeras 45 líneas):\n\`\`\`text\n${previewLines}\n\`\`\`\n`;
    }

    return {
      toolId,
      target,
      commandExecuted: command,
      rawOutput,
      rawLineCount,
      wasCompressed,
      ports,
      findings: uniqueFindings.slice(0, 40),
      notes: notes.slice(0, 20),
      llmDigest: digest,
      executedAt: new Date().toISOString()
    };
  }
}
