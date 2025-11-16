// sandbox/compileTsx.ts
import * as esbuild from "esbuild";
import vm from "vm";

export interface CompileResult {
  ok: boolean;
  js?: string;
  error?: string;
}

/**
 * Compiles TSX using esbuild and then runs inside a VM sandbox.
 */
export async function compileTsx(tsxSource: string): Promise<CompileResult> {
  try {
    const result = await esbuild.build({
      stdin: {
        contents: tsxSource,
        loader: "tsx",
        sourcefile: "lesson.tsx",
      },
      write: false,
      bundle: true,
      platform: "browser",
      format: "cjs",
      target: "es2020",
      external: ["react", "react-dom"],
    });

    if (!result.outputFiles?.length) {
      return { ok: false, error: "Esbuild produced no output" };
    }

    const js = result.outputFiles[0].text;

    // --- Create a restricted sandbox ---
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

    // --- Execute compiled JS ---
    const script = new vm.Script(js, { filename: "compiled.js" });
    script.runInContext(context);

    const exported = sandbox.module.exports;

    if (!exported?.default) {
      return { ok: false, error: "No default export found in compiled TSX" };
    }

    return { ok: true, js };
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) };
  }
}
