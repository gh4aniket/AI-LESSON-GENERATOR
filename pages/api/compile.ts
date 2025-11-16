import * as esbuild from "esbuild";
import vm from "vm";
import { NextApiRequest, NextApiResponse } from "next";

// 1. MUST use a default export
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 2. Handle HTTP methods manually
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // 3. Use the Pages Router pre-parsed body object
    const { tsx } = req.body;

    if (!tsx || typeof tsx !== "string") {
      return res.status(400).json({ ok: false, error: "Missing or invalid TSX input" });
    }

    // --- Compilation Logic Remains the Same ---
    const result = await esbuild.build({
      stdin: {
        contents: tsx,
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

    const js = result.outputFiles?.[0]?.text;
    if (!js) {
      return res.status(500).json({ ok: false, error: "Esbuild produced no output" });
    }

    // Sandbox test (vm is fine as Pages Router uses Node.js runtime)
    const sandbox: any = {
      module: { exports: {} },
      exports: {},
      require: () => ({}), // block imports
      console: {
        log: () => {},
        error: () => {},
        warn: () => {},
      },
    };

    const context = vm.createContext(sandbox);
    const script = new vm.Script(js);
    script.runInContext(context);
    // -------------------------------------------

    // 4. Use the Pages Router res object for the final response
    return res.status(200).json({
      ok: true,
      compiled: js,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return res.status(400).json({ ok: false, error: message });
  }
}
