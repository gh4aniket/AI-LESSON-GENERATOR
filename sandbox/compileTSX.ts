// sandbox/compileTsx.ts
import * as babel from "@babel/core";
import vm from "vm";

// ... (other imports and interfaces)

export async function compileTsx(tsxSource: string): Promise<CompileResult> {
    try {
        // --- 1. Transpile TSX to JS using Babel ---
        const result = await babel.transformAsync(tsxSource, {
            filename: "lesson.tsx", 
            presets: [
                // Presets can usually be left as strings
                "@babel/preset-react",
                "@babel/preset-typescript", 
            ],
            plugins: [
                // CRITICAL CHANGE: Use require.resolve() to give Babel the absolute path
                [require.resolve("@babel/plugin-transform-modules-commonjs")], 
            ],
            targets: "node 18", 
            configFile: false,
        });

        const js = result?.code;

        if (!js) {
            return { ok: false, error: "Babel produced no output" };
        }

        // ... (rest of the VM code remains the same)

        return { ok: true, js };
    } catch (err: any) {
        // ... (error handling remains the same)
        const errorMessage = err?.message?.replace(/ \(.*:\d+:\d+\)$/, '') || String(err);
        return { ok: false, error: `Babel error: ${errorMessage}` };
    }
}
