import { describe, expect, test } from 'bun:test';
import { spawnSync } from 'child_process';
import path from 'path';
import { GoldenExemplarsEngine } from '../knowledge/golden-exemplars.js';

describe('La Técnica Definitiva de Pai Mei: Ejecución Física en Sandbox y Física de Redes', () => {
  const scriptPath = path.resolve(__dirname, '../../../scratch/verify_port_auditor.py');

  test('1. Ejecución física del código propio en Sandbox ejecuta sin errores (Exit Code 0)', () => {
    const proc = spawnSync('python3', [scriptPath, '127.0.0.1'], {
      encoding: 'utf-8',
      timeout: 10000,
    });

    expect(proc.status).toBe(0);
    expect(proc.stdout).toBeDefined();

    const report = JSON.parse(proc.stdout);
    expect(report.status).toBe('SUCCESS');
    expect(report.target).toBe('127.0.0.1');
    expect(report.total_ports_probed).toBeGreaterThanOrEqual(8);
    expect(report.elapsed_ms).toBeLessThan(3000);
  });

  test('2. El auditor propio de Kodara detecta físicamente los puertos locales activos sin Nmap', () => {
    const proc = spawnSync('python3', [scriptPath, '127.0.0.1'], {
      encoding: 'utf-8',
      timeout: 10000,
    });
    const report = JSON.parse(proc.stdout);

    // Debe detectar el puerto de Kodara (3777) y el de Ollama (11434)
    expect(report.open_ports['3777']).toBeDefined();
    expect(report.open_ports['3777'].estado).toBe('ABIERTO');

    expect(report.open_ports['11434']).toBeDefined();
    expect(report.open_ports['11434'].estado).toBe('ABIERTO');
    // Ollama devuelve banner HTTP
    expect(report.open_ports['11434'].banner).toContain('HTTP');
  });

  test('3. El reporte de física de redes valida la matemática del Three-Way Handshake TCP', () => {
    const physics = GoldenExemplarsEngine.getTcpHandshakePhysicsReport();

    // Verificación ISN y RFC 6528
    expect(physics.syn_seq).toContain('ISN_c');
    expect(physics.syn_seq).toContain('RFC 6528');

    // Verificación incremento de ACK (Seq + 1)
    expect(physics.syn_ack_seq).toContain('ISN_c + 1');
    expect(physics.ack_seq).toContain('ISN_s + 1');

    // Verificación de comportamiento RST vs DROP
    expect(physics.rst_behavior).toContain('RST=1');
    expect(physics.drop_behavior).toContain('DROP');

    // Verificación de TIME_WAIT y descriptores
    expect(physics.time_wait_equation).toContain('2 * MSL');
    expect(physics.fd_limit_math).toContain('ulimit -n');
    expect(physics.sandbox_verified_ports).toContain(3777);
    expect(physics.sandbox_verified_ports).toContain(11434);
  });
});
