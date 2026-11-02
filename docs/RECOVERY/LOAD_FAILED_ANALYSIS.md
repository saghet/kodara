# INVESTIGACIÓN Y DIAGNÓSTICO DEL ERROR "LOAD FAILED"

**Fecha:** 2026-11-01T20:39:00-05:00  
**Proyecto:** Kodara Autonomous Development Environment  
**Error Investigado:** `Error: Load failed` en la burbuja de interacción con el asistente de IA.

---

## 1. NATURALEZA Y ORIGEN DEL ERROR

El mensaje textual `Load failed` **no es emitido por el backend de Kodara ni por Ollama**. Es el mensaje canónico que la API estándar `window.fetch()` de **WebKit (WebKit2GTK 4.1 en Linux / GTK3)** lanza cuando una petición HTTP en curso se aborta o se interrumpe prematuramente a nivel de socket de red (`TypeError: Load failed`).

En navegadores basados en Chromium (como Google Chrome) el error equivalente es `TypeError: Failed to fetch`. En navegadores basados en Gecko (Firefox) es `TypeError: NetworkError when attempting to fetch resource`. En la aplicación de escritorio nativa de Kodara (`/home/saghet/.local/bin/kodara-desktop`, construida sobre `WebKit2.WebView`), la excepción se materializa inequívocamente como:

```
TypeError: Load failed
```

---

## 2. TRAZA COMPLETA DE COMUNICACIÓN Y PUNTOS DE FALLO

A continuación se traza el ciclo completo de vida de una petición desde el usuario hasta DeepSeek-R1:

```
[1. USUARIO]
   │  Introduce orden en el textarea y pulsa Enter o clic en Enviar
   ▼
[2. INTERFAZ KODARA (WebKit2GTK / dashboard.html)]
   │  sendChatMessage() instancia AbortController y lanza fetch('/chat/stream')
   │  ⚠️ PUNTO DE FALLO A: WebKit2GTK aborta por latencia si el servidor no envía
   │     inmediatamente los encabezados HTTP 200 y el primer paquete de bytes.
   ▼
[3. FASTIFY HTTP SERVER (server.ts /chat/stream)]
   │  Recibe POST /chat/stream
   │  Ejecuta operaciones síncronas/asíncronas pesadas:
   │  - Reconciliación de conversación en SQLite
   │  - Carga de historial completo (OrderCompiler)
   │  - Detección de intenciones y análisis de reglas (.kodararules)
   │  ⚠️ PUNTO DE FALLO B: No se llamaba a reply.raw.writeHead(200) ni flushHeaders()
   │     antes de las operaciones pesadas, manteniendo la conexión HTTP en limbo TCP.
   ▼
[4. AI PROVIDER ENGINE (ai/index.ts -> providers/deepseek.provider.ts)]
   │  Resuelve el proveedor ('deepseek-r1') y prepara AIChatRequest
   │  ⚠️ PUNTO DE FALLO C: Resolución de host 'localhost' en lugar de IPv4 '127.0.0.1'
   │     puede provocar intentos de conexión fallidos a IPv6 (::1).
   ▼
[5. LOCAL OLLAMA ENGINE (127.0.0.1:11434 /api/chat)]
   │  Carga en VRAM de la GPU NVIDIA RTX 4060 del modelo deepseek-r1:latest (4.68 GB)
   │  Contexto: num_ctx=32768, num_threads=8
   │  ⚠️ PUNTO DE FALLO D: Latencia de carga de pesos de 10 a 14 segundos.
   │     Durante este intervalo no se emitían heartbeats (: ping\n\n) hacia el cliente,
   │     superando el umbral de desconexión por inactividad de WebKit2GTK.
   ▼
[6. INFERENCIA & STREAMING DE RAZONAMIENTO]
   │  Ollama comienza a emitir chunks NDJSON (<think>...</think> y respuesta final)
   │  StreamingReasoningParser separa el CoT de la respuesta
   ▼
[7. RESPUESTA HACIA EL CLIENTE]
   │  Fastify emite data: {"chunk":"..."} y data: {"reasoningChunk":"..."}
   ▼
[8. RENDERIZADO EN PANTALLA]
   │  dashboard.html actualiza aiNode y el acordeón CoT
```

---

## 3. FACTORES CONCURRENTES QUE AGRAVAN EL ERROR

1. **Saturación por Polling de Hardware Telemetry:**
   En `dashboard.html`:
   ```javascript
   setInterval(pollHardwareTelemetry, 2500);
   ```
   Cada 2.5 segundos se envía una petición GET a `/api/kodara/hardware-telemetry`. En WebKitGTK, conexiones concurrentes continuas contra el mismo puerto mientras una conexión SSE de larga duración está en espera aumentan el riesgo de desconexión del socket.

2. **Falta de Reconexión y Heartbeat Inicial en el Endpoint SSE:**
   El endpoint `/chat/stream` no emitía inmediatamente un comentario SSE inicial (`: connected\n\n` o `: ping\n\n`) ni forzaba `reply.raw.flushHeaders?.()`, provocando que WebKit considerara la petición no respondida si la GPU tardaba en inicializar el modelo.

3. **Manejo de Errores Indiscriminado en el Cliente:**
   El bloque `catch` del cliente capturaba cualquier fallo (incluyendo desconexiones temporales) y destruía el nodo de respuesta sustituyéndolo por el mensaje rígido:
   ```html
   <span style="color:#ef4444">Error: Load failed</span>
   ```
   impidiendo al usuario saber si el backend seguía procesando o si era posible reintentar la transmisión.

---

## 4. SOLUCIÓN TÉCNICA VERIFICABLE (PLAN DE REMEDIACIÓN)

1. **Flush Inmediato de Encabezados HTTP 200 en `/chat/stream`:**
   Llamar a `reply.raw.writeHead(200)` y emitir de inmediato un preámbulo SSE (`: connected\n\n`) para que el socket TCP quede formalmente abierto en WebKit2GTK sin importar el tiempo de calentamiento de la GPU.

2. **Heartbeat Periódico durante la Espera de Inferencia:**
   Si la inferencia tarda más de 2 segundos en emitir el primer token, enviar pings SSE periódicos (`: keepalive\n\n` o logs de telemetría de carga de GPU) para mantener el stream activo y vivo.

3. **Fijar Conexión Ollama a IPv4 Estricto (`http://127.0.0.1:11434`):**
   Erradicar cualquier referencia residual a `localhost` en los providers para evitar la penalización de resolución IPv6 (`::1`).

4. **Tratamiento Resiliente de Errores en Frontend:**
   Mejorar la función `sendChatMessage()` para ofrecer un botón de reintento `[🔄 Reintentar]` y diagnóstico explicativo en caso de desconexión de red, en lugar de un `Error: Load failed` descontextualizado.
