// ═══════════════════════════════════════════════════════════════
// KODARA ANTIGRAVITY SIDEBAR: CARPETAS Y CONVERSACIONES (TEST SUITE)
// Valida la paridad exacta con el estándar visual y funcional de
// Google Antigravity IDE: Persistencia CRUD en SQLite, Filtro en Vivo,
// Botón [📁+], Menú Contextual [::], y 'No conversations yet'.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from 'bun:test';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { projectsTable } from '../../db/index.js';

describe('Kodara Antigravity Sidebar: Carpetas y Conversaciones', () => {
  const dashboardHtmlPath = resolve(__dirname, '../../web/dashboard.html');
  const serverTsPath = resolve(__dirname, '../../server.ts');

  it('1. Ciclo de vida CRUD de Carpetas/Proyectos y Conversaciones en SQLite', async () => {
    // 1. Crear nuevo proyecto
    const testProj = await projectsTable.createProject(
      'TestAntigravityProj',
      '/home/saghet/Documents/TestAntigravityProj',
      'Proyecto temporal para prueba unitaria'
    );
    expect(testProj.id).toStartWith('proj_');
    expect(testProj.name).toBe('TestAntigravityProj');
    expect(testProj.path).toBe('/home/saghet/Documents/TestAntigravityProj');

    // 2. Crear conversación en el proyecto
    const testConv = await projectsTable.createConversation(
      testProj.id,
      'Conversación de Prueba Inicial'
    );
    expect(testConv.id).toStartWith('conv_');
    expect(testConv.title).toBe('Conversación de Prueba Inicial');
    expect(testConv.projectId).toBe(testProj.id);

    // 3. Renombrar conversación
    const renamedConv = await projectsTable.renameConversation(
      testConv.id,
      'Conversación Renombrada con Éxito'
    );
    expect(renamedConv).not.toBeNull();
    expect(renamedConv?.title).toBe('Conversación Renombrada con Éxito');

    // 4. Mover conversación a otro proyecto existente (proj_cli)
    const movedConv = await projectsTable.moveConversation(testConv.id, 'proj_cli');
    expect(movedConv).not.toBeNull();
    expect(movedConv?.projectId).toBe('proj_cli');

    // 5. Eliminar la conversación
    const convDeleted = await projectsTable.deleteConversation(testConv.id);
    expect(convDeleted).toBe(true);

    // 6. Actualizar y renombrar el proyecto
    const updatedProj = await projectsTable.updateProject(testProj.id, {
      name: 'TestAntigravityProjUpdated',
      description: 'Descripción actualizada'
    });
    expect(updatedProj).not.toBeNull();
    expect(updatedProj?.name).toBe('TestAntigravityProjUpdated');
    expect(updatedProj?.description).toBe('Descripción actualizada');

    // 7. Eliminar el proyecto
    const projDeleted = await projectsTable.deleteProject(testProj.id);
    expect(projDeleted).toBe(true);
  });

  it('2. El Dashboard HTML implementa la barra de acciones de Projects con [📁+] y [Filtro]', () => {
    expect(existsSync(dashboardHtmlPath)).toBe(true);
    const html = readFileSync(dashboardHtmlPath, 'utf-8');

    // Barra de acciones con botones de Filtro y Nueva Carpeta
    expect(html).toContain('ag-projects-header');
    expect(html).toContain('ag-header-actions');
    expect(html).toContain('toggleProjectsFilterBar()');
    expect(html).toContain('openNewProjectModal()');
    expect(html).toContain('agProjectsFilterBar');
    expect(html).toContain('agProjectsFilterInput');
    expect(html).toContain('filterProjectsTree(this.value)');
  });

  it('3. El Dashboard HTML implementa Menú Contextual [::], Modales y placeholder "No conversations yet"', () => {
    expect(existsSync(dashboardHtmlPath)).toBe(true);
    const html = readFileSync(dashboardHtmlPath, 'utf-8');

    // Placeholder exacto de Antigravity
    expect(html).toContain('No conversations yet');
    expect(html).toContain('ag-empty-convs');

    // Botón de opciones en la conversación y menú contextual
    expect(html).toContain('ag-conv-options-btn');
    expect(html).toContain('openConversationContextMenu');
    expect(html).toContain('agConversationContextMenu');
    expect(html).toContain('onContextRenameClick()');
    expect(html).toContain('onContextMoveClick()');
    expect(html).toContain('onContextDeleteClick()');

    // Modales de Nueva Carpeta y Mover Conversación
    expect(html).toContain('agNewProjectModal');
    expect(html).toContain('newProjNameInput');
    expect(html).toContain('newProjPathInput');
    expect(html).toContain('submitCreateProject()');
    expect(html).toContain('agMoveConvModal');
    expect(html).toContain('moveConvSelectProject');
    expect(html).toContain('submitMoveConversation()');

    // Menús superiores Antigravity
    expect(html).toContain('New Conversation');
    expect(html).toContain('Automations');
    expect(html).toContain('Customizations');
  });

  it('4. El servidor server.ts cuenta con todas las rutas REST del ciclo de vida CRUD de carpetas y chats', () => {
    expect(existsSync(serverTsPath)).toBe(true);
    const serverCode = readFileSync(serverTsPath, 'utf-8');

    // Rutas de proyectos
    expect(serverCode).toContain("'/api/projects'");
    expect(serverCode).toContain("'/api/projects/:id'");
    expect(serverCode).toContain('projectsTable.createProject');
    expect(serverCode).toContain('projectsTable.updateProject');
    expect(serverCode).toContain('projectsTable.deleteProject');

    // Rutas de conversaciones
    expect(serverCode).toContain("'/api/projects/:id/conversations'");
    expect(serverCode).toContain("'/api/conversations/:id'");
    expect(serverCode).toContain("'/api/conversations/:id/move'");
    expect(serverCode).toContain('projectsTable.renameConversation');
    expect(serverCode).toContain('projectsTable.moveConversation');
    expect(serverCode).toContain('projectsTable.deleteConversation');
  });

  it('5. El Dashboard HTML implementa la eliminación ergonómica de carpetas con botón [.ag-folder-delete-btn] y modal [#agConfirmDeleteProjectModal]', () => {
    expect(existsSync(dashboardHtmlPath)).toBe(true);
    const html = readFileSync(dashboardHtmlPath, 'utf-8');

    // Botones de acción contextual en la carpeta
    expect(html).toContain('ag-folder-actions');
    expect(html).toContain('ag-folder-delete-btn');
    expect(html).toContain('openConfirmDeleteProjectModal');

    // Modal no bloqueante de confirmación destructiva
    expect(html).toContain('agConfirmDeleteProjectModal');
    expect(html).toContain('confirmDeleteProjectPromptText');
    expect(html).toContain('closeConfirmDeleteProjectModal()');
    expect(html).toContain('executeConfirmedDeleteProject()');
    expect(html).toContain('Eliminar Carpeta Definitivamente');

    // Manejador en cliente con refresco reactivo
    expect(html).toContain('pendingDeleteProject');
    expect(html).toContain('loadProjectsSidebar()');
  });
});
