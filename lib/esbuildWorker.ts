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
    // ✅ Use esbuild.transform (no binary → no Vercel crash)
    const result = await esbuild.transform(tsxSource, {
      loader: "tsx",
      format: "cjs",
      target: "es2020",
      jsx: "transform",
      jsxFactory: "React.createElement",
      jsxFragment: "React.Fragment",
      sourcemap: false,
      minify: false,
    });

    const js = result.code;

    // ✅ VM sandbox
    const sandbox: any = {
      module: { exports: {} },
      exports: {},
      require: (name: string) => {
        if (name === "react") {
          return {
            createElement: () => ({}),
            Component: function () {},
            Fragment: "fragment",
          };
        }
        throw new Error(`Blocked import: ${name}`);
      },
      console: {
        log: () => {},
        error: () => {},
        warn: () => {},
      },
    };

    const context = vm.createContext(sandbox);

    // Execute transformed JS
    const script = new vm.Script(js, {
      filename: "lesson.compiled.js",
      displayErrors: true,
    });

    script.runInContext(context);

    const exported = sandbox.module.exports;

    if (!exported || !exported.default) {
      return {
        ok: false,
        error: "No default export found in compiled TSX",
      };
    }

    return { ok: true, js };
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) };
  }
}

// Automatically run inside worker thread
(async () => {
  const { tsxSource } = workerData as WorkerInput;
  const result = await compile(tsxSource);
  parentPort?.postMessage(result);
})();
