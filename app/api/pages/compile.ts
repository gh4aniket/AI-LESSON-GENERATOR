// pages/api/compile.ts
import * as esbuild from "esbuild";
import vm from "vm";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(tsx:string) {
  try {
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

    const js = result.outputFiles[0].text;

    // sandbox test
    const sandbox: any = {
      module: { exports: {} },
      exports: {},
      require: () => ({}),
    };

    const context = vm.createContext(sandbox);
    const script = new vm.Script(js);
    script.runInContext(context);

    return res.status(200).json({
      ok: true,
      compiled: js,
    });
  } catch (err: any) {
    return res.status(400).json({
      ok: false,
      error: (err.message),
    });
  }
}
