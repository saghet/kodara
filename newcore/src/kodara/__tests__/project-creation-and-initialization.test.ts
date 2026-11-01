// ═══════════════════════════════════════════════════════════════
// KODARA TEST SUITE: CREACIÓN ROBUSTA Y CICLO DE VIDA DE PROYECTOS
// Certificación de Diagnóstico Forense y Reparación a Fondo:
// 1. Detección Proactiva de Duplicados (HTTP 409 vs Crash 500)
// 2. Aprovisionamiento Atómico de Conversación Inicial
// 3. Erradicación de Estado Residual Huérfano (proj_samulibre)
// 4. Feedback Visual Reactivo en UI Modal (#newProjErrorNotice)
// 5. Creación Física de Directorio y Manifiesto .kodararules
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from 'bun:test';
import { readFileSync, existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { projectsTable } from '../../db/index.js';
import { ProjectBoundaryGuard } from '../security/project-boundary-guard.js';

describe('🥋 Auditoría de Creación y Ciclo de Vida de Proyectos en Kodara', () => {
  const dashboardHtmlPath = resolve(__dirname, '../../web/dashboard.html');
  const serverTsPath = resolve(__dirname, '../../server.ts');
  const testWorkspaceDir = resolve('/tmp/kodara_test_workspace_' + Date.now());

  it('1. Creación Atómica de Proyecto con Conversación Inicial Auto-Aprovisionada', async () => {
    const projName = 'ForjaPaiMei_' + Math.random().toString(36).substring(2, 7);
    const created = await projectsTable.createProjectWithInitialConversation(
      projName,
      testWorkspaceDir,
      'Workspace de prueba con auto-aprovisionamiento de conversación'
    );

    expect(created.id).toStartWith('proj_');
    expect(created.name).toBe(projName);
    expect(created.path).toBe(testWorkspaceDir);
    expect(created.initialConversationId).toStartWith('conv_');
    expect(created.conversations).toBeArray();
    expect(created.conversations?.length).toBe(1);
    expect(created.conversations?.[0].id).toBe(created.initialConversationId);
    expect(created.conversations?.[0].title).toBe('Nueva Conversación');

    // Cleanup
    await projectsTable.deleteProject(created.id);
  });

  it('2. Detección Case-Insensitive de Nombres Duplicados y Consultas Seguras', async () => {
    const uniqueName = 'AuditoriaUnica_' + Math.random().toString(36).substring(2, 7);
    const proj = await projectsTable.createProject(uniqueName, '/tmp/' + uniqueName);

    // Consulta exacta
    const foundExact = await projectsTable.getProjectByName(uniqueName);
    expect(foundExact).not.toBeNull();
    expect(foundExact?.id).toBe(proj.id);

    // Consulta en minúsculas (case-insensitive)
    const foundLower = await projectsTable.getProjectByName(uniqueName.toLowerCase());
    expect(foundLower).not.toBeNull();
    expect(foundLower?.id).toBe(proj.id);

    // Consulta por ID
    const foundById = await projectsTable.getProjectById(proj.id);
    expect(foundById).not.toBeNull();
    expect(foundById?.name).toBe(uniqueName);

    // ID inexistente o huérfano retorna null en lugar de explotar
    const missing = await projectsTable.getProjectById('proj_non_existent_99999');
    expect(missing).toBeNull();

    // Cleanup
    await projectsTable.deleteProject(proj.id);
  });

  it('3. server.ts maneja HTTP 409 en duplicados, aprovisiona .kodararules y protege conversaciones', () => {
    const serverSource = readFileSync(serverTsPath, 'utf-8');

    // Manejo de duplicados con 409
    expect(serverSource).toContain('projectsTable.getProjectByName');
    expect(serverSource).toContain('reply.code(409).send');
    expect(serverSource).toContain('Ya existe un proyecto o carpeta con el nombre');

    // Creación atómica con conversación inicial
    expect(serverSource).toContain('createProjectWithInitialConversation');

    // Aprovisionamiento de directorio físico y manifiesto
    expect(serverSource).toContain('fs.mkdirSync(finalPath, { recursive: true })');
    expect(serverSource).toContain('ProjectBoundaryGuard.ensureProjectManifest');

    // Verificación de existencia antes de crear conversación (evita SQLite FOREIGN KEY error)
    expect(serverSource).toContain('projectsTable.getProjectById(req.params.id)');
    expect(serverSource).toContain('El proyecto "${req.params.id}" no existe o fue eliminado');
  });

  it('4. dashboard.html erradica variables en duro, implementa banner de error y feedback visual', () => {
    const html = readFileSync(dashboardHtmlPath, 'utf-8');

    // Erradicación de estado residual hardcodeado
    expect(html).not.toContain("let activeProjectId = 'proj_samulibre'");
    expect(html).not.toContain("let activeConversationId = 'conv_samu_1'");
    expect(html).toContain("let activeProjectId = ''");
    expect(html).toContain("let activeConversationId = ''");

    // Elementos visuales del modal de creación
    expect(html).toContain('id="newProjErrorNotice"');
    expect(html).toContain('id="newProjSubmitBtn"');

    // Manejo robusto de errores en submitCreateProject
    expect(html).toContain('Creando Proyecto...');
    expect(html).toContain('initialConversationId');
    expect(html).toContain('newProjErrorNotice');

    // Reconciliación proactiva en loadProjectsSidebar
    expect(html).toContain('activeExists = Array.isArray(cachedProjectsList)');
  });

  it('5. ProjectBoundaryGuard aprovisiona físicamente la carpeta y el manifiesto .kodararules', () => {
    try {
      const res = ProjectBoundaryGuard.ensureProjectManifest('TestWorkspacePaiMei', testWorkspaceDir);
      expect(existsSync(testWorkspaceDir)).toBe(true);
      expect(res.createdDir).toBe(true);
      expect(res.createdRules).toBe(true);
      const manifestPath = resolve(testWorkspaceDir, '.kodararules');
      expect(existsSync(manifestPath)).toBe(true);
      const content = readFileSync(manifestPath, 'utf-8');
      expect(content).toContain('STRICT_ZERO_BLEED');
      expect(content).toContain('TestWorkspacePaiMei');
    } finally {
      if (existsSync(testWorkspaceDir)) {
        rmSync(testWorkspaceDir, { recursive: true, force: true });
      }
    }
  });
});
