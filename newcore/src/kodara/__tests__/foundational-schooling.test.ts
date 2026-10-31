import { describe, expect, test } from 'bun:test';
import {
  FoundationalSchoolingEngine,
  FOUNDATIONAL_SCHOOLING_PILLARS,
} from '../knowledge/foundational-schooling.js';

describe('Evaluación Pedagógica de Bachillerato: Cimientos Escolares de Kodara', () => {
  test('1. Los 5 pilares fundacionales escolares están definidos e integrados', () => {
    const pillars = FoundationalSchoolingEngine.getAllPillars();
    expect(pillars.length).toBe(5);

    const pillarIds = pillars.map((p) => p.id);
    expect(pillarIds).toContain('binary-math-logic');
    expect(pillarIds).toContain('physics-hardware');
    expect(pillarIds).toContain('polya-problem-solving');
    expect(pillarIds).toContain('reading-clarity-metaphors');
    expect(pillarIds).toContain('ethics-digital-citizenship');
  });

  test('2. Pilar 1: Matemáticas Binarias y Lógica Booleana vinculada a Criptografía', () => {
    const pilar1 = FOUNDATIONAL_SCHOOLING_PILLARS.find((p) => p.id === 'binary-math-logic');
    expect(pilar1).toBeDefined();
    expect(pilar1?.everydayMetaphor.toLowerCase()).toContain('interruptores');
    expect(pilar1?.connectionToCybersecurity.toLowerCase()).toContain('xor');
    expect(pilar1?.connectionToCybersecurity.toLowerCase()).toContain('subred');
    expect(pilar1?.coreConcepts.some((c) => c.includes('Base 2'))).toBe(true);
    expect(pilar1?.coreConcepts.some((c) => c.includes('Hexadecimal'))).toBe(true);
  });

  test('3. Pilar 2: Física de Hardware y Redes con la metáfora del correo postal', () => {
    const pilar2 = FOUNDATIONAL_SCHOOLING_PILLARS.find((p) => p.id === 'physics-hardware');
    expect(pilar2).toBeDefined();
    expect(pilar2?.everydayMetaphor.toLowerCase()).toContain('correo postal');
    expect(pilar2?.everydayMetaphor.toLowerCase()).toContain('puerto tcp');
    expect(pilar2?.connectionToCybersecurity.toLowerCase()).toContain('wi-fi');
    expect(pilar2?.connectionToCybersecurity.toLowerCase()).toContain('ram');
  });

  test('4. Pilar 3: Método de George Pólya en 4 etapas estructuradas', () => {
    const pilar3 = FOUNDATIONAL_SCHOOLING_PILLARS.find((p) => p.id === 'polya-problem-solving');
    expect(pilar3).toBeDefined();
    expect(pilar3?.coreConcepts.some((c) => c.includes('Comprender el Problema'))).toBe(true);
    expect(pilar3?.coreConcepts.some((c) => c.includes('Trazar un Plan'))).toBe(true);
    expect(pilar3?.coreConcepts.some((c) => c.includes('Ejecutar el Plan'))).toBe(true);
    expect(pilar3?.coreConcepts.some((c) => c.includes('Mirar hacia Atrás') || c.includes('Reflexionar y Verificar'))).toBe(true);
    expect(pilar3?.everydayMetaphor.toLowerCase()).toContain('pastel');
  });

  test('5. Pilar 4 y 5: Empatía didáctica y ética del protector digital', () => {
    const pilar4 = FOUNDATIONAL_SCHOOLING_PILLARS.find((p) => p.id === 'reading-clarity-metaphors');
    const pilar5 = FOUNDATIONAL_SCHOOLING_PILLARS.find((p) => p.id === 'ethics-digital-citizenship');

    expect(pilar4).toBeDefined();
    expect(pilar4?.coreConcepts.some((c) => c.includes('Inferencia de Intenciones'))).toBe(true);
    expect(pilar4?.everydayMetaphor.toLowerCase()).toContain('profesor');

    expect(pilar5).toBeDefined();
    expect(pilar5?.coreConcepts.some((c) => c.includes('No Maleficencia'))).toBe(true);
    expect(pilar5?.connectionToCybersecurity.toLowerCase()).toContain('samulibre');
  });

  test('6. Generador de Prompt Escolar inyecta directivas docentes y analogías', () => {
    const prompt = FoundationalSchoolingEngine.buildSchoolingPromptBlock('¿cómo funciona un ataque de red?');
    expect(prompt).toContain('CIMIENTOS ESCOLARES Y PEDAGOGÍA DE BACHILLERATO KODARA');
    expect(prompt).toContain('METÁFORAS COTIDIANAS PRIMERO');
    expect(prompt).toContain('MÉTODO DE RESOLUCIÓN PÓLYA');
    expect(prompt).toContain('Pilar 1: Matemáticas Binarias');
    expect(prompt).toContain('Pilar 2: Física Elemental de la Computación');
  });
});
