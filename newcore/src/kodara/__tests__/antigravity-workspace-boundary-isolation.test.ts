// ═══════════════════════════════════════════════════════════════
// KODARA WORKSPACE BOUNDARY & ISOLATION TEST SUITE
// Estándar Google Antigravity: Selector Visual de Carpetas,
// Manifiesto .kodararules, Confinamiento de Ejecución y
// Aislamiento Hermético de Workspaces.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from 'bun:test';
import { readFileSync, existsSync, rmSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { ProjectBoundaryGuard } from '../security/project-boundary-guard.js';

describe('🥋 Auditoría de Workspaces Antigravity: Selector Visual y Guardián de Fronteras', () => {
  const serverTsPath = resolve(__dirname, '../../server.ts');
  const dashboardHtmlPath = resolve(__dirname, '../../web/dashboard.html');
  const planExecutorPath = resolve(__dirname, '../plan-executor.ts');

  it('1. ProjectBoundaryGuard: Confinamiento de rutas y detección de violaciones de perímetro', () => {
    const projectRoot = '/home/saghet/Documents/WiSharkOpen';

    // 1.1 Rutas válidas dentro del workspace
    const inside1 = ProjectBoundaryGuard.validatePathInsideProject(projectRoot, '/home/saghet/Documents/WiSharkOpen/src/main.rs');
    expect(inside1.allowed).toBe(true);

    const inside2 = ProjectBoundaryGuard.validatePathInsideProject(projectRoot, '/home/saghet/Documents/WiSharkOpen/Cargo.toml');
    expect(inside2.allowed).toBe(true);

    // 1.2 Rutas fuera del workspace (Intento de contaminación cruzada hacia SamuLibre)
    const outside1 = ProjectBoundaryGuard.validatePathInsideProject(projectRoot, '/home/saghet/Documents/SamulibreLinux/Cargo.toml');
    expect(outside1.allowed).toBe(false);
    expect(outside1.reason).toContain('VIOLACIÓN DE FRONTERA DE WORKSPACE');

    // 1.3 Intento de escape por '../' (Path Traversal)
    const traversal = ProjectBoundaryGuard.validatePathInsideProject(projectRoot, '/home/saghet/Documents/WiSharkOpen/../../etc/passwd');
    expect(traversal.allowed).toBe(false);

    // 1.4 assertPathInsideProject lanza excepción en violación
    expect(() => {
      ProjectBoundaryGuard.assertPathInsideProject('WiSharkOpen', projectRoot, '/home/saghet/Documents/SamulibreLinux/src/main.rs');
    }).toThrow('VIOLACIÓN DE FRONTERA DE WORKSPACE');
  });

  it('2. Creación física de carpeta y manifiesto .kodararules con política STRICT_ZERO_BLEED', () => {
    const testDir = `/home/saghet/Documents/TestAntigravityWorkspace_${Date.now()}`;

    try {
      // Crear manifiesto y carpeta física
      const res = ProjectBoundaryGuard.ensureProjectManifest('TestWorkspace', testDir);
      expect(res.createdDir).toBe(true);
      expect(res.createdRules).toBe(true);
      expect(existsSync(testDir)).toBe(true);

      const rulesPath = join(testDir, '.kodararules');
      expect(existsSync(rulesPath)).toBe(true);

      // Cargar reglas del proyecto
      const content = ProjectBoundaryGuard.loadProjectRules(testDir);
      expect(content).not.toBeNull();
      expect(content).toContain('STRICT_ZERO_BLEED');
      expect(content).toContain('TestWorkspace');
      expect(content).toContain('Confinamiento de Ejecución');
    } finally {
      // Limpieza del workspace de prueba
      if (existsSync(testDir)) {
        rmSync(testDir, { recursive: true, force: true });
      }
    }
  });

  it('3. server.ts expone la API del Explorador del Sistema de Archivos (/api/fs/directories y /api/fs/mkdir)', () => {
    expect(existsSync(serverTsPath)).toBe(true);
    const code = readFileSync(serverTsPath, 'utf-8');

    // Endpoints de exploración del sistema de archivos
    expect(code).toContain("'/api/fs/directories'");
    expect(code).toContain("'/api/fs/mkdir'");
    expect(code).toContain('ProjectBoundaryGuard.ensureProjectManifest');
    expect(code).toContain('ProjectBoundaryGuard.loadProjectRules');
    expect(code).toContain('[REGLAS LOCALES DEL WORKSPACE (.kodararules)]');
  });

  it('4. plan-executor.ts: Protege las mutaciones con ProjectBoundaryGuard.assertPathInsideProject', () => {
    expect(existsSync(planExecutorPath)).toBe(true);
    const code = readFileSync(planExecutorPath, 'utf-8');

    expect(code).toContain('ProjectBoundaryGuard');
    expect(code).toContain('ProjectBoundaryGuard.assertPathInsideProject');
  });

  it('5. dashboard.html: Implementa el modal con el explorador visual de carpetas y navegación interactiva', () => {
    expect(existsSync(dashboardHtmlPath)).toBe(true);
    const html = readFileSync(dashboardHtmlPath, 'utf-8');

    // Componentes del explorador visual
    expect(html).toContain('agFsExplorerContainer');
    expect(html).toContain('agFsBreadcrumb');
    expect(html).toContain('agFsDirList');
    expect(html).toContain('toggleFsExplorer');
    expect(html).toContain('loadFsDirectories');
    expect(html).toContain('selectCurrentFsDirectory');
    expect(html).toContain('promptCreateNewSubdir');
    expect(html).toContain('/api/fs/directories');
  });
});
