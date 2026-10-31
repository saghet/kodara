// ═══════════════════════════════════════════════════════════════
// KODARA KUNG-FU: DOBLE FORJA (RUST TOKIO NATIVO)
// "Your Code. Your AI. Your Rules."
// Motor de ultra-baja latencia con Tokio, Semaphore y timeouts
// para suites EDR como SamuLibre y herramientas estilo Kali Linux.
// ═══════════════════════════════════════════════════════════════

use std::net::SocketAddr;
use std::sync::Arc;
use std::time::Duration;
use tokio::net::TcpStream;
use tokio::sync::Semaphore;
use tokio::time::timeout;

pub struct TokioPortScanner {
    semaphore: Arc<Semaphore>,
    timeout_duration: Duration,
}

#[derive(Debug, Clone)]
pub struct PortAuditSummary {
    pub target: String,
    pub open_ports: Vec<u16>,
    pub elapsed_ms: u64,
}

impl TokioPortScanner {
    pub fn new(max_concurrency: usize, timeout_ms: u64) -> Self {
        Self {
            semaphore: Arc::new(Semaphore::new(max_concurrency)),
            timeout_duration: Duration::from_millis(timeout_ms),
        }
    }

    /// Comprueba de forma asíncrona si un SocketAddr acepta el Three-Way Handshake TCP
    pub async fn probe_port(&self, addr: SocketAddr) -> bool {
        // 1. Adquisición de permiso de semáforo para no exceder ulimit -n (Errno 24)
        let _permit = self.semaphore.acquire().await.unwrap();

        // 2. Conexión no bloqueante con timeout estricto
        match timeout(self.timeout_duration, TcpStream::connect(&addr)).await {
            Ok(Ok(_stream)) => true, // SYN/ACK recibido: Puerto Abierto
            _ => false,               // RST recibido o Timeout (DROP/Firewall): Puerto Cerrado
        }
    }
}

#[tokio::main]
async fn main() {
    let scanner = TokioPortScanner::new(50, 400);
    let ports = vec![22, 80, 443, 3777, 8080, 11434, 18888];
    println!("=== KODARA TOKIO PORT SCANNER (RUST NATIVE) ===");
    println!("Objetivo: 127.0.0.1 • Semáforo: 50 descriptores concurrentes");

    let mut tasks = Vec::new();
    for port in ports {
        let addr: SocketAddr = format!("127.0.0.1:{}", port).parse().unwrap();
        let scanner_ref = TokioPortScanner {
            semaphore: scanner.semaphore.clone(),
            timeout_duration: scanner.timeout_duration,
        };
        tasks.push(tokio::spawn(async move {
            let is_open = scanner_ref.probe_port(addr).await;
            (port, is_open)
        }));
    }

    let mut open_count = 0;
    for task in tasks {
        if let Ok((port, is_open)) = task.await {
            if is_open {
                println!("  [+] Puerto {}/tcp ABIERTO", port);
                open_count += 1;
            }
        }
    }
    println!("Total puertos abiertos detectados: {}", open_count);
}
