import { describe, expect, test } from 'bun:test';
import {
  CybersecurityAcademyEngine,
  CYBERSECURITY_ACADEMY_CURRICULUM,
} from '../knowledge/cybersecurity-academy.js';

describe('Examen de Grado Universitario: Academia de Ciberseguridad Kodara (Pregrado)', () => {
  test('1. El currículo universitario cubre integralmente los 10 módulos de herramientas de Kali Linux', () => {
    expect(CYBERSECURITY_ACADEMY_CURRICULUM.length).toBe(10);
    const moduleIds = CYBERSECURITY_ACADEMY_CURRICULUM.map((m) => m.id);
    expect(moduleIds).toContain('recon-osint');
    expect(moduleIds).toContain('vuln-assessment');
    expect(moduleIds).toContain('web-security');
    expect(moduleIds).toContain('network-traffic');
    expect(moduleIds).toContain('cryptography-audit');
    expect(moduleIds).toContain('reverse-engineering');
    expect(moduleIds).toContain('digital-forensics');
    expect(moduleIds).toContain('wireless-iot');
    expect(moduleIds).toContain('endpoint-edr');
    expect(moduleIds).toContain('reporting-mitre');
  });

  test('2. La metodología del Profesor Mentor enseña en 3 capas progresivas: Por Qué, Cómo y Construcción', () => {
    const promptBlock = CybersecurityAcademyEngine.buildTeacherPromptBlock(
      'quiero aprender cómo programar un escáner de red estilo nmap'
    );
    expect(promptBlock).toContain('ACADEMIA UNIVERSITARIA DE CIBERSEGURIDAD KODARA');
    expect(promptBlock).toContain('EL \'POR QUÉ\'');
    expect(promptBlock).toContain('EL \'CÓMO\'');
    expect(promptBlock).toContain('LA \'CONSTRUCCIÓN\'');
    expect(promptBlock.toLowerCase()).toContain('nmap');
    expect(promptBlock).toContain('pnet');
    expect(promptBlock).toContain('tokio');
  });

  test('3. Mapeo pedagógico de Ingeniería Inversa y Desensamblado (Arquetipo Ghidra/Radare2)', () => {
    const reversingModule = CYBERSECURITY_ACADEMY_CURRICULUM.find(
      (m) => m.id === 'reverse-engineering'
    );
    expect(reversingModule).toBeDefined();
    expect(reversingModule?.kaliArchetype).toContain('Ghidra');
    expect(reversingModule?.rustTsLibraries).toContain('capstone');
    expect(reversingModule?.rustTsLibraries).toContain('goblin');
    expect(
      reversingModule?.theoreticalFoundations.some((f) => f.includes('x86_64'))
    ).toBe(true);
  });

  test('4. Mapeo pedagógico de Criptografía Aplicada y Auditoría de Contraseñas (Arquetipo Hashcat/Argon2)', () => {
    const cryptoModule = CYBERSECURITY_ACADEMY_CURRICULUM.find(
      (m) => m.id === 'cryptography-audit'
    );
    expect(cryptoModule).toBeDefined();
    expect(cryptoModule?.theoreticalFoundations.some((f) => f.includes('Argon2id'))).toBe(true);
    expect(cryptoModule?.softwareArchitecture.some((a) => a.includes('constant-time'))).toBe(true);
  });

  test('5. Mapeo pedagógico de Forense Digital y Preservación de Evidencias (Arquetipo Volatility/Autopsy)', () => {
    const forensicModule = CYBERSECURITY_ACADEMY_CURRICULUM.find(
      (m) => m.id === 'digital-forensics'
    );
    expect(forensicModule).toBeDefined();
    expect(forensicModule?.theoreticalFoundations.some((f) => f.includes('volatilidad'))).toBe(true);
    expect(forensicModule?.softwareArchitecture.some((a) => a.includes('SHA-256'))).toBe(true);
  });

  test('6. Cada módulo curricular dispone de al menos dos ejercicios de laboratorio prácticos', () => {
    for (const mod of CYBERSECURITY_ACADEMY_CURRICULUM) {
      expect(mod.laboratoryExercises.length).toBeGreaterThanOrEqual(2);
      expect(mod.laboratoryExercises[0]).toContain('Laboratorio');
    }
  });
});
