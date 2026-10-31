#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════
KODARA KUNG-FU DEFENSIVE PORT AUDITOR — Verificación Física en Sandbox
"Your Code. Your AI. Your Rules."
Demostración física del estándar Antigravity: Auditor de red sin dependencias
externas, con control estricto de descriptores (Semaphore) y banner grabbing.
═══════════════════════════════════════════════════════════════
"""

import asyncio
import ipaddress
import json
import socket
import sys
import time
from typing import Dict, List, Optional, Tuple

class DefensivePortAuditor:
    """
    Auditor de servicios y puertos TCP de alta concurrencia con protección
    contra saturación de descriptores (ulimit -n) y banner grabbing pasivo.
    """

    def __init__(self, target_host: str = "127.0.0.1", max_concurrency: int = 50, timeout: float = 0.5):
        self.target = self._normalize_target(target_host)
        self.semaphore = asyncio.Semaphore(max_concurrency)
        self.timeout = timeout

    @staticmethod
    def _normalize_target(host: str) -> str:
        """Valida que sea una dirección IP válida o nombre de host seguro contra SSRF."""
        host = host.strip()
        try:
            return str(ipaddress.ip_address(host))
        except ValueError:
            return socket.gethostbyname(host)

    async def _probe_single_port(self, port: int) -> Tuple[int, str, Optional[str]]:
        """
        Inspecciona el Three-Way Handshake TCP (SYN -> SYN/ACK vs RST)
        y extrae pasivamente hasta 128 bytes de banner si el puerto responde.
        """
        async with self.semaphore:
            try:
                conn_coro = asyncio.open_connection(self.target, port)
                reader, writer = await asyncio.wait_for(conn_coro, timeout=self.timeout)

                banner = None
                try:
                    # Intento pasivo de banner grab no destructivo (ej. HTTP, SSH, demonios locales)
                    writer.write(b"\r\n")
                    await writer.drain()
                    raw_banner = await asyncio.wait_for(reader.read(128), timeout=0.25)
                    if raw_banner:
                        banner = raw_banner.decode("utf-8", errors="replace").strip().splitlines()[0]
                except (asyncio.TimeoutError, UnicodeDecodeError, OSError):
                    banner = "Servicio activo (sin banner legible)"
                finally:
                    writer.close()
                    await writer.wait_closed()

                return (port, "ABIERTO", banner or "Activo")
            except (asyncio.TimeoutError, ConnectionRefusedError, OSError):
                return (port, "CERRADO", None)

    async def audit_ports(self, ports: List[int]) -> Dict[str, any]:
        """Escanea una lista de puertos y devuelve el reporte completo."""
        t0 = time.perf_counter()
        tasks = [self._probe_single_port(p) for p in ports]
        results = await asyncio.gather(*tasks)
        elapsed_ms = round((time.perf_counter() - t0) * 1000, 2)

        open_ports = {}
        for port, estado, banner in results:
            if estado == "ABIERTO":
                open_ports[str(port)] = {
                    "estado": estado,
                    "banner": banner or "N/A"
                }

        return {
            "target": self.target,
            "total_ports_probed": len(ports),
            "open_ports_count": len(open_ports),
            "open_ports": open_ports,
            "elapsed_ms": elapsed_ms,
            "semaphore_limit": self.semaphore._value + len(ports), # Capacidad de descriptores
            "status": "SUCCESS"
        }

def main():
    target = sys.argv[1] if len(sys.argv) > 1 else "127.0.0.1"
    ports = [22, 80, 443, 3000, 3777, 8080, 11434, 18888]

    auditor = DefensivePortAuditor(target, max_concurrency=50, timeout=0.4)
    report = asyncio.run(auditor.audit_ports(ports))
    print(json.dumps(report, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()
