# Arquitectura Actual de Kodara (Current Architecture)
**Versión Auditada**: 1.0.0 (Rama `main`)  
**Ecosistema**: TypeScript ESM, LibSQL (SQLite), Fastify, Bun, Rust Core

---

## 1. Diagrama de la Arquitectura Actual

```mermaid
graph TD
    User["👤 Desarrollador / Usuario"]
    
    subgraph Frontend["Capa de Presentación (Web UI)"]
        UI["dashboard.html (SPA Monolítica - 173 KB)<br/>Tailwind CSS + Vanilla JS"]
    end
    
    subgraph ServerLayer["Capa de Transporte & API (Fastify Monolítico - 1,789 líneas)"]
        ServerTS["newcore/src/server.ts<br/>- Endpoints REST (/api/projects, /api/kodara/...)<br/>- SSE Streams (/chat/stream, /plans/:id/execute-stream)<br/>- Inyección de Prompts & Heurísticas"]
    end
    
    subgraph LogicLayer["Lógica de Negocio y Motores de Kodara"]
        OrderComp["KodaraOrderCompiler<br/>- Parseo de órdenes en lenguaje natural<br/>- Detección de intenciones (Git, Deps, Run, Bump)"]
        PlanExec["KodaraPlanExecutor<br/>- Orquestación de 4 Fases de Ingeniería<br/>- Emisión SSE de Progreso (0% -> 100%)<br/>- PostExecutionAuditor"]
        ContextRouter["DynamicContextRouter (Plan Canguro)<br/>- Clasificación de dominio semántico<br/>- Ahorro de hasta 65% de tokens"]
        VisionEngine["KodaraVisionEngine<br/>- Tesseract OCR & Detección de Flechas"]
        BoundaryGuard["ProjectBoundaryGuard<br/>- Aislamiento estricto de workspace (Zero-Bleed)"]
    end
    
    subgraph MultiAgentLegacy["Subsistema Multi-Agente Aislado"]
        SwarmOrch["AgentOrchestrator<br/>- Enjambres y pizarras compartidas<br/>- Invocación desde CLI (kodara run)"]
        AgentLoop["Agent (agent.ts)<br/>- Loop ReAct con Tool Calling clásico"]
    end

    subgraph GatewayLayer["Pasarela de Modelos (ModelGateway)"]
        GateIndex["gateway/index.ts"]
        ProvOllama["OllamaProvider"]
        ProvOpenAI["OpenAIProvider"]
        ProvAnthropic["AnthropicProvider"]
        ProvGemini["GeminiProvider"]
        DirectFetch["⚠️ Bypass Directo por fetch()<br/>(server.ts -> localhost:11434/api/chat)"]
    end

    subgraph DataStorage["Persistencia & Archivos (SQLite LibSQL)"]
        SQLite[("opencentravity.db<br/>- projects, project_conversations, project_messages<br/>- kodara_project_memory, kodara_executable_plans<br/>- swarms, agents, artifacts_fts (FTS5)")]
        Workspaces["Espacios de Trabajo Locales en Linux<br/>(/home/saghet/Documents/...)"]
        RustCore["rust-evolution-core (Cargo Crate)"]
    end

    User -->|Navegador Web / HTTP| UI
    UI -->|REST & SSE Events| ServerTS
    
    ServerTS -->|Bypass directo| DirectFetch
    DirectFetch -->|HTTP POST| ProvOllama
    
    ServerTS --> OrderComp
    ServerTS --> PlanExec
    ServerTS --> ContextRouter
    ServerTS --> VisionEngine
    ServerTS --> BoundaryGuard
    
    OrderComp -->|Ejecuta comandos Bash| Workspaces
    PlanExec -->|Mutaciones y Compilaciones| Workspaces
    PlanExec -->|Auditoría e Indexación| SQLite
    
    ServerTS -->|CRUD Proyectos y Chats| SQLite
    
    SwarmOrch --> AgentLoop
    AgentLoop --> GateIndex
    GateIndex --> ProvOpenAI & ProvAnthropic & ProvGemini & ProvOllama
```

---

## 2. Flujo de Datos Principal (Ciclo de Vida de una Petición)

### 2.1 Flujo del Chat Interactivo (`/chat/stream`)
1. El usuario envía un mensaje desde `dashboard.html` junto a imágenes opcionales, `conversationId` y `projectId`.
2. `server.ts` intercepta la petición en `/chat/stream`:
   - Guarda el turno del usuario en `project_messages` (SQLite).
   - Verifica si es un comando especial (`/recordar`, `/learn`).
   - Analiza imágenes adjuntas mediante `KodaraVisionEngine` (OCR y anclaje al código).
   - Carga el historial completo persistente desde SQLite con `KodaraOrderCompiler.loadFullConversationHistory()`.
   - Consulta las órdenes compiladas y las lecciones aprendidas de `KodaraProjectMemory`.
   - Aplica el ruteo del *Plan Canguro* (`DynamicContextRouter`) para seleccionar qué módulos de conocimiento inyectar en el System Prompt.
3. **Bypass del Gateway**: En lugar de utilizar `ModelGateway.chatStream()`, `server.ts` ejecuta directamente `fetch('${config.ollamaBaseUrl}/api/chat')` contra la instancia local de Ollama (ej. DeepSeek-R1).
4. La respuesta es retransmitida token a token mediante SSE al navegador.

### 2.2 Flujo de Generación y Ejecución de Planes (`[▶ Proceed]`)
1. Cuando la respuesta del asistente contiene un plan estructurado, `PlanExecutor.createExecutablePlan()` lo registra en SQLite (`kodara_executable_plans`) en estado `READY_TO_PROCEED`.
2. El usuario pulsa el botón interactivo **`[▶ Proceed]`** en la cabina.
3. El frontend emite un stream SSE a `/api/kodara/plans/:id/execute-stream`.
4. `server.ts` invoca `KodaraPlanExecutor.executePlanById()`:
   - **Fase 1 (0% -> 25%)**: Carga historial, ejecuta clonado Git si aplica (`executeGitClone()`) e indexa los archivos del proyecto.
   - **Fase 2 (25% -> 55%)**: Aplica mutaciones de código fuente protegidas por `ProjectBoundaryGuard` y realiza auditoría SAST con Semgrep.
   - **Fase 3 (55% -> 85%)**: Resuelve e instala dependencias (`executeDependencyInstall()`) con Bun, Go, Cargo o Pip; compila binarios.
   - **Fase 4 (85% -> 100%)**: Lanza la aplicación (`executeApplicationLaunch()`), verifica su ejecución activa, audita el cumplimiento con `auditExecutionCompliance()` y registra la lección verificada en `KodaraProjectMemory`.

---

## 3. Modelo de Datos Actual (Esquema SQLite)

La base de datos relacional `opencentravity.db` gestiona el estado persistente a través de LibSQL:

- `projects`: Identificador (`proj_...`), nombre, ruta física en disco (`path`), fecha de creación.
- `project_conversations`: Sesiones de chat vinculadas a un proyecto (`id`, `project_id`, `title`, `updated_at`).
- `project_messages`: Mensajes individuales (`id`, `conversation_id`, `role`, `content`, `metadata_json`).
- `kodara_executable_plans`: Planes de trabajo (`plan_id`, `project_id`, `phases_json`, `status`, `execution_report_md`).
- `kodara_project_memory`: Aprendizaje local (`memory_id`, `project_id`, `language`, `error_signature`, `root_cause`, `verified_fix`, `confidence`).
- `kodara_core_memory`: Principios arquitectónicos inmutables y reglas globales.
- `swarms` & `agents`: Esquemas heredados para agentes autónomos y tareas de enjambre (usados principalmente por `cli.ts`).
- `artifacts` & `artifacts_fts`: Almacén de artefactos con soporte de búsqueda textual completa mediante SQLite FTS5.

---

## 4. Análisis de Acoplamiento y Desacople

| Componente | Nivel de Acoplamiento | Dependencias Fuertes | Impacto Arquitectónico |
| :--- | :--- | :--- | :--- |
| `server.ts` | **Extremo (Monolito)** | Fastify, SQLite, Ollama HTTP, OrderCompiler, PlanExecutor | Concentra demasiadas responsabilidades; cualquier cambio de protocolo o UI puede romper el backend. |
| `order-compiler.ts` | **Moderado** | `child_process.execSync`, Sistema de archivos, SQLite | Fuerte dependencia de comandos de Linux/Unix; no soporta de forma nativa Windows PowerShell. |
| `plan-executor.ts` | **Bajo / Modular** | `KodaraOrderCompiler`, `ProjectIndexer`, SQLite | Estructura de fases limpia y robusta; excelente candidato para orquestar agentes especializados. |
| `ModelGateway` | **Desconectado** | OpenAI, Anthropic, Gemini, Ollama SDKs | Está bien estructurado con interfaces, pero actualmente relegado y omitido en el flujo principal del chat. |
| `dashboard.html` | **Extremo** | Scripts embebidos, DOM directo, APIs REST ad-hoc | No utiliza componentes reutilizables; dificulta integrar herramientas avanzadas como un editor Monaco o xterm.js. |
