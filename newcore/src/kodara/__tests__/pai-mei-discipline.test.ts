import { describe, expect, test } from 'bun:test';
import { DynamicContextRouter } from '../knowledge/dynamic-context-router.js';
import { GOLDEN_EXEMPLARS } from '../knowledge/golden-exemplars.js';

describe('Dojo de Pai Mei: Disciplina Marcial, Intent Gating y la Doble Forja en Kodara', () => {
  test('1. El Ruteador de Contexto inyecta la Disciplina Marcial y prohibición de clichés robóticos', () => {
    const route = DynamicContextRouter.routeContext('enséñame cómo crear un escáner');
    const prompt = route.systemPromptBlock;

    expect(prompt).toContain('DISCIPLINA MARCIAL PAI MEI');
    expect(prompt).toContain('<pensamiento_kodara>');
    expect(prompt).toContain('CONCENTRACIÓN DE CHI OBLIGATORIA');
    expect(prompt).toContain('PROHIBIDO TERMINANTEMENTE');
    expect(prompt).toContain('El usuario pide');
    expect(prompt).toContain('primera persona');
    expect(prompt).toContain('DOBLE FORJA');
  });

  test('2. El Ejemplo 2 incorpora la Doble Forja: Python Asyncio y Rust Tokio Nativo', () => {
    const exemplar2 = GOLDEN_EXEMPLARS.find((e) => e.id === 'safe-port-scanner');
    expect(exemplar2).toBeDefined();

    const code = exemplar2?.antigravityResponse.code || '';
    // Forja 1: Python
    expect(code).toContain('FORJA 1 (PYTHON ASYNCIO)');
    expect(code).toContain('class DefensivePortAuditor:');
    expect(code).toContain('asyncio.Semaphore(max_concurrency)');
    expect(code).toContain('writer.write(b"\\r\\n")');

    // Forja 2: Rust Tokio
    expect(code).toContain('FORJA 2 (RUST TOKIO)');
    expect(code).toContain('TokioPortScanner');
    expect(code).toContain('TcpStream::connect');
    expect(code).toContain('Semaphore::new');
  });

  test('3. El Ejemplo 2 erradica la voz pasiva de escribano y habla en primera persona marcial', () => {
    const exemplar2 = GOLDEN_EXEMPLARS.find((e) => e.id === 'safe-port-scanner');
    const interpretation = exemplar2?.antigravityResponse.interpretation || '';

    expect(interpretation.toLowerCase()).not.toContain('el usuario');
    expect(interpretation.toLowerCase()).not.toContain('se solicita');
    expect(interpretation).toContain('Abordaremos la auditoría de puertos');
    expect(interpretation).toContain('Doble Forja');
  });

  test('4. El catálogo formativo cataloga la falla de Errno 24 (ulimit -n) y la física del socket', () => {
    const exemplar2 = GOLDEN_EXEMPLARS.find((e) => e.id === 'safe-port-scanner');
    const flaws = exemplar2?.badResponse.flaws || [];

    expect(flaws.some((f) => f.includes('Errno 24') && f.includes('Too many open files'))).toBe(true);
    expect(flaws.some((f) => f.includes('CWE-78'))).toBe(true);
    expect(flaws.some((f) => f.includes('SSRF'))).toBe(true);
  });
});
