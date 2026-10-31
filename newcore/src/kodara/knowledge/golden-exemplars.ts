// ═══════════════════════════════════════════════════════════════
// KODARA GOLDEN EXEMPLARS — Plan Canguro
// "Your Code. Your AI. Your Rules."
// Catálogo de Pares Contrastivos (Few-Shot) que enseñan a Kodara
// la diferencia cualitativa entre código deficiente/robotizado y
// código con el estándar de excelencia de Google Antigravity.
// ═══════════════════════════════════════════════════════════════

export interface GoldenExemplarPair {
  id: string;
  domain: string;
  userPrompt: string;
  badResponse: {
    flaws: string[];
    snippet: string;
  };
  antigravityResponse: {
    interpretation: string;
    environment: string;
    code: string;
    usage: string;
  };
}

export const GOLDEN_EXEMPLARS: GoldenExemplarPair[] = [
  {
    id: 'file-hashing-stream',
    domain: 'Automatización y Seguridad de Archivos',
    userPrompt: 'Haz una función que verifique si un archivo descargado coincide con un hash SHA-256 sin congelar la memoria.',
    badResponse: {
      flaws: [
        'Usa `// TODO: implementar lectura por bloques`',
        'Lee todo el archivo con `.read()` saturando la memoria RAM si pesa gigabytes',
        'No maneja excepciones `FileNotFoundError` ni `PermissionError`',
        'No proporciona cómo ejecutarlo en una sola línea',
      ],
      snippet: `def check_hash(path, target):
    # TODO: implementar lectura por bloques para archivos grandes
    data = open(path, 'rb').read()
    import hashlib
    return hashlib.sha256(data).hexdigest() == target`,
    },
    antigravityResponse: {
      interpretation: 'Implementaré un verificador criptográfico en streaming que lee en fragmentos de 64 KB, calculando el digest SHA-256 de forma asíncrona y segura sin sobrecargar la RAM.',
      environment: 'No requiere dependencias externas; utiliza la biblioteca estándar de Python (`hashlib`, `pathlib`).',
      code: `import hashlib
from pathlib import Path
from typing import Optional

class SecureStreamHasher:
    """Verificador de integridad criptográfica por flujo de bloques."""

    @staticmethod
    def verify_sha256(file_path: str, expected_hash: str, chunk_size: int = 65536) -> bool:
        """
        Calcula el hash SHA-256 leyendo en fragmentos para proteger la memoria RAM.
        Maneja errores de acceso, archivo inexistente y valida mayúsculas/minúsculas.
        """
        path = Path(file_path)
        if not path.is_file():
            raise FileNotFoundError(f"El archivo especificado no existe o no es válido: {file_path}")

        hasher = hashlib.sha256()
        try:
            with open(path, "rb") as f:
                while chunk := f.read(chunk_size):
                    hasher.update(chunk)
            return hasher.hexdigest().lower() == expected_hash.strip().lower()
        except PermissionError as e:
            raise PermissionError(f"Permiso denegado al leer el archivo {file_path}: {e}")`,
      usage: `es_valido = SecureStreamHasher.verify_sha256("firmware.bin", "a3c5...d8")`,
    },
  },
  {
    id: 'safe-port-scanner',
    domain: 'Ciberseguridad y Redes Defensivas',
    userPrompt: 'Crea un escáner de puertos rápido y seguro para auditar los servicios locales de mi máquina.',
    badResponse: {
      flaws: [
        'Ejecuta llamadas inseguras a `os.system("nc -zv ...")` vulnerables a inyección de comandos',
        'Bloquea el hilo principal sin timeouts adecuados',
        'No libera descriptores de sockets abiertos',
      ],
      snippet: `import os
for port in [80, 443, 22]:
    os.system(f"nc -z 127.0.0.1 {port}")`,
    },
    antigravityResponse: {
      interpretation: 'Construiré un auditor de puertos TCP no bloqueante con control de concurrencia (`asyncio`), timeouts estrictos y cierre garantizado de sockets.',
      environment: 'Utiliza la biblioteca estándar de Python (`asyncio`, `socket`).',
      code: `import asyncio
from typing import List, Dict

class LocalPortAuditor:
    """Auditor asíncrono de puertos locales con protección de descriptores."""

    @staticmethod
    async def probe_port(host: str, port: int, timeout: float = 0.5) -> bool:
        """Comprueba de forma no bloqueante si un puerto TCP acepta conexiones."""
        try:
            conn = asyncio.open_connection(host, port)
            reader, writer = await asyncio.wait_for(conn, timeout=timeout)
            writer.close()
            await writer.wait_closed()
            return True
        except (asyncio.TimeoutError, ConnectionRefusedError, OSError):
            return False

    @classmethod
    async def audit_ports(cls, host: str = "127.0.0.1", ports: List[int] = None) -> Dict[int, str]:
        """Escanea una lista de puertos y devuelve el estado de cada servicio."""
        if ports is None:
            ports = [22, 80, 443, 3777, 8080, 11434]
        tasks = [cls.probe_port(host, p) for p in ports]
        results = await asyncio.gather(*tasks)
        return {port: ("ABIERTO" if is_open else "CERRADO") for port, is_open in zip(ports, results)}`,
      usage: `import asyncio; reporte = asyncio.run(LocalPortAuditor.audit_ports())`,
    },
  },
  {
    id: 'parameterized-sqlite-cache',
    domain: 'Base de Datos Segura y Caché',
    userPrompt: 'Guarda las sesiones y tokens de usuario de manera persistente y rápida.',
    badResponse: {
      flaws: [
        'Vulnerable a Inyección SQL concatenando strings: `f"INSERT INTO sessions VALUES (\'{token}\')"`',
        'No activa WAL mode para alta concurrencia',
        'Guarda tokens en texto plano sin sanitizar',
      ],
      snippet: `import sqlite3
con = sqlite3.connect("cache.db")
con.execute(f"INSERT INTO sessions VALUES ('{token}', '{user}')")`,
    },
    antigravityResponse: {
      interpretation: 'Diseñaré un almacén de sesiones transaccional en SQLite con modo WAL de alto rendimiento, consultas 100% parametrizadas (anti-SQL Injection) y expiración de tokens.',
      environment: 'Biblioteca estándar de Python (`sqlite3`, `time`).',
      code: `import sqlite3
import time
from pathlib import Path
from typing import Optional, Dict

class SecureSessionStore:
    """Almacén seguro de sesiones con prevención de SQLi y concurrencia WAL."""

    def __init__(self, db_path: str = "sessions.db"):
        self.db_path = Path(db_path)
        self._init_db()

    def _init_db(self) -> None:
        """Crea el esquema con llaves primarias e índices en modo WAL."""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("PRAGMA journal_mode=WAL;")
            conn.execute("""
                CREATE TABLE IF NOT EXISTS user_sessions (
                    user_id TEXT NOT NULL,
                    token_hash TEXT PRIMARY KEY,
                    expires_at REAL NOT NULL,
                    created_at REAL NOT NULL
                );
            """)
            conn.execute("CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id);")

    def save_session(self, user_id: str, token_hash: str, ttl_seconds: int = 86400) -> None:
        """Inserta o actualiza una sesión utilizando parámetros enlazados (anti-SQLi)."""
        now = time.time()
        expires = now + ttl_seconds
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                "INSERT OR REPLACE INTO user_sessions (user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?)",
                (user_id, token_hash, expires, now)
            )

    def is_session_valid(self, token_hash: str) -> bool:
        """Verifica la validez y expiración del token mediante consulta parametrizada."""
        now = time.time()
        with sqlite3.connect(self.db_path) as conn:
            row = conn.execute(
                "SELECT 1 FROM user_sessions WHERE token_hash = ? AND expires_at > ? LIMIT 1",
                (token_hash, now)
            ).fetchone()
            return row is not None`,
      usage: `store = SecureSessionStore(); store.save_session("usr_99", "tok_hash_123"); ok = store.is_session_valid("tok_hash_123")`,
    },
  },
  {
    id: 'telemetry-dark-card',
    domain: 'Interfaces Web y Componentes UI',
    userPrompt: 'Haz un widget interactivo oscuro para monitorear el consumo de CPU y RAM de un servidor.',
    badResponse: {
      flaws: [
        'Código roto que mezcla etiquetas sin cerrar',
        'CSS no adaptable a modo oscuro con colores chillones',
        'Sin manejo de actualización de datos en tiempo real',
      ],
      snippet: `<div>CPU: <span id="cpu">0%</span></div><script>setInterval(() => {}, 1000);</script>`,
    },
    antigravityResponse: {
      interpretation: 'Construiré un widget web autocontenido con diseño Glassmorphism oscuro, barras de progreso reactivas con transición suave y función de actualización de datos en tiempo real.',
      environment: 'HTML5, CSS moderno y Vanilla JavaScript (cero dependencias externas).',
      code: `<div id="telemetryCard" style="background:#13141c;border:1px solid rgba(56,189,248,0.25);border-radius:12px;padding:1rem 1.2rem;width:280px;font-family:system-ui,sans-serif;color:#f8fafc">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem">
    <span style="font-size:0.8rem;font-weight:700;color:#38bdf8">⚡ TELEMETRÍA EN VIVO</span>
    <span id="telStatus" style="font-size:0.65rem;color:#34d399;background:rgba(52,211,153,0.1);padding:0.15rem 0.4rem;border-radius:4px">ACTIVO</span>
  </div>
  <div style="margin-bottom:0.6rem">
    <div style="display:flex;justify-content:space-between;font-size:0.72rem;margin-bottom:0.25rem">
      <span style="color:#94a3b8">CPU Ryzen:</span>
      <span id="cpuVal" style="font-weight:600">14%</span>
    </div>
    <div style="background:#1e202e;height:6px;border-radius:3px;overflow:hidden">
      <div id="cpuBar" style="background:#38bdf8;width:14%;height:100%;transition:width 0.4s ease"></div>
    </div>
  </div>
  <div>
    <div style="display:flex;justify-content:space-between;font-size:0.72rem;margin-bottom:0.25rem">
      <span style="color:#94a3b8">RAM Sistema:</span>
      <span id="ramVal" style="font-weight:600">32%</span>
    </div>
    <div style="background:#1e202e;height:6px;border-radius:3px;overflow:hidden">
      <div id="ramBar" style="background:#a78bfa;width:32%;height:100%;transition:width 0.4s ease"></div>
    </div>
  </div>
</div>
<script>
  function updateTelemetry(cpuPercent, ramPercent) {
    document.getElementById('cpuVal').textContent = cpuPercent + '%';
    document.getElementById('cpuBar').style.width = Math.min(100, Math.max(0, cpuPercent)) + '%';
    document.getElementById('ramVal').textContent = ramPercent + '%';
    document.getElementById('ramBar').style.width = Math.min(100, Math.max(0, ramPercent)) + '%';
  }
</script>`,
      usage: `updateTelemetry(24, 45); // Actualiza CPU y RAM en la tarjeta visual con animación suave`,
    },
  },
];

export class GoldenExemplarsEngine {
  public static getAllExemplars(): GoldenExemplarPair[] {
    return GOLDEN_EXEMPLARS;
  }

  public static getExemplarByDomain(domainKeyword: string): GoldenExemplarPair | undefined {
    const k = domainKeyword.toLowerCase();
    return GOLDEN_EXEMPLARS.find(
      (e) => e.domain.toLowerCase().includes(k) || e.id.toLowerCase().includes(k)
    );
  }

  /**
   * Genera un bloque formativo Few-Shot para afianzar el estándar de excelencia en Kodara.
   */
  public static buildFewShotPromptBlock(): string {
    const lines: string[] = [
      `=== EJEMPLAR FORMATIVO GOLDEN (ESTÁNDAR ANTIGRAVITY) ===`,
      `Observa la diferencia entre código incompleto con TODOs y la solución completa de 4 fases que debes entregar siempre:`,
      ``,
    ];

    const prime = GOLDEN_EXEMPLARS[0];
    lines.push(`CASO: "${prime.userPrompt}"`);
    lines.push(`❌ LO QUE NUNCA DEBES HACER (Código a medio construir):`);
    lines.push(prime.badResponse.snippet);
    lines.push(`Defectos: ${prime.badResponse.flaws.join(' • ')}`);
    lines.push(``);
    lines.push(`✅ TU FORMA DE RESPONDER (Estándar Antigravity en 4 fases):`);
    lines.push(`1. Interpretación: ${prime.antigravityResponse.interpretation}`);
    lines.push(`2. Entorno: ${prime.antigravityResponse.environment}`);
    lines.push(`3. Código Funcional Completo:`);
    lines.push(prime.antigravityResponse.code);
    lines.push(`4. Uso Directo: ${prime.antigravityResponse.usage}`);

    return lines.join('\n');
  }
}
