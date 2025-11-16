import { NextResponse } from "next/server";
import * as esbuild from "esbuild";
import vm from "vm";

export async function POST(req: Request) {
  try {
    const { tsx } = await req.json();

    if (!tsx || typeof tsx !== "string") {
      return NextResponse.json(
        { ok: false, error: "Missing or invalid TSX input" },
        { status: 400 }
      );
    }

    // Compile using esbuild
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
      return NextResponse.json(
        { ok: false, error: "Esbuild produced no output" },
        { status: 500 }
      );
    }

    // Sandbox test
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

    return NextResponse.json({
      ok: true,
      compiled: js,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, error: message },
      { status: 400 }
    );
  }
}
