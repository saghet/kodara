// ═══════════════════════════════════════════════════════════════
// OpenCentravity / Kodara — Terminal Tool
// Safe asynchronous command execution via SystemRuntimeEngine.
// ═══════════════════════════════════════════════════════════════

import type { Tool, ToolInput, ToolResult, ToolContext } from '../types/index.js';
import { getConfig } from '../config/index.js';
import { SystemRuntimeEngine } from '../runtime/index.js';

export class TerminalTool implements Tool {
  name = 'run_command';
  description = 'Execute a shell command in the workspace directory. Returns stdout and stderr. Use for running tests, builds, installs, etc.';
  parameters = {
    type: 'object',
    properties: {
      command: { type: 'string', description: 'The shell command to execute' },
      cwd: { type: 'string', description: 'Working directory (relative to workspace, defaults to workspace root)' },
      timeoutMs: { type: 'number', description: 'Timeout in milliseconds (default: 30000)' },
    },
    required: ['command'],
  };

  async execute(input: ToolInput, context: ToolContext): Promise<ToolResult> {
    const command = input.command as string;
    const config = getConfig();

    // 1. Policy check existente del contexto
    const decision = context.policyEngine.check({
      type: 'command_exec',
      target: command,
      agentId: context.agentId,
      workspaceDir: context.workspaceDir,
    });
    if (!decision.allowed) {
      return { success: false, output: '', error: `Policy blocked: ${decision.reason}` };
    }

    const cwd = input.cwd ? String(input.cwd) : undefined;
    const timeoutMs = (input.timeoutMs as number) || config.maxCommandTimeoutMs || 30000;

    try {
      // 2. Ejecución asíncrona no bloqueante a través de SystemRuntimeEngine
      const runtime = SystemRuntimeEngine.getInstance();
      const res = await runtime.executeCommandSafe({
        command,
        cwd,
        workspaceDir: context.workspaceDir,
        timeoutMs,
        agentId: context.agentId,
      });

      if (res.exitCode !== 0) {
        return {
          success: false,
          output: res.stdout,
          error: `Exit code ${res.exitCode}: ${res.stderr || (res.timedOut ? 'Execution timed out' : 'Command failed')}`,
        };
      }

      return {
        success: true,
        output: res.stdout.trim(),
      };
    } catch (err: any) {
      return {
        success: false,
        output: '',
        error: `Runtime execution error: ${err.message}`,
      };
    }
  }
}
