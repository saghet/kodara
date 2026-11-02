// ═══════════════════════════════════════════════════════════════
// KODARA MULTI-AGENT SYSTEM: Git Worktree Isolation Manager
// "Your Code. Your AI. Your Rules."
// Aislamiento físico de workspace mediante Git worktrees para
// permitir que múltiples agentes concurrentes modifiquen el mismo
// repositorio sin generar colisiones ni condiciones de carrera.
// ═══════════════════════════════════════════════════════════════

import { resolve, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';

export interface WorktreeInfo {
  path: string;
  branch: string;
  commit: string;
}

export interface MergeResult {
  merged: boolean;
  conflictFiles?: string[];
  error?: string;
}

export class GitWorktreeManager {
  /**
   * Crea un worktree aislado para un agente sobre una nueva rama Git temporal.
   */
  public static async createWorktree(
    repoPath: string,
    agentId: string,
    baseCommit = 'HEAD'
  ): Promise<{ worktreePath: string; branch: string }> {
    const rootRepo = resolve(repoPath);
    const sanitizedAgentId = agentId.replace(/[^a-zA-Z0-9-_]/g, '_');
    const branchName = `kodara-agent/${sanitizedAgentId}-${Date.now().toString(36)}`;
    const worktreeDir = join(rootRepo, '.kodara', 'worktrees', sanitizedAgentId);

    // Asegurar directorio contenedor
    const parentDir = join(rootRepo, '.kodara', 'worktrees');
    if (!existsSync(parentDir)) {
      mkdirSync(parentDir, { recursive: true });
    }

    // Si ya existía un worktree residual en esa ruta, limpiarlo primero
    if (existsSync(worktreeDir)) {
      await this.removeWorktree(rootRepo, worktreeDir, false);
    }

    try {
      execSync(`git worktree add -b "${branchName}" "${worktreeDir}" "${baseCommit}"`, {
        cwd: rootRepo,
        stdio: ['pipe', 'pipe', 'pipe'],
        encoding: 'utf-8',
      });

      return {
        worktreePath: worktreeDir,
        branch: branchName,
      };
    } catch (err: any) {
      // Si el repositorio no es un repositorio Git, fallback a directorio aislado
      if (!existsSync(join(rootRepo, '.git'))) {
        mkdirSync(worktreeDir, { recursive: true });
        return { worktreePath: worktreeDir, branch: 'no-git' };
      }
      throw new Error(`Fallo al crear Git worktree para el agente ${agentId}: ${err.message}`);
    }
  }

  /**
   * Elimina y limpia el worktree y opcionalmente su rama asociada.
   */
  public static async removeWorktree(
    repoPath: string,
    worktreePath: string,
    deleteBranch = true,
    branchName?: string
  ): Promise<void> {
    const rootRepo = resolve(repoPath);
    try {
      execSync(`git worktree remove --force "${worktreePath}"`, {
        cwd: rootRepo,
        stdio: ['pipe', 'pipe', 'pipe'],
        encoding: 'utf-8',
      });
    } catch {
      // Ignorar si ya fue removido
    }

    if (deleteBranch && branchName && branchName !== 'no-git') {
      try {
        execSync(`git branch -D "${branchName}"`, {
          cwd: rootRepo,
          stdio: ['pipe', 'pipe', 'pipe'],
          encoding: 'utf-8',
        });
      } catch {}
    }
  }

  /**
   * Intenta integrar los cambios del worktree a la rama principal (targetBranch).
   */
  public static async mergeWorktree(
    repoPath: string,
    branchName: string,
    targetBranch = 'main'
  ): Promise<MergeResult> {
    const rootRepo = resolve(repoPath);
    try {
      // 1. Verificar si hay conflictos potenciales con dry-run
      const mergeBase = execSync(`git merge-base "${targetBranch}" "${branchName}"`, {
        cwd: rootRepo,
        encoding: 'utf-8',
      }).trim();

      const mergeTree = execSync(`git merge-tree "${mergeBase}" "${targetBranch}" "${branchName}"`, {
        cwd: rootRepo,
        encoding: 'utf-8',
      });

      if (mergeTree.includes('<<<<<<<') || mergeTree.includes('conflict')) {
        return {
          merged: false,
          conflictFiles: ['Conflictos de fusión detectados entre la rama del agente y la rama objetivo.'],
        };
      }

      // 2. Ejecutar merge limpio
      execSync(`git merge --no-ff -m "chore(agent): merge worktree changes from ${branchName}" "${branchName}"`, {
        cwd: rootRepo,
        stdio: ['pipe', 'pipe', 'pipe'],
        encoding: 'utf-8',
      });

      return { merged: true };
    } catch (err: any) {
      return {
        merged: false,
        error: err.message,
      };
    }
  }

  /**
   * Lista todos los worktrees activos en el repositorio.
   */
  public static listWorktrees(repoPath: string): WorktreeInfo[] {
    const rootRepo = resolve(repoPath);
    try {
      const output = execSync('git worktree list --porcelain', {
        cwd: rootRepo,
        encoding: 'utf-8',
      });

      const lines = output.trim().split('\n');
      const worktrees: WorktreeInfo[] = [];
      let currentPath = '';
      let currentCommit = '';
      let currentBranch = '';

      for (const line of lines) {
        if (line.startsWith('worktree ')) {
          currentPath = line.substring(9).trim();
        } else if (line.startsWith('HEAD ')) {
          currentCommit = line.substring(5).trim();
        } else if (line.startsWith('branch ')) {
          currentBranch = line.substring(7).trim().replace('refs/heads/', '');
        } else if (line === '') {
          if (currentPath) {
            worktrees.push({
              path: currentPath,
              commit: currentCommit,
              branch: currentBranch,
            });
            currentPath = '';
            currentCommit = '';
            currentBranch = '';
          }
        }
      }

      if (currentPath) {
        worktrees.push({ path: currentPath, commit: currentCommit, branch: currentBranch });
      }

      return worktrees;
    } catch {
      return [];
    }
  }
}
