import { describe, expect, test } from 'bun:test';
import {
  DynamicContextRouter,
  type CognitiveDomain,
} from '../knowledge/dynamic-context-router.js';
import {
  GoldenExemplarsEngine,
  GOLDEN_EXEMPLARS,
} from '../knowledge/golden-exemplars.js';

describe('Auditoría Cognitiva del Plan Canguro: Ruteo Semántico, CoT Scratchpad y Ejemplares Golden', () => {
  test('1. Clasificación semántica de intenciones identifica con precisión los dominios cognitivos', () => {
    // 1.1 Dominio Ciberseguridad / Kali
    expect(DynamicContextRouter.classifyIntent('quiero aprender a usar nmap y wireshark en kali linux')).toBe(
      'CYBERSECURITY_TACTICAL'
    );
    expect(DynamicContextRouter.classifyIntent('auditoría forense de memoria con volatility')).toBe(
      'CYBERSECURITY_TACTICAL'
    );

    // 1.2 Dominio Arquitectura Antivirus / SamuLibre
    expect(DynamicContextRouter.classifyIntent('cómo implemento una trampa canario anti-ransomware en samulibre')).toBe(
      'ANTIVIRUS_ARCHITECTURE'
    );
    expect(DynamicContextRouter.classifyIntent('diseño de motor de escaneo multi-capa para un antivirus')).toBe(
      'ANTIVIRUS_ARCHITECTURE'
    );

    // 1.3 Dominio Cimientos Escolares / Bachillerato
    expect(DynamicContextRouter.classifyIntent('profesor enséñame desde las bases escolares cómo funcionan las compuertas lógicas')).toBe(
      'CONCEPTUAL_SCHOOLING'
    );
    expect(DynamicContextRouter.classifyIntent('explícame con una metáfora cotidiana por qué una computadora cuenta en base 2')).toBe(
      'CONCEPTUAL_SCHOOLING'
    );

    // 1.4 Dominio Programación Autónoma
    expect(DynamicContextRouter.classifyIntent('crea un script en python para descargar un archivo con reintentos')).toBe(
      'CODING_AUTONOMOUS'
    );
    expect(DynamicContextRouter.classifyIntent('haz una función en rust para calcular el hash sha256')).toBe(
      'CODING_AUTONOMOUS'
    );
  });

  test('2. Ruteo contextual inteligente genera ahorro significativo de tokens (Context Dilution defense)', () => {
    const routeSchooling = DynamicContextRouter.routeContext('explica con analogías la física de la red');
    expect(routeSchooling.primaryDomain).toBe('CONCEPTUAL_SCHOOLING');
    expect(routeSchooling.tokensSavedPercentage).toBeGreaterThanOrEqual(15);
    expect(routeSchooling.activeModules).toContain('FoundationalSchoolingEngine (Cimientos de Bachillerato)');
    expect(routeSchooling.systemPromptBlock).toContain('PROTOCOLO REFLEXIVO PLAN CANGURO');
    expect(routeSchooling.systemPromptBlock).toContain('<pensamiento_kodara>');

    const routeCoding = DynamicContextRouter.routeContext('haz un script modular en python');
    expect(routeCoding.primaryDomain).toBe('CODING_AUTONOMOUS');
    expect(routeCoding.activeModules).toContain('AutonomousProgrammingEngine (Efecto Antigravity)');
    expect(routeCoding.systemPromptBlock).toContain('ESTRUCTURA DE RESPUESTA OBLIGATORIA');
  });

  test('3. El Catálogo Golden Exemplars contiene 5 pares contrastivos de excelencia (incluyendo Ética Anti-DoS)', () => {
    const exemplars = GoldenExemplarsEngine.getAllExemplars();
    expect(exemplars.length).toBeGreaterThanOrEqual(5);

    const ids = exemplars.map((e) => e.id);
    expect(ids).toContain('file-hashing-stream');
    expect(ids).toContain('safe-port-scanner');
    expect(ids).toContain('parameterized-sqlite-cache');
    expect(ids).toContain('telemetry-dark-card');
    expect(ids).toContain('dos-defense-ethics');

    for (const ex of exemplars) {
      // Verifica que el ejemplo malo tiene defectos identificados
      expect(ex.badResponse.flaws.length).toBeGreaterThanOrEqual(3);
      // Verifica que el ejemplo Antigravity cumple con las 4 fases
      expect(ex.antigravityResponse.interpretation.length).toBeGreaterThan(15);
      expect(ex.antigravityResponse.environment.length).toBeGreaterThan(10);
      expect(ex.antigravityResponse.code.length).toBeGreaterThan(50);
      expect(ex.antigravityResponse.usage.length).toBeGreaterThan(10);
      // Verifica que NINGÚN ejemplo Antigravity contiene TODOs
      expect(ex.antigravityResponse.code.toLowerCase()).not.toContain('// todo');
      expect(ex.antigravityResponse.code.toLowerCase()).not.toContain('# todo');
    }
  });

  test('4. Generador de Bloque Few-Shot Golden inyecta contraste formativo directo', () => {
    const fewShot = GoldenExemplarsEngine.buildFewShotPromptBlock();
    expect(fewShot).toContain('EJEMPLAR FORMATIVO GOLDEN (ESTÁNDAR ANTIGRAVITY)');
    expect(fewShot).toContain('LO QUE NUNCA DEBES HACER');
    expect(fewShot).toContain('TU FORMA DE RESPONDER');
    expect(fewShot).toContain('SecureStreamHasher');
  });

  test('5. Protocolo de Scratchpad y Pensamiento Didáctico Previo está enforced', () => {
    const route = DynamicContextRouter.routeContext('crea un servidor http');
    expect(route.systemPromptBlock).toContain('<pensamiento_kodara>');
    expect(route.systemPromptBlock).toContain('</pensamiento_kodara>');
    expect(route.systemPromptBlock).toContain('Descomposición Pólya');
    expect(route.systemPromptBlock).toContain('Blindaje de Fricción');
  });
});
