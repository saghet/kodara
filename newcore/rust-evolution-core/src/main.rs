// ═══════════════════════════════════════════════════════════════
// KODARA EVOLUTION ENGINE — Rust Core
// "Your Code. Your AI. Your Rules."
// Normalizador determinista de firmas de error, clasificador de
// las 5 categorías y sanitizador de secretos (Privacy-by-Design).
// ═══════════════════════════════════════════════════════════════

use std::env;

/// Normaliza un mensaje de error eliminando rutas absolutas variables,
/// números de línea efímeros, direcciones de memoria y timestamps para
/// producir una firma reproducible entre proyectos distintos.
pub fn normalize_error_signature(raw_log: &str, component: &str) -> String {
    let lower = raw_log.to_lowercase();

    // 1. Códigos de compilador de Rust (ej. E0308, E0425, E0502, E0277)
    for code in ["e0308", "e0425", "e0432", "e0433", "e0502", "e0597", "e0277", "e0061"] {
        if lower.contains(&format!("error[{}]", code)) || lower.contains(code) {
            return format!("RUSTC_{}", code.to_uppercase());
        }
    }

    // 2. Errores de TypeScript / Bun
    for ts_code in ["ts2304", "ts2322", "ts2339", "ts2345", "ts2554"] {
        if lower.contains(ts_code) {
            return format!("TSC_{}", ts_code.to_uppercase());
        }
    }

    // 3. Fallos de herramientas externas o entorno
    if lower.contains("command not found") || lower.contains("enoent") {
        return "ENV_MISSING_BINARY_OR_PATH".to_string();
    }
    if lower.contains("address already in use") || lower.contains("eaddrinuse") {
        return "ENV_PORT_ALREADY_IN_USE".to_string();
    }
    if lower.contains("permission denied") || lower.contains("eacces") {
        return "ENV_PERMISSION_DENIED".to_string();
    }
    if lower.contains("timed out") || lower.contains("etimedout") {
        return format!("TIMEOUT_{}", component.to_uppercase().replace('-', "_"));
    }
    if lower.contains("context length exceeded") || lower.contains("hallucinated") || lower.contains("invalid tool call") {
        return "AI_AGENT_REASONING_OR_CONTEXT_FAILURE".to_string();
    }
    if lower.contains("kodara_internal") || lower.contains("fastifyerror") || lower.contains("sqlite_busy") {
        return "KODARA_ENGINE_INTERNAL_FAULT".to_string();
    }

    // 4. Hash determinista FNV-1a (64 bits) sobre tokens alfabéticos canónicos
    let mut hash: u64 = 0xcbf29ce484222325;
    for token in lower.split_whitespace() {
        // Ignorar rutas absolutas, números puros y hashes hexadecimales
        if token.starts_with('/') || token.starts_with("0x") || token.chars().all(|c| c.is_ascii_digit()) {
            continue;
        }
        let clean: String = token.chars().filter(|c| c.is_ascii_alphanumeric() || *c == '_').collect();
        if clean.len() >= 3 {
            for b in clean.bytes() {
                hash ^= b as u64;
                hash = hash.wrapping_mul(0x100000001b3);
            }
        }
    }

    format!("SIG_{}_{:012X}", component.to_uppercase().replace('-', "_"), hash & 0xFFFFFFFFFFFF)
}

/// Clasifica estrictamente el error en una de las 5 categorías de Kodara Evolution Engine
pub fn classify_error_category(raw_log: &str, component: &str, project_path: &str) -> &'static str {
    let lower = raw_log.to_lowercase();
    let comp_lower = component.to_lowercase();

    // 1. Fallos del propio motor de Kodara (cuidando de no confundir con proyectos desarrollados)
    if comp_lower.starts_with("kodara-engine")
        || comp_lower.starts_with("kodara-ui")
        || lower.contains("kodara_internal")
        || (lower.contains("/velocity/newcore/src/") && !project_path.contains("/velocity/newcore"))
    {
        return "KODARA_ENGINE_ERROR";
    }

    // 2. Fallos de agentes de IA (inferencia, alucinaciones, truncamiento, JSON inválido)
    if comp_lower.contains("agent")
        || comp_lower.contains("ollama")
        || lower.contains("invalid json schema")
        || lower.contains("model runner has unexpectedly stopped")
        || lower.contains("tool call validation failed")
    {
        return "AI_AGENT_FAILURE";
    }

    // 3. Problemas de configuración, permisos o dependencias faltantes
    if lower.contains("command not found")
        || lower.contains("permission denied")
        || lower.contains("cannot find module")
        || lower.contains("failed to select a version for the requirement")
        || lower.contains("no such file or directory")
        || lower.contains("eaddrinuse")
    {
        return "CONFIG_DEPENDENCY_ERROR";
    }

    // 4. Errores de herramientas externas (nmap, semgrep, trivy, tshark, git)
    if comp_lower.starts_with("tool:")
        || lower.contains("nmap:")
        || lower.contains("semgrep error")
        || lower.contains("tshark:")
        || lower.contains("fatal: not a git repository")
    {
        return "EXTERNAL_TOOL_ERROR";
    }

    // 5. Por defecto en compilaciones/pruebas del proyecto activo: Error de código del proyecto
    "PROJECT_CODE_ERROR"
}

/// Sanitiza secretos y credenciales antes de almacenar en telemetría local
pub fn scrub_sensitive_data(input: &str) -> String {
    let mut output = String::new();
    for line in input.lines() {
        let lower = line.to_lowercase();
        if lower.contains("api_key=")
            || lower.contains("apikey=")
            || lower.contains("password=")
            || lower.contains("secret=")
            || lower.contains("authorization: bearer ")
            || lower.contains("-----begin ")
            || lower.contains("ghp_")
            || lower.contains("sk-")
        {
            // Redactar el valor conservando la clave para diagnóstico
            if let Some(eq_idx) = line.find('=') {
                output.push_str(&line[..=eq_idx]);
                output.push_str("[REDACTED_BY_KODARA_PRIVACY_GUARD]\n");
            } else if let Some(col_idx) = line.find(':') {
                output.push_str(&line[..=col_idx]);
                output.push_str(" [REDACTED_BY_KODARA_PRIVACY_GUARD]\n");
            } else {
                output.push_str("[REDACTED_SECRET_LINE]\n");
            }
        } else {
            output.push_str(line);
            output.push('\n');
        }
    }
    output.trim_end().to_string()
}

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 {
        println!("{{\"status\":\"ok\",\"engine\":\"kodara-evolution-core-rust\",\"version\":\"0.1.0\"}}");
        return;
    }

    let cmd = args[1].as_str();
    match cmd {
        "analyze" => {
            let raw_log = args.get(2).map(|s| s.as_str()).unwrap_or("");
            let component = args.get(3).map(|s| s.as_str()).unwrap_or("compiler");
            let project_path = args.get(4).map(|s| s.as_str()).unwrap_or("/tmp/project");

            let signature = normalize_error_signature(raw_log, component);
            let category = classify_error_category(raw_log, component, project_path);
            let scrubbed = scrub_sensitive_data(raw_log);

            let escaped_scrubbed = scrubbed
                .replace('\\', "\\\\")
                .replace('"', "\\\"")
                .replace('\n', "\\n");

            println!(
                "{{\"signature\":\"{}\",\"category\":\"{}\",\"sanitized_log\":\"{}\"}}",
                signature, category, escaped_scrubbed
            );
        }
        _ => {
            println!("{{\"error\":\"unknown_command\"}}");
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_signature_equivalence_across_projects() {
        let err_proj_a = "error[E0308]: mismatched types\n --> /home/user/proj_a/src/main.rs:14:5";
        let err_proj_b = "error[E0308]: mismatched types\n --> /opt/other_proj/src/lib.rs:99:12";
        assert_eq!(
            normalize_error_signature(err_proj_a, "rustc"),
            normalize_error_signature(err_proj_b, "rustc")
        );
        assert_eq!(normalize_error_signature(err_proj_a, "rustc"), "RUSTC_E0308");
    }

    #[test]
    fn test_strict_5_category_separation() {
        assert_eq!(
            classify_error_category("error[E0425]: cannot find value `x`", "rustc", "/home/user/app"),
            "PROJECT_CODE_ERROR"
        );
        assert_eq!(
            classify_error_category("KODARA_INTERNAL: route handler failed", "kodara-engine", "/home/user/app"),
            "KODARA_ENGINE_ERROR"
        );
        assert_eq!(
            classify_error_category("nmap: QUITTING!", "tool:nmap", "/home/user/app"),
            "EXTERNAL_TOOL_ERROR"
        );
        assert_eq!(
            classify_error_category("sh: semgrep: command not found", "shell", "/home/user/app"),
            "CONFIG_DEPENDENCY_ERROR"
        );
        assert_eq!(
            classify_error_category("tool call validation failed: hallucinated param", "ai-agent", "/home/user/app"),
            "AI_AGENT_FAILURE"
        );
    }

    #[test]
    fn test_privacy_scrubber() {
        let log = "Connecting to server\nAPI_KEY=sk-1234567890abcdef\nStatus: Failed";
        let scrubbed = scrub_sensitive_data(log);
        assert!(!scrubbed.contains("sk-1234567890abcdef"));
        assert!(scrubbed.contains("[REDACTED_BY_KODARA_PRIVACY_GUARD]"));
    }
}
