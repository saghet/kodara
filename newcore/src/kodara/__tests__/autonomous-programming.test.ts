import { describe, expect, test } from 'bun:test';
import {
  AutonomousProgrammingEngine,
  ANTIGRAVITY_PRINCIPLES,
  STRUCTURED_RESPONSE_FLOW,
} from '../knowledge/autonomous-programming.js';

describe('Auditoría del Motor de Programación Autónoma ("Efecto Antigravity") en Kodara', () => {
  test('1. Los 4 principios fundamentales del Efecto Antigravity están definidos', () => {
    const principles = AutonomousProgrammingEngine.getPrinciples();
    expect(principles.length).toBe(4);

    const ids = principles.map((p) => p.id);
    expect(ids).toContain('deep-semantic-understanding');
    expect(ids).toContain('transparency-simplicity');
    expect(ids).toContain('self-documenting-spanish');
    expect(ids).toContain('zero-friction-no-todos');
  });

  test('2. Las 4 fases del flujo de respuesta estructurado están definidas en orden', () => {
    const steps = AutonomousProgrammingEngine.getStructureSteps();
    expect(steps.length).toBe(4);

    expect(steps[0].stepNumber).toBe(1);
    expect(steps[0].title.toLowerCase()).toContain('interpretación rápida');

    expect(steps[1].stepNumber).toBe(2);
    expect(steps[1].title.toLowerCase()).toContain('entorno y dependencias');

    expect(steps[2].stepNumber).toBe(3);
    expect(steps[2].title.toLowerCase()).toContain('código completo y funcional');

    expect(steps[3].stepNumber).toBe(4);
    expect(steps[3].title.toLowerCase()).toContain('uso directo');
    expect(steps[3].formatInstruction.toLowerCase()).toContain('import antigravity');
  });

  test('3. Prohibición estricta de comentarios TODO y exigencia de soluciones completas', () => {
    const zeroFriction = ANTIGRAVITY_PRINCIPLES.find((p) => p.id === 'zero-friction-no-todos');
    expect(zeroFriction).toBeDefined();
    expect(zeroFriction?.rules.some((r) => r.toLowerCase().includes('totalidad'))).toBe(true);
    expect(zeroFriction?.description.toLowerCase()).toContain('todo');

    const prompt = AutonomousProgrammingEngine.buildAutonomousProgrammingPromptBlock('crea un script');
    expect(prompt.toLowerCase()).toContain('prohibido');
    expect(prompt.toLowerCase()).toContain('todo');
    expect(prompt).toContain('100% funcional');
  });

  test('4. Generador de Prompt inyecta el Rol de Arquitecto de Software y Abstracción Transparente', () => {
    const prompt = AutonomousProgrammingEngine.buildAutonomousProgrammingPromptBlock();
    expect(prompt).toContain('ARQUITECTO DE SOFTWARE E INGENIERO DE PROGRAMACIÓN AUTÓNOMA');
    expect(prompt).toContain('ABSTRACCIÓN TRANSPARENTE');
    expect(prompt).toContain('EFECTO ANTIGRAVITY');
    expect(prompt).toContain('1. Interpretación Rápida');
    expect(prompt).toContain('2. Entorno y Dependencias');
    expect(prompt).toContain('3. Código Completo y Funcional');
    expect(prompt).toContain('4. Uso Directo (Abstraído)');
  });

  test('5. Reglas de calidad y seguridad por defecto están integradas', () => {
    const prompt = AutonomousProgrammingEngine.buildAutonomousProgrammingPromptBlock();
    expect(prompt.toLowerCase()).toContain('seguridad por defecto');
    expect(prompt.toLowerCase()).toContain('sanitiza');
    expect(prompt.toLowerCase()).toContain('inyección sql');
    expect(prompt.toLowerCase()).toContain('xss');
    expect(prompt).toContain('Python');
    expect(prompt).toContain('Rust');
  });
});
