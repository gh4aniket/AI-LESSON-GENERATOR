import { Worker } from "worker_threads";
import path from "path";

export function compileTSXInSandbox(tsxSource: string, timeoutMs = 8000) {
  return new Promise((resolve) => {
    const worker = new Worker(path.resolve("lib/esbuildWorker.js"), {
      workerData: { tsxSource },
    });

    const timer = setTimeout(() => {
      worker.terminate();
      resolve({ ok: false, error: "Timeout during TSX compile" });
    }, timeoutMs);

    worker.on("message", (msg) => {
      clearTimeout(timer);
      worker.terminate();
      resolve(msg);
    });

    worker.on("error", (err) => {
      clearTimeout(timer);
      worker.terminate();
      resolve({ ok: false, error: err.message });
    });
  });
}
