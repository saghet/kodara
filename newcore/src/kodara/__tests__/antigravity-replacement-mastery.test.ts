// ═══════════════════════════════════════════════════════════════
// KODARA ANTIGRAVITY REPLACEMENT MASTERY — Test Suite
// Verificación integral de la transición de Kodara a reemplazo total
// de Google Antigravity: Tarjeta de Acción Sandbox, Doble Forja Tokio,
// y Consola Interactiva en Tiempo Real.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from 'bun:test';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

describe('Kodara Antigravity Replacement Mastery: Acción Interactiva y Doble Forja', () => {
  const scratchDir = resolve(__dirname, '../../../scratch');
  const pythonScript = resolve(scratchDir, 'verify_port_auditor.py');
  const rustScript = resolve(scratchDir, 'verify_port_scanner_tokio.rs');
  const dashboardHtmlPath = resolve(__dirname, '../../web/dashboard.html');
  const serverTsPath = resolve(__dirname, '../../server.ts');

  it('1. El script de sandbox verify_port_auditor.py existe y se ejecuta físicamente con JSON estructurado', () => {
    expect(existsSync(pythonScript)).toBe(true);

    const proc = spawnSync('python3', [pythonScript, '127.0.0.1'], {
      encoding: 'utf-8',
      timeout: 5000,
    });

    expect(proc.status).toBe(0);
    const output = proc.stdout.trim();
    expect(output.length).toBeGreaterThan(0);

    const parsed = JSON.parse(output);
    expect(parsed).toHaveProperty('target');
    expect(parsed).toHaveProperty('open_ports');
    expect(parsed).toHaveProperty('open_ports_count');
    expect(parsed).toHaveProperty('elapsed_ms');
    expect(parsed.status).toBe('SUCCESS');
    expect(parsed.open_ports_count).toBeGreaterThanOrEqual(1);
    expect(parsed.elapsed_ms).toBeGreaterThan(0);
  });

  it('2. El motor nativo en Rust Tokio (verify_port_scanner_tokio.rs) implementa TokioPortScanner y Semáforos de Concurrencia', () => {
    expect(existsSync(rustScript)).toBe(true);
    const rustCode = readFileSync(rustScript, 'utf-8');

    // Validación de arquitectura Tokio
    expect(rustCode).toContain('struct TokioPortScanner');
    expect(rustCode).toContain('TcpStream::connect');
    expect(rustCode).toContain('Arc<Semaphore>');
    expect(rustCode).toContain('tokio::time::timeout');
    expect(rustCode).toContain('Duration::from_millis');
    expect(rustCode).toContain('PortAuditSummary');
  });

  it('3. El Dashboard de Kodara contiene la Tarjeta de Acción de Sandbox y su ejecutor interactivo', () => {
    expect(existsSync(dashboardHtmlPath)).toBe(true);
    const html = readFileSync(dashboardHtmlPath, 'utf-8');

    expect(html).toContain('function renderSandboxActionCardHTML');
    expect(html).toContain('async function triggerSandboxAction');
    expect(html).toContain('▶ Probar en Sandbox en Vivo');
    expect(html).toContain('/api/kodara/sandbox-run');
    expect(html).toContain('sandboxConsole_');
    expect(html).toContain('attachedSandboxHtml');
  });

  it('4. El servidor server.ts cuenta con el endpoint /api/kodara/sandbox-run y emisión de evento sandboxAction', () => {
    expect(existsSync(serverTsPath)).toBe(true);
    const serverCode = readFileSync(serverTsPath, 'utf-8');

    expect(serverCode).toContain('/api/kodara/sandbox-run');
    expect(serverCode).toContain('sandboxAction');
    expect(serverCode).toContain('verify_port_auditor.py');
    expect(serverCode).toContain('CODING_AUTONOMOUS');
    expect(serverCode).toContain('CYBERSECURITY_TACTICAL');
  });
});
