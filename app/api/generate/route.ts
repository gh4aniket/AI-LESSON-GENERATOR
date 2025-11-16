import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import * as esbuild from "esbuild";
import vm from "vm";

// ------------------------------
// SUPABASE
// ------------------------------
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

// ------------------------------
// AI
// ------------------------------
const ai = new GoogleGenAI({});

// ------------------------------
// BUILT-IN SANDBOX COMPILER
// ------------------------------
async function compileTSXInSandbox(tsxSource: string) {
  try {
    const result = await esbuild.build({
      stdin: {
        contents: tsxSource,
        loader: "tsx",
        resolveDir: process.cwd(),
        sourcefile: "lesson.tsx",
      },
      write: false,
      bundle: false,
      platform: "browser",
      format: "cjs",
      target: "es2020",
      resolveExtensions: [],
      external: ["react", "react-dom"],
    });

    if (!result.outputFiles?.length) {
      return { ok: false, error: "Esbuild produced no output" };
    }

    const js = result.outputFiles[0].text;

    // ------------------------------
    // RUN COMPILED JS IN A SANDBOX
    // ------------------------------
    const sandbox: any = {
      module: { exports: {} },
      exports: {},
      require: (name: string) => {
        if (name === "react") {
          return {
            createElement() { return {}; },
            Component() {}
          };
        }
        throw new Error(`Blocked module import: ${name}`);
      },
      console: { log() {}, warn() {}, error() {} },
    };

    const context = vm.createContext(sandbox);

    const script = new vm.Script(js, {
      filename: "compiled.js",
    });

    script.runInContext(context);

    const exported = sandbox.module.exports;

    if (!exported || !exported.default) {
      return { ok: false, error: "Compiled code must export a default component" };
    }

    return { ok: true, js };
  } catch (err: any) {
    return { ok: false, error: err.message || String(err) };
  }
}

// ------------------------------
// MAIN ROUTE
// ------------------------------
export async function POST(req: Request) {
  const { id, outline } = await req.json();

  await supabase.from("lessons").update({ status: "generating" }).eq("id", id);

  // ------------------------------
  // PROMPT
  // ------------------------------
  const prompt = `YOUR SAME PROMPT HERE...`;

  const completion = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const code =
    completion?.candidates?.[0]?.content?.parts?.[0]?.text ??
    "// generation failed";

  // ------------------------------
  // COMPILE TSX INTO JS + RUN IN SANDBOX
  // ------------------------------
  const compiled = await compileTSXInSandbox(code);

  if (!compiled.ok) {
    await supabase
      .from("lessons")
      .update({ status: "failed" })
      .eq("id", id);

    return NextResponse.json(
      { ok: false, error: compiled.error },
      { status: 422 }
    );
  }

  // ------------------------------
  // SAVE TO SUPABASE
  // ------------------------------
  await supabase
    .from("lessons")
    .update({
      generated_code: code,
      compiled_js: compiled.js,
      status: "generated",
    })
    .eq("id", id);

  return NextResponse.json({ ok: true, code });
}
