# MATRIZ DE FUNCIONALIDADES Y TRAZABILIDAD — KODARA

**Fecha:** 2026-11-01T20:38:30-05:00  
**Versión Auditada:** Kodara Autonomous Development Environment (`recovery/stabilization`)

---

## MATRIZ DE TRAZABILIDAD ARQUITECTÓNICA

| Funcionalidad | Estado Anterior (Pre-Fases) | Implementación Actual | Estado Real | Problemas y Observaciones |
|---|---|---|---|---|
| **Kodara Core Event Hub** | Acoplado al router de Fastify | `CoreEventHub` desacoplado tipo pub/sub | **FUNCIONAL** | Ninguno. Eventos distribuidos correctamente. |
| **Seguridad Zero-Bleed** | Validaciones locales ad-hoc | `SecurityGuard` y `SecurityAuthorizer` | **FUNCIONAL** | Ninguno. Rechaza path traversal e inyecciones. |
| **Inferencia DeepSeek-R1** | Llamada directa por fetch a Ollama | `AIProviderEngine` + `DeepSeekR1Provider` | **FUNCIONAL CON ERRORES** | Timeout/desconexión en la carga inicial de pesos GPU en WebKitGTK. |
| **Streaming de Razonamiento (<think>)** | Bloque monolítico en el chat | `StreamingReasoningParser` + Acordeón CoT | **FUNCIONAL** | Funciona cuando el stream fluye; falla si el cliente aborta prematuramente. |
| **OSAdapter Multiplataforma** | Comandos crudos de child_process | `SystemRuntimeEngine` + `LinuxAdapter` | **FUNCIONAL** | Ejecución asíncrona no bloqueante con timeout y cancelación. |
| **Planificación Jerárquica DAG** | 4 fases lineales en SQLite | `AutonomousPlanningEngine` con orden Kahn | **FUNCIONAL** | El backend valida y ordena sin ciclos. Requiere refresco fluido en UI. |
| **Replanificación Adaptativa** | Fallback estático en memoria | `ReplanningEngine` dinámico | **FUNCIONAL** | Inyecta tareas de remediación ante fallos. |
| **Enjambre de 10 Agentes** | Rol único con prompt adaptativo | 10 perfiles con matriz de privilegios | **FUNCIONAL** | Pizarra colaborativa y Git worktrees operan en backend. |
| **Memoria en 6 Dimensiones** | Memoria Dual (Project vs Core) | `ProjectMemoryEngine` (6 tiers, ADRs, RAG) | **FUNCIONAL** | Almacenamiento e indexación TF-IDF probados al 100%. |
| **Pipeline de Verificación** | 4 fases rígidas en Proceed | `VerificationEngine` en 4 etapas | **FUNCIONAL** | Detección SAST, tipado y compilación verificados. |
| **Bucle de Auto-Reparación** | Lógica de parches ad-hoc | `AutoRepairLoop` con snapshots y memoria | **FUNCIONAL** | Límite de 3 reintentos para evitar bucles infinitos. |
| **Chat y Streaming en Frontend** | Fetch de texto continuo | Fetch SSE con reader y AbortController | **REGRESIÓN DETECTADA** | Error `Load failed` en WebKit2GTK ante latencia inicial o desconexión. |
| **Selector de Modelo en Prompt** | Menú desplegable básico | Dropdown con descripciones largas | **REGRESIÓN DETECTADA** | Desbordamiento horizontal en resoluciones < 1600px; controles empujados. |
| **Distribución de Paneles (Layout)** | 3 columnas fijas | `grid-template-columns: 255px 1fr 470px` | **REGRESIÓN DETECTADA** | El Workbench de 470px ahoga el chat central en pantallas 1366x768. Falta botón toggle. |
| **Visor DAG en Workbench** | No existía | Panel con nodos y badges de estado | **FUNCIONAL CON ERRORES** | Requiere scroll independiente y ajuste de espaciado. |
| **Monitor de Enjambre en Workbench** | No existía | Panel con 10 tarjetas y feed de notas | **FUNCIONAL** | Datos cargados vía REST Fastify. |
| **Modal Visor de Diffs** | No existía | `renderUnifiedDiff` modal overlay | **FUNCIONAL** | Opera correctamente en pruebas unitarias. |
| **Modal de Confirmación HITL** | Solo tarjetas en el chat | Modal dedicado de alta prioridad | **FUNCIONAL** | Permite aprobación y rechazo reactivo. |

---

## CLASIFICACIÓN GLOBAL

- **Componentes FUNCIONALES:** 12
- **Componentes FUNCIONALES CON ERRORES:** 2
- **Componentes con REGRESIÓN DETECTADA:** 3
- **Componentes NO FUNCIONALES:** 0
- **Componentes NO IMPLEMENTADOS:** 0
