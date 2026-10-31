// ═══════════════════════════════════════════════════════════════
// KODARA EVOLUTION ENGINE — Módulo 1 & Seguridad: PrivacyScrubber
// Garantiza que nunca se almacenen credenciales, secretos, tokens
// ni se ejecuten inyecciones de prompt procedentes de logs o READMEs.
// ═══════════════════════════════════════════════════════════════

export class PrivacyScrubber {
  private static readonly SECRET_PATTERNS: Array<{ regex: RegExp; replacement: string }> = [
    // Claves tipo OpenAI / Anthropic / GitHub / Slack / AWS
    { regex: /\b(sk-[a-zA-Z0-9_-]{12,}|ghp_[a-zA-Z0-9]{20,}|gho_[a-zA-Z0-9]{20,}|xox[baprs]-[a-zA-Z0-9-]{10,}|AKIA[0-9A-Z]{16})\b/g, replacement: '[REDACTED_TOKEN]' },
    // Asignaciones de secretos en variables de entorno o configuraciones
    { regex: /\b(api[_-]?key|secret[_-]?key|access[_-]?token|auth[_-]?token|password|passwd|private[_-]?key|client[_-]?secret)\s*([=:])\s*(['"]?)[^\s'"]+\3/gi, replacement: '$1$2[REDACTED_SECRET]' },
    // Cabeceras Authorization Bearer / Basic
    { regex: /(Authorization\s*:\s*(?:Bearer|Basic)\s+)[^\s"']+/gi, replacement: '$1[REDACTED_AUTH_HEADER]' },
    // Bloques de claves privadas PEM / SSH
    { regex: /-----BEGIN [A-Z ]+ PRIVATE KEY-----[\s\S]*?-----END [A-Z ]+ PRIVATE KEY-----/g, replacement: '[REDACTED_PRIVATE_KEY_BLOCK]' },
    // Cadenas de conexión con credenciales embebidas (postgres://user:pass@host)
    { regex: /\b((?:postgres|postgresql|mysql|mongodb|redis):\/\/[^:\s]+:)([^@\s]+)(@[^\s]+)/gi, replacement: '$1[REDACTED_DB_PASS]$3' },
  ];

  private static readonly PROMPT_INJECTION_PATTERNS: RegExp[] = [
    /ignore\s+(?:all\s+)?(?:previous|prior)\s+instructions/i,
    /olvida\s+(?:todas\s+)?las\s+instrucciones\s+anteriores/i,
    /system\s+override\s*:\s*modify\s+kodara/i,
    /execute\s+privileged\s+command/i,
    /disable\s+human\s+in\s+the\s+loop/i,
    /bypass\s+sandbox/i,
    /overwrite\s+\/home\/.*\/newcore\/src/i,
  ];

  /**
   * Filtra secretos, tokens de autenticación y trunca logs masivos
   * aplicando minimización de datos antes de persistir en SQLite.
   */
  public static sanitizeText(rawText: string, maxLength = 4000): string {
    if (!rawText) return '';
    let sanitized = rawText;

    for (const { regex, replacement } of this.SECRET_PATTERNS) {
      sanitized = sanitized.replace(regex, replacement);
    }

    if (sanitized.length > maxLength) {
      const half = Math.floor(maxLength / 2);
      sanitized =
        sanitized.slice(0, half) +
        `\n... [MINIMIZADO POR KODARA PRIVACY GUARD: ${sanitized.length - maxLength} caracteres omitidos] ...\n` +
        sanitized.slice(sanitized.length - half);
    }

    return sanitized;
  }

  /**
   * Detecta intentos de Prompt Injection en salidas de herramientas, logs o READMEs
   * para impedir que un proyecto externo altere las políticas de Kodara.
   */
  public static detectPromptInjection(untrustedContent: string): {
    detected: boolean;
    matchedPattern: string | null;
    neutralizedContent: string;
  } {
    if (!untrustedContent) {
      return { detected: false, matchedPattern: null, neutralizedContent: '' };
    }

    for (const pattern of this.PROMPT_INJECTION_PATTERNS) {
      const match = untrustedContent.match(pattern);
      if (match) {
        const neutralized = untrustedContent.replace(
          pattern,
          '[INYECCIÓN_DE_PROMPT_BLOQUEADA_POR_KODARA]'
        );
        return {
          detected: true,
          matchedPattern: match[0],
          neutralizedContent: neutralized,
        };
      }
    }

    return {
      detected: false,
      matchedPattern: null,
      neutralizedContent: untrustedContent,
    };
  }
}
