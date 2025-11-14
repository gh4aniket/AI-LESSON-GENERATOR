// lib/esbuildWorker.ts
import { parentPort, workerData } from "worker_threads";
import * as esbuild from "esbuild";
import vm from "vm";

interface WorkerInput {
  tsxSource: string;
}

interface WorkerResult {
  ok: boolean;
  js?: string;
  error?: string;
}

async function compile(tsxSource: string): Promise<WorkerResult> {
  try {
    /**
     * 1) Compile TSX → JS using esbuild
     */
    const result = await esbuild.build({
      stdin: {
        contents: tsxSource,
        loader: "tsx",
        resolveDir: process.cwd(),
        sourcefile: "lesson.tsx",
      },
      bundle: true,
      platform: "node",
      format: "cjs",
      write: false,
      external: ["react"],
    });

    if (!result.outputFiles || result.outputFiles.length === 0) {
      return { ok: false, error: "Esbuild produced no output" };
    }

    const js = result.outputFiles[0].text;

    /**
     * 2) Create a secure VM sandbox
     */
    const sandbox: any = {
      module: { exports: {} },
      exports: {},
      require: (name: string) => {
        if (name === "react") {
          return {
            createElement: () => ({}),
            Component: function () {},
          };
        }
        throw new Error(`Blocked module: ${name}`);
      },
      console: {
        log: () => {},
        error: () => {},
        warn: () => {},
      },
    };

    const context = vm.createContext(sandbox);

    /**
     * 3) Execute compiled JS in VM sandbox
     */
    const script = new vm.Script(js, {
      filename: "lesson.compiled.js",
      displayErrors: true,
    });

    script.runInContext(context);

    /**
     * 4) Validate default export exists
     */
    const exported = sandbox.module.exports;

    if (!exported || !exported.default) {
      return { ok: false, error: "No default export found in compiled TSX" };
    }

    /**
     * 5) Return success with compiled JS
     */
    return { ok: true, js };
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) };
  }
}

/**
 * Worker entry point
 */
(async () => {
  const { tsxSource } = workerData as WorkerInput;
  const result = await compile(tsxSource);
  parentPort?.postMessage(result);
})();
