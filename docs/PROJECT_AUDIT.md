# Auditoría Integral del Proyecto Kodara (Project Audit)
**Fecha**: 2026-11-01  
**Entorno de Ejecución**: Linux x86_64 (Arch Linux / Kernel 6.18) | Bun v1.4.4 / Node.js v22  
**Hardware Local**: AMD Ryzen 9 7940HS (16 threads) | 32 GB RAM | NVIDIA GeForce RTX 4060 (8 GB VRAM)  
**Autor**: Equipo Senior Multidisciplinario de Ingeniería de Software (Arquitectura de Agentes & IDE)

---

## 1. Resumen Ejecutivo

El proyecto **Kodara** (evolucionado desde las bases de *Velocity* y *OpenCentravity*) es un entorno de ingeniería de software local, ciberseguridad defensiva y compilación autónoma de código bajo la filosofía FOSS (*"Your Code. Your AI. Your Rules."*). 

La auditoría exhaustiva del repositorio revela un sistema con **altísimo valor en activos fundacionales** (un motor de orquestación multi-agente preliminar, sistema de memoria dual relacional en SQLite, compilador físico de órdenes, pasarela de modelos multivariable y analizador de visión multimodal con OCR y grounding). Sin embargo, sufre de **acoplamiento monolítico severo en la capa de transporte (`server.ts`) y la interfaz web (`dashboard.html`)**, bypass de componentes clave (el endpoint `/chat/stream` salta la pasarela `ModelGateway` para hablar directo a Ollama por HTTP plano), y una división artificial entre el chat interactivo y el subsistema de agentes autónomos.

Esta auditoría establece la línea base técnica para transformar a Kodara en un **Entorno de Desarrollo Autónomo de Clase Mundial** inspirado en la solidez de OpenCode, la ergonomía de Claude Code, el rigor de Google Antigravity y la capacidad de razonamiento profundo de DeepSeek R1.

---

## 2. Inventario de Tecnologías y Lenguajes

| Dimensión | Tecnología Actual | Versión / Detalle | Rol en el Sistema |
| :--- | :--- | :--- | :--- |
| **Lenguaje Principal** | TypeScript | `5.7.3` (ESM nativo) | Lógica de negocio, servidor, CLI, herramientas y agentes |
| **Runtime de Ejecución** | Bun / Node.js | Bun `1.4.4` / Node `>=20.0.0` | Ejecución del servidor, suites de pruebas unitarias (`bun test`) y tooling |
| **Lenguaje Secundario** | Rust | Edition 2021 (`cargo 1.85+`) | `rust-evolution-core` (cálculo de hashes, criptografía, parsing binario rápido) |
| **Base de Datos** | SQLite vía LibSQL | `@libsql/client ^0.17.3` | Almacenamiento local persistente (`opencentravity.db`), FTS5, WAL mode |
| **Servidor Web / API** | Fastify | `^5.2.1` | REST API, SSE streams (`/chat/stream`, `/execute-stream`), WebSockets |
| **CLI Framework** | Commander | `^13.1.0` | CLI ejecutable (`kodara run`, `kodara serve`, `kodara status`) |
| **Modelos Locales** | Ollama API | DeepSeek-R1 (7B/Q4), GLM-4.7, Qwen | Inferencia local acelerada en GPU NVIDIA RTX 4060 con contexto de 32K |
| **SDKs de Proveedores** | OpenAI, Anthropic, Google | `@anthropic-ai/sdk`, `openai`, `@google/generative-ai` | Conectores a nubes comerciales en `gateway/providers` |
| **Herramientas de Análisis** | Semgrep, Nmap, Z3 | `z3-solver ^4.16.0`, Binarios de sistema | SAST, auditoría de puertos, verificación formal con satisfacibilidad SMT |
| **Frontend / UI** | HTML5 / Tailwind / Vanilla JS | Monolito SPA (`dashboard.html`, 173 KB) | Cabina de control visual, chat, visor de memoria y métricas de hardware |

---

## 3. Estructura de Directorios del Repositorio

```text
/home/saghet/Documents/Ollama/Velocity/
├── assets/                       # Iconos, diagramas SVG y recursos gráficos
├── docs/                         # Documentación técnica y arquitectónica del sistema
├── MANUAL_KODARA.md              # Bitácora histórica viva de cambios y arquitectura (§1-§36)
├── newcore/                      # Núcleo modular principal de la aplicación (TypeScript)
│   ├── data/                     # Base de datos SQLite activa (opencentravity.db) y artefactos
│   ├── rust-evolution-core/      # Crate nativo en Rust para aceleración criptográfica/memoria
│   ├── src/
│   │   ├── cli.ts                # Entrada de línea de comandos (kodara CLI)
│   │   ├── server.ts             # Servidor monolítico Fastify (1,789 líneas)
│   │   ├── index.ts              # Exportación pública del motor
│   │   ├── artifacts/            # Gestión y persistencia de artefactos de ingeniería
│   │   ├── audit/                # Registro inmutable de auditoría y trazas
│   │   ├── config/               # Carga de variables de entorno (.env) y configuración
│   │   ├── db/                   # Inicialización LibSQL, migraciones FTS5 y DAOs
│   │   ├── gateway/              # Pasarela de modelos LLM y adaptadores de proveedores
│   │   ├── indexer/              # Indexador AST y explorador de repositorios
│   │   ├── kodara/               # Sub-motores de evolución, aprendizaje, visión y planes
│   │   │   ├── evolution/        # Memoria de proyecto, memoria central, auto-reparación
│   │   │   ├── knowledge/        # Router de contexto (Plan Canguro), filosofía y currículum
│   │   │   ├── security/         # Guardianes de fronteras de proyecto (Zero-Bleed)
│   │   │   ├── order-compiler.ts # Compilador de órdenes de lenguaje natural a acciones
│   │   │   ├── plan-executor.ts  # Orquestador físico de planes en 4 fases ejecutables
│   │   │   ├── vision-engine.ts  # Motor multimodal con OCR y visual grounding
│   │   │   └── __tests__/        # 25 suites de pruebas unitarias (128 tests, 100% pass)
│   │   ├── memory/               # Liquid memory y gestión de contexto histórico
│   │   ├── orchestrator/         # Enjambre multi-agente, pizarra compartida y locks
│   │   ├── policy/               # Políticas de seguridad y validación formal de acciones
│   │   ├── tools/                # Registro de herramientas ejecutables (FS, Git, Terminal, etc.)
│   │   └── web/                  # dashboard.html (interfaz gráfica de usuario)
│   └── package.json              # Dependencias y scripts del proyecto
└── README.md                     # Manifiesto y guía general del proyecto
```

---

## 4. Análisis de Componentes Críticos Existentes

### 4.1 Punto de Entrada y Ciclo de Vida
1. **CLI (`cli.ts`)**: Define comandos mediante `commander`: `kodara serve`, `kodara run <task>`, `kodara swarms`, `kodara backup`. Inicializa la base de datos `opencentravity.db` y puede lanzar el servidor o ejecutar un enjambre en consola.
2. **Servidor HTTP/SSE (`server.ts`)**: Inicia Fastify en el puerto `3777`. Sirve estáticamente `dashboard.html` en `/` y expone más de 45 rutas REST y 3 canales de Server-Sent Events (`/chat/stream`, `/api/kodara/plans/:id/execute-stream`, `/events`).

### 4.2 Integración de Modelos de Inteligencia Artificial
- **Existe una pasarela abstracta** (`newcore/src/gateway/`): Diseñada con interfaz `ModelProvider` e implementaciones para OpenAI, Anthropic, Gemini y Ollama.
- **Bypass en Producción**: En `server.ts` (línea 1405), el flujo principal del chat `/chat/stream` no utiliza la pasarela `ModelGateway`. Hace un `fetch()` HTTP directo a `http://localhost:11434/api/chat` contra Ollama. Esto anula la capacidad del usuario de intercambiar dinámicamente a proveedores remotos (DeepSeek API, Claude, OpenAI) dentro de la interfaz interactiva.
- **Soporte de Razonamiento**: DeepSeek-R1 está configurado localmente y el prompt inyecta delimitadores de pensamiento `<think>`, pero no existe un parser estructurado que separe el proceso de deliberación cognitiva del contenido ejecutable final.

### 4.3 Gestión de Conversaciones y Contexto
- Administrada en la tabla `project_conversations` y `project_messages` de SQLite.
- Los proyectos se aíslan en la tabla `projects` (`id`, `name`, `path`).
- `KodaraOrderCompiler.loadFullConversationHistory()` recupera los mensajes y `DynamicContextRouter` clasifica la intención para podar el prompt del sistema y ahorrar hasta un 65% de tokens innecesarios.

### 4.4 Ejecución de Comandos y Herramientas
- **Herramientas en `newcore/src/tools/`**: Posee implementaciones de `filesystem.ts`, `terminal.ts`, `sandbox.ts`, `git.ts`, `linter.ts`, `typechecker.ts` y `z3-solver.ts`.
- **Desconexión con el Chat**: Estas herramientas están cableadas al agente del enjambre (`orchestrator/agent.ts`), pero no están expuestas como *Function Calling* estandarizado en el chat interactivo de `server.ts`. En `server.ts`, las herramientas se ejecutan por heurística de regex (`detectTacticalToolIntent`) o a través de las 4 fases de `plan-executor.ts`.
- **Ejecución en OS**: Usa `child_process.execSync` con timeouts y variables de entorno sanitizadas, pero carece de un adaptador nativo multiplataforma que abstraiga diferencias entre Linux (Bash) y Windows (PowerShell/WSL).

### 4.5 Sistema de Planes Autónomos
- `KodaraPlanExecutor` genera y persiste artefactos `PLAN-...` con 4 fases de ejecución física.
- `order-compiler.ts` compila intenciones universales (`GIT_CLONE_REPOSITORY`, `DEPENDENCY_INSTALL`, `LAUNCH_APPLICATION`, `CODE_MODIFICATION`).
- Es un activo sobresaliente: no se limita a sugerir código, sino que clona repositorios, instala dependencias con Bun/Go/Cargo/Pip, compila binarios y audita físicamente en disco que los artefactos existan.

---

## 5. Diagnóstico de Fortalezas y Limitaciones

### Activos Altamente Valiosos (A Conservar y Potenciar):
1. **Memoria de Proyecto Dual (`KodaraProjectMemory` & `CoreMemory`)**: Base de datos SQLite especializada que aprende de cada error de compilación o seguridad y reutiliza soluciones verificadas.
2. **Guardián de Fronteras (`ProjectBoundaryGuard`)**: Mecanismo de seguridad que bloquea escrituras fuera de la raíz del proyecto activo (Zero-Bleed).
3. **Ejecutor Universal de Planes (`KodaraPlanExecutor`)**: Capacidad de compilar y ejecutar planes mediante SSE con barras de progreso reales (0% a 100%), telemetría y auditoría física post-ejecución.
4. **Motor de Visión Multimodal (`KodaraVisionEngine`)**: Extracción de texto por OCR, detección geométrica de flechas indicadoras y anclaje al código fuente.
5. **Suite de Pruebas Automatizada**: 25 suites y 128 pruebas unitarias sólidas bajo `bun test` que protegen contra regresiones.

### Limitaciones Arquitectónicas (A Transformar):
1. **Acoplamiento Monolítico en `server.ts`**: Un archivo de 1,789 líneas que mezcla ruteo HTTP, lógica de streaming SSE, formateo de prompts, invocación a Ollama, lectura de SQLite y despacho de herramientas.
2. **Falta de Abstracción OSAdapter**: Comandos fuertemente orientados a Linux (`pkill`, `systemctl`, `proc/loadavg`), limitando la portabilidad a Windows (PowerShell).
3. **Ausencia de Protocolo MCP Abierto**: Existe un archivo `mcp-bridge.ts` preliminar, pero no está conectado como un cliente MCP estándar para conectar herramientas de terceros.
4. **Desconexión entre el Chat y el Enjambre de Agentes**: El usuario chatea con un asistente general mientras el subsistema multi-agente (`orchestrator/agent.ts`) vive aislado y solo es invocable por CLI o endpoints secundarios `/agents`.
5. **Frontend Monolítico sin Componentes**: `dashboard.html` contiene 173 KB de código inline difícil de extender con editores de código modernos o terminales interactivas tipo xterm.js.
