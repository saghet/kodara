# 🛡️ KODARA — Autonomous Cybersecurity, Secure Development & Evolution IDE
> **"Your Code. Your AI. Your Rules."**

**Kodara** es un entorno local 100% offline para Linux diseñado para **Desarrollo Seguro, Ciberseguridad Táctica (Red/Blue Team) y Evolución Autónoma**. Combina una interfaz limpia centrada en **Proyectos** (inspirada en Antigravity), ejecución directa en **Modo `🛡️ Turbo`** para ambientes autorizados, un **Puente MCP de Ciberseguridad** y el motor **Kodara Evolution Engine** en **Rust + TypeScript**.

---

## ✨ Características Principales

### 1. Arquitectura de Dos Memorias Independientes (SQLite)
Kodara separa física y lógicamente el aprendizaje de tus aplicaciones del diagnóstico interno del propio IDE:
* **🧠 `Kodara Project Memory` (`src/kodara/evolution/project-memory.ts`)**:
  * Aprende exclusivamente de los errores de compilación, fallos de pruebas, dependencias y hallazgos CWE que encuentra al **desarrollar y auditar aplicaciones** (Rust, TypeScript, Python).
  * Incrementa automáticamente el contador de reutilización (`times_reused`) e inyecta las soluciones verificadas en el contexto del proyecto activo.
* **⚙️ `Kodara Core Memory` (`src/kodara/evolution/core-memory.ts`)**:
  * Registra exclusivamente problemas internos del propio motor Kodara (latencia de inferencia, parsers, concurrencia SQLite) y genera **propuestas de mejora supervisadas** en ramas aisladas (`~/.local/share/kodara/self-patches/`).

---

### 2. Interfaz de Proyectos Estilo Antigravity + Modo `🛡️ Turbo` Sin Fricción
* **Columna Izquierda (`Projects`)**: Gestión multiproyecto (`SamulibreLinux`, `WiSharkOpen`, `Ollama`, `CLI Project`) con historial persistente de conversaciones en SQLite.
* **Columna Central (Flujo de Trabajo + Selector `🛡️ Turbo ⌄`)**:
  * Dado que Kodara opera en **ambientes con permisos explícitos**, el modo **`🛡️ Turbo`** está activo por defecto para ejecutar auditorías, escaneos, compilaciones y reparaciones en sandbox **de forma directa e inmediata sin bloqueos ni tarjetas intermedias**.
  * Incluye **Selector de Perfiles de Modelos con Consejero Integrado**:
    1. `Qwen2.5-Coder 7B / Qwen3-Coder-30B-A3B` — Desarrollo Seguro, Scripting y Herramientas MCP.
    2. `GLM-4.7-Flash` — Perfil Balanceado y Agentes Rápidos.
    3. `Gemma-4-26B-A4B` — Análisis de Logs, Nmap, SIEM y Triaje.
    4. `Devstral-Small-24B / DeepSeek-R1-14B` — Auditoría de Código (SAST) y Razonamiento Profundo.
* **Columna Derecha (Workbench con Pestañas)**:
  * Acceso en un clic a **`🧠 Kodara Project Memory`**, **`⚙️ Kodara Core Memory`** y **`🛡️ Arsenal & Activos`**.

---

### 3. Motor de Inferencia Local Optimizado para Hardware Linux
* **100% Offline sobre Ollama / OpenAI Local API**:
  * Fuerza automáticamente `num_ctx: 32768` (ventana de 32k tokens para evitar truncamiento silencioso en bucles de herramientas) y `num_threads: 8` (mapeado a los núcleos físicos del procesador AMD Ryzen 9 con aceleración en GPU NVIDIA RTX).
* **Indexador Profundo de Proyectos (`src/indexer/project-indexer.ts`)**:
  * Escanea recursivamente workspaces multi-crate en Rust (`Cargo.toml`, `src/lib.rs`) y proyectos TypeScript para alimentar al modelo con firmas reales.

---

### 4. Puente MCP de Ciberseguridad y Pre-procesador Anti-Desbordamiento
* **Puente MCP (`src/kodara/mcp-bridge.ts`)**:
  * Envuelve bajo esquemas JSON Schema validados 9 herramientas: `nmap`, `semgrep`, `trivy`, `whatweb`, `nuclei`, `tshark`, `whois`, `ffuf` y `gobuster`.
  * Detecta binarios instalados en Linux y cuenta con analizador SAST/SCA y Web nativo integrado de respaldo.
* **Compresor Anti-Desbordamiento (`src/kodara/output-preprocessor.ts`)**:
  * Intercepta salidas extensas (> 200 líneas) y extrae únicamente puertos abiertos, servicios, hallazgos CWE/CVE y notas críticas en un resumen estructurado (`llmDigest`) antes de pasarlo al LLM.
* **Árbol de Objetivos en Vivo y Exportador Markdown (`src/kodara/workspace-db.ts`)**:
  * Construye automáticamente el mapa `Proyecto/IP ➔ Puertos ➔ Servicios ➔ Vulnerabilidades ➔ Notas` y exporta informes ejecutivos en Markdown con un solo clic (`/api/kodara/report`).

---

### 5. Kodara Evolution Engine (Módulos 1 al 8 en Rust + TypeScript)

| Módulo | Componente | Descripción |
| :--- | :--- | :--- |
| **Núcleo Rust** | `rust-evolution-core/src/main.rs` | Normalización determinista de firmas (`RUSTC_E0308`, etc.), clasificación en las 5 categorías y sanitización de secretos. |
| **Módulo 1** | `src/kodara/evolution/telemetry-otel.ts` | Telemetría local basada en **OpenTelemetry** con los 13 campos obligatorios, métricas de CPU/RAM/latencia/tokens y redacción PII (`PrivacyScrubber`). |
| **Módulo 2** | `src/kodara/evolution/diagnostic-agent.ts` | **Kodara Diagnostic Agent**: distingue las 5 categorías (`PROJECT_CODE_ERROR`, `KODARA_ENGINE_ERROR`, `EXTERNAL_TOOL_ERROR`, `CONFIG_DEPENDENCY_ERROR`, `AI_AGENT_FAILURE`), naturaleza (`DETERMINISTIC`, `INTERMITTENT`, `ENVIRONMENTAL`) y traza de decisión. |
| **Módulo 3** | `src/kodara/evolution/repair-agent.ts` | **Kodara Repair Agent**: ciclo de autocorrección en sandbox aislado (máx. 3 intentos), compilación real con `rustc` y ejecución de `rustc --test` / `bun test`, con reversión automática si falla la verificación. |
| **Módulo 4** | `src/kodara/evolution/evolution-db.ts` | **Kodara Experience Memory**: persistencia SQLite con estados `VERIFIED`, `FAILED` y `PENDING_REVALIDATION` ante cambios de versión de herramientas. |
| **Módulo 5** | `src/kodara/evolution/learning-agent.ts` | **Kodara Learning Agent**: bloqueo automático de estrategias que fallan reiteradamente (*Negative Knowledge*) y mejora de prompts. |
| **Módulo 6** | `src/kodara/evolution/self-improvement-agent.ts` | **Kodara Self-Improvement Agent**: generación aislada de parches candidatos para el IDE con protección frente a *Prompt Injection*. |
| **Módulo 7 & 8** | `src/kodara/evolution/index.ts` | Suite de evaluación reproducible (MTTR, tasa de éxito, cero regresiones) y Panel de Observabilidad en tiempo real. |

---

## 🚀 Instalación y Ejecución Rápida en Linux

### 1. Compilar el Núcleo de Evolución en Rust
```bash
cd rust-evolution-core
cargo test
cargo build --release
cd ..
```

### 2. Instalar Dependencias y Ejecutar Pruebas Automatizadas
```bash
bun install
bun test src/kodara/evolution/
```

### 3. Iniciar el Servidor Kodara
```bash
bun run src/cli.ts serve
# Servidor activo en http://127.0.0.1:3777
```

---

## 🔌 Endpoints Principales de la API

* `GET /api/projects` — Árbol de proyectos y conversaciones en SQLite.
* `POST /chat/stream` — Streaming SSE con modo `turbo` directo, `num_ctx: 32768`, `num_threads: 8` e inyección automática de `Kodara Project Memory`.
* `GET /api/kodara/memory/project` & `POST /api/kodara/memory/project` — Consulta y registro en **Kodara Project Memory**.
* `GET /api/kodara/memory/core` & `POST /api/kodara/memory/core` — Consulta y propuestas supervisadas en **Kodara Core Memory**.
* `GET /api/kodara/arsenal`, `POST /api/kodara/propose`, `POST /api/kodara/execute` — Puente MCP de Ciberseguridad.
* `GET /api/kodara/targets` & `GET /api/kodara/report` — Mapa de activos en vivo e informe técnico en Markdown.
* `GET /api/kodara/evolution/state` & `POST /api/kodara/evolution/benchmark` — Estado de observabilidad y benchmark reproducible de **Kodara Evolution Engine**.

---

## 📄 Licencia
MIT — *"Your Code. Your AI. Your Rules."*
