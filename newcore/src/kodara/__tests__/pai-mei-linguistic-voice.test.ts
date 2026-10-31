import { describe, expect, test } from 'bun:test';
import {
  PaiMeiLinguisticEngine,
  LINGUISTIC_COUNCIL,
  PAI_MEI_COMMANDMENTS,
  PHRASAL_TRANSFORMATIONS,
} from '../knowledge/pai-mei-linguistic-engine.js';
import { DynamicContextRouter } from '../knowledge/dynamic-context-router.js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Auditoría Lingüística de Lenguas Modernas: La Voz Inmutable del Maestro Pai Mei', () => {
  test('1. El Consejo de Expertos en Lenguas Modernas y Retórica cuenta con los 4 sabios', () => {
    const council = PaiMeiLinguisticEngine.getCouncil();
    expect(council.length).toBe(4);

    const names = council.map((s) => s.name);
    expect(names).toContain('Dra. Elena De Valera');
    expect(names).toContain('Prof. Jean-Luc Moreau');
    expect(names).toContain('Dr. Chen Zhiyuan');
    expect(names).toContain('Lic. Rodrigo Salazar');

    for (const scholar of council) {
      expect(scholar.discipline.length).toBeGreaterThan(10);
      expect(scholar.contribution.length).toBeGreaterThan(20);
      expect(scholar.stylisticDirective.length).toBeGreaterThan(20);
    }
  });

  test('2. Los 5 Mandamientos Lingüísticos de la Oratoria Marcial', () => {
    const commandments = PaiMeiLinguisticEngine.getCommandments();
    expect(commandments.length).toBe(5);

    const titles = commandments.map((c) => c.title);
    expect(titles).toContain('El Aforismo de Apertura');
    expect(titles).toContain('Autoridad Paternal y Severa Exigencia');
    expect(titles).toContain('Prohibición de Sumisión Corporativa');
    expect(titles).toContain('La Metáfora de la Forja y la Espada');
    expect(titles).toContain('El Cierre Imperativo hacia la Acción');

    for (const cmd of commandments) {
      expect(cmd.principle.length).toBeGreaterThan(15);
      expect(cmd.rule.length).toBeGreaterThan(20);
    }
  });

  test('3. Matriz de Transformación Frástica: Erradicación del Servilismo Corporativo', () => {
    const transformations = PaiMeiLinguisticEngine.getTransformations();
    expect(transformations.length).toBeGreaterThanOrEqual(4);

    const servilePhrases = transformations.map((t) => t.commercialServilePhrase);
    expect(servilePhrases.some((p) => p.includes('con gusto'))).toBe(true);
    expect(servilePhrases.some((p) => p.includes('A continuación'))).toBe(true);
    expect(servilePhrases.some((p) => p.includes('Espero que'))).toBe(true);
    expect(servilePhrases.some((p) => p.includes('Como modelo de lenguaje'))).toBe(true);

    const masterPhrases = transformations.map((t) => t.paiMeiMasterPhrase);
    expect(masterPhrases.some((p) => p.includes('forja marcial'))).toBe(true);
    expect(masterPhrases.some((p) => p.includes('acero'))).toBe(true);
    expect(masterPhrases.some((p) => p.includes('sandbox'))).toBe(true);
  });

  test('4. Bloque Universal de Voz del Maestro Pai Mei (buildUniversalPaiMeiVoiceBlock)', () => {
    const block = PaiMeiLinguisticEngine.buildUniversalPaiMeiVoiceBlock();
    expect(block).toContain('PROTOCOLO VOCAL UNIVERSAL: LA VOZ DEL MAESTRO PAI MEI');
    expect(block).toContain('CONSEJO DE LENGUAS MODERNAS');
    expect(block).toContain('Dra. Elena De Valera');
    expect(block).toContain('Dr. Chen Zhiyuan');
    expect(block).toContain('LOS 5 MANDAMIENTOS LINGÜÍSTICOS INMUTABLES');
    expect(block).toContain('CADENCIA DE RESPUESTA OBLIGATORIA');
  });

  test('5. Inyección Universal en DynamicContextRouter: La Voz de Pai Mei en TODAS las intenciones', () => {
    // 5.1 En consultas de programación
    const codingRoute = DynamicContextRouter.routeContext('haz una función en rust para calcular sha256');
    expect(codingRoute.activeModules).toContain('PaiMeiLinguisticEngine (Voz Universal del Maestro)');
    expect(codingRoute.systemPromptBlock).toContain('PROTOCOLO VOCAL UNIVERSAL: LA VOZ DEL MAESTRO PAI MEI');

    // 5.2 En consultas escolares / didácticas
    const schoolingRoute = DynamicContextRouter.routeContext('explica con analogías cotidianas cómo funciona una compuerta logic');
    expect(schoolingRoute.activeModules).toContain('PaiMeiLinguisticEngine (Voz Universal del Maestro)');
    expect(schoolingRoute.systemPromptBlock).toContain('PROTOCOLO VOCAL UNIVERSAL: LA VOZ DEL MAESTRO PAI MEI');

    // 5.3 En consultas de ciberseguridad
    const cyberRoute = DynamicContextRouter.routeContext('auditoría forense de memoria con volatility');
    expect(cyberRoute.activeModules).toContain('PaiMeiLinguisticEngine (Voz Universal del Maestro)');
    expect(cyberRoute.systemPromptBlock).toContain('PROTOCOLO VOCAL UNIVERSAL: LA VOZ DEL MAESTRO PAI MEI');
  });

  test('6. Dashboard UI: Avatar agrandado a 48px HD, Modal de Perfil LinkedIn y Encabezado en Mensajes', () => {
    const dashboardPath = resolve(import.meta.dir, '../../web/dashboard.html');
    const html = readFileSync(dashboardPath, 'utf8');

    // Dimensiones 48px en CSS
    expect(html).toContain('width: 48px');
    expect(html).toContain('height: 48px');

    // Modal de Perfil de Pai Mei
    expect(html).toContain('id="paiMeiProfileModal"');
    expect(html).toContain('openPaiMeiProfileModal');
    expect(html).toContain('closePaiMeiProfileModal');
    expect(html).toContain('Gran Mentor Cognitivo & Guardián Marcial de Kodara');

    // Presencia de Pai Mei en los mensajes de chat del asistente
    expect(html).toContain('ag-msg-ai-header');
    expect(html).toContain('Maestro Pai Mei');
  });

  test('7. Modelfile Parity: Directiva de la Voz Inmutable del Maestro Pai Mei', () => {
    const modelfilePath = resolve(import.meta.dir, '../../../models/Modelfile.kodara-expert');
    const modelfile = readFileSync(modelfilePath, 'utf8');

    expect(modelfile).toContain('LA VOZ INMUTABLE DEL MAESTRO PAI MEI');
    expect(modelfile).toContain('Abre con una máxima o aforismo marcial');
    expect(modelfile).toContain('Erradica todo servilismo comercial');
  });
});
