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

    
    const script = new vm.Script(js, {
      filename: "lesson.compiled.js",
      displayErrors: true,
    });

    script.runInContext(context);

    
    const exported = sandbox.module.exports;

    if (!exported || !exported.default) {
      return { ok: false, error: "No default export found in compiled TSX" };
    }

    return { ok: true, js };
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) };
  }
}


(async () => {
  const { tsxSource } = workerData as WorkerInput;
  const result = await compile(tsxSource);
  parentPort?.postMessage(result);
})();
