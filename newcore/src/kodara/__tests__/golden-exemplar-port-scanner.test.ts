import { describe, expect, test } from 'bun:test';
import {
  GoldenExemplarsEngine,
  GOLDEN_EXEMPLARS,
} from '../knowledge/golden-exemplars.js';
import {
  CYBERSECURITY_ACADEMY_CURRICULUM,
} from '../knowledge/cybersecurity-academy.js';

describe('Auditoría Pedagógica del Ejemplo 2: Escáner de Red Defensivo y Semáforos de Concurrencia', () => {
  const exemplar2 = GOLDEN_EXEMPLARS.find((e) => e.id === 'safe-port-scanner');

  test('1. El Ejemplo 2 identifica y cataloga todas las vulnerabilidades del código deficiente', () => {
    expect(exemplar2).toBeDefined();
    const flaws = exemplar2?.badResponse.flaws || [];
    expect(flaws.length).toBeGreaterThanOrEqual(4);
    expect(flaws.some((f) => f.includes('CWE-78') || f.toLowerCase().includes('inyección'))).toBe(true);
    expect(flaws.some((f) => f.includes('Errno 24') || f.toLowerCase().includes('descriptores'))).toBe(true);
    expect(flaws.some((f) => f.toLowerCase().includes('banner'))).toBe(true);
    expect(flaws.some((f) => f.includes('SSRF') || f.toLowerCase().includes('sanitiza'))).toBe(true);
  });

  test('2. La implementación Antigravity incluye Semáforo Asíncrono para prevenir Errno 24', () => {
    expect(exemplar2).toBeDefined();
    const code = exemplar2?.antigravityResponse.code || '';
    expect(code).toContain('asyncio.Semaphore');
    expect(code).toContain('async with self.semaphore:');
    expect(code).toContain('max_concurrency');
    expect(code.toLowerCase()).not.toContain('// todo');
    expect(code.toLowerCase()).not.toContain('# todo');
  });

  test('3. Incorpora inspección de Three-Way Handshake TCP y Banner Grabbing pasivo', () => {
    const code = exemplar2?.antigravityResponse.code || '';
    expect(code).toContain('Three-Way Handshake');
    expect(code).toContain('writer.write(b"\\r\\n")');
    expect(code).toContain('reader.read(128)');
    expect(code).toContain('writer.wait_closed()');
    expect(code).toContain('ipaddress.ip_address');
  });

  test('4. Cumple con la estructura estricta de 4 fases de Programación Autónoma', () => {
    expect(exemplar2?.antigravityResponse.interpretation).toBeDefined();
    expect(exemplar2?.antigravityResponse.interpretation.toLowerCase()).toContain('semáforo');
    expect(exemplar2?.antigravityResponse.environment.toLowerCase()).toContain('biblioteca estándar');
    expect(exemplar2?.antigravityResponse.code.length).toBeGreaterThan(100);
    expect(exemplar2?.antigravityResponse.usage).toContain('DefensivePortAuditor');
  });

  test('5. El Módulo 1 de la Academia Universitaria (recon-osint) enseña la física del handshake y descriptores en Linux', () => {
    const reconModule = CYBERSECURITY_ACADEMY_CURRICULUM.find((m) => m.id === 'recon-osint');
    expect(reconModule).toBeDefined();

    const theory = reconModule?.theoreticalFoundations || [];
    expect(theory.some((t) => t.includes('Three-Way Handshake TCP'))).toBe(true);
    expect(theory.some((t) => t.includes('Errno 24') || t.includes('Descriptores'))).toBe(true);

    const arch = reconModule?.softwareArchitecture || [];
    expect(arch.some((a) => a.includes('Semaphore'))).toBe(true);
    expect(arch.some((a) => a.includes('banners'))).toBe(true);
  });
});
