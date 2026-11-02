# Deuda Técnica y Oportunidades de Mejora en Kodara (Technical Debt)
**Fecha**: 2026-11-01  
**Clasificación**: Crítica (P0), Alta (P1), Media (P2), Baja (P3)

---

## 1. Inventario de Deuda Técnica

### 🔴 P0: Monolito Central en `server.ts`
- **Diagnóstico**: `server.ts` cuenta con 1,789 líneas de código donde coexisten la declaración de rutas REST/SSE, la lógica de parseo de intenciones, la inyección de prompts, la orquestación de herramientas, la conexión a bases de datos y la invocación HTTP cruda.
- **Riesgo**: Fragilidad extrema ante refactorizaciones, dificultad para introducir pruebas unitarias aisladas de la API y riesgo de regresiones colaterales en endpoints críticos.
- **Mitigación**: Descomponer `server.ts` en controladores específicos de dominio (`controllers/projects.ts`, `controllers/chat.ts`, `controllers/plans.ts`, `controllers/tools.ts`) y un middleware de eventos SSE desacoplado.

---

### 🔴 P0: Bypass de la Pasarela de Modelos (`ModelGateway`) en el Chat Principal
- **Diagnóstico**: Mientras existe un módulo completo en `src/gateway/` con clases estandarizadas para OpenAI, Anthropic, Gemini y Ollama, la ruta interactiva `/chat/stream` realiza un `fetch()` HTTP directo a la API cruda de Ollama (`/api/chat`).
- **Riesgo**: Imposibilidad de conmutar dinámicamente entre proveedores (DeepSeek API, Claude, OpenAI, modelos locales), ausencia de políticas unificadas de reintentos, timeouts y medición centralizada de consumo de tokens.
- **Mitigación**: Homogeneizar todo el flujo de inferencia a través de una interfaz `AIProviderEngine` extensible, soportando detección de capacidades (*tool calling*, streaming, razonamiento profundo con `<think>`, contexto largo y multimodalidad).

---

### 🟠 P1: Desconexión entre el Chat Interactivo y el Sistema Multi-Agente
- **Diagnóstico**: Existen dos realidades paralelas en el código:
  1. El chat interactivo (`server.ts` + `dashboard.html`), que actúa como un asistente único asistido por heurísticas de compilación de órdenes.
  2. El subsistema de agentes y enjambres (`orchestrator/agent.ts` + `orchestrator/messagebus.ts`), que implementa un ciclo de agentes autónomos con *tool calling*, pero solo se utiliza a través del CLI (`kodara run`) o endpoints secundarios no conectados a la experiencia principal.
- **Riesgo**: Duplicidad de lógica y desaprovechamiento de la arquitectura multiagente para tareas complejas de desarrollo en el navegador.
- **Mitigación**: Unificar ambos mundos mediante el **Orquestador Central Multi-Agente**, donde el chat sea la cabina interactiva de supervisión de los agentes especializados (Architect, Planner, Developer, Debugger, Tester, Security, Reviewer).

---

### 🟠 P1: Bloqueos Síncronos en la Ejecución de Herramientas (`execSync`)
- **Diagnóstico**: Operaciones pesadas en `order-compiler.ts` y herramientas de compilación/clonado usan `child_process.execSync` con timeouts de hasta 120-180 segundos.
- **Riesgo**: Aunque el servidor use Bun/Node con eventos asíncronos en Fastify, un `execSync` largo bloquea el Event Loop del hilo principal de JavaScript, impidiendo que otros streams SSE respondan con fluidez durante descargas o compilaciones intensivas.
- **Mitigación**: Migrar todas las operaciones de sistema a flujos asíncronos (`spawn` o `child_process.exec` con Promises y streaming en tiempo real a través de colas de eventos).

---

### 🟡 P2: Acoplamiento Específico a Linux y Falta de Abstracción Multiplataforma
- **Diagnóstico**: Múltiples secciones del código invocan comandos exclusivos de Linux (`pkill`, `systemctl`, inspección de `/proc/loadavg` o `/proc/self/status` para telemetría).
- **Riesgo**: Incompatibilidad funcional directa si el entorno de desarrollo se ejecuta en Windows nativo (PowerShell) sin WSL.
- **Mitigación**: Implementar la capa **System Runtime Engine** con la interfaz común `OSAdapter`, proveyendo implementaciones nativas para Linux (`LinuxAdapter`) y Windows (`WindowsAdapter` con soporte para PowerShell y WSL).

---

### 🟡 P2: Cabina Web Monolítica (`dashboard.html`)
- **Diagnóstico**: `dashboard.html` acumula 173 KB de código HTML, CSS y JavaScript crudo en un solo archivo, con manipulación manual del DOM (`document.getElementById`, inserción de HTML mediante template strings).
- **Riesgo**: Imposibilidad de escalar hacia interfaces de usuario sofisticadas (árboles de archivos virtuales, editores de diff lado a lado, terminales interactivas xterm.js con soporte PTY y paneles acoplables).
- **Mitigación**: Modularizar progresivamente el frontend en componentes bien delimitados (Panel de Chat, Panel de Planificación, Explorador de Código, Terminal Web con WebSocket, Visor de Auditoría y Diffs).

---

### 🟢 P3: Carencia de Soporte Nativo para Model Context Protocol (MCP)
- **Diagnóstico**: `mcp-bridge.ts` es un esbozo que simula transporte JSON-RPC pero carece de un cliente MCP cliente-servidor formal para descubrir e invocar herramientas de servidores externos estandarizados.
- **Riesgo**: Aislamiento del ecosistema de plugins y herramientas de la comunidad open source.
- **Mitigación**: Diseñar un `MCPClient` modular dentro del **Tools Engine** que permita integrar servidores MCP externos sobre stdio o SSE con autenticación y validación de permisos.
