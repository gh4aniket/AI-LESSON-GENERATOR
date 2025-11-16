import * as babel from "@babel/core"; // Import Babel core
import vm from "vm";

export interface CompileResult {
    ok: boolean;
    js?: string;
    error?: string;
}

/**
 * Compiles TSX using Babel and then runs inside a VM sandbox.
 */
export async function compileTsx(tsxSource: string): Promise<CompileResult> {
    try {
        // --- 1. Transpile TSX to JS using Babel ---
        const result = await babel.transformAsync(tsxSource, {
            // Treat the input as a file named lesson.tsx to activate the presets
            filename: "lesson.tsx", 
            // Use 'react' preset for JSX/TSX
            presets: [
                "@babel/preset-react",
                // Use 'typescript' preset for TS/TSX syntax removal
                "@babel/preset-typescript", 
            ],
            // Set the output module format to CommonJS (CJS) for Node.js/VM compatibility
            plugins: [
                // Transform import/export syntax to CommonJS (require/module.exports)
                ["@babel/plugin-transform-modules-commonjs"], 
            ],
            // Target a recent Node.js version, though the presets usually handle the syntax conversion
            targets: "node 18", 
            // Do not include React imports, assuming your source is clean
            // You can add plugins to replace imports later if needed for bundling/external
            configFile: false, // Ensure no external config is loaded
        });

        const js = result?.code;

        if (!js) {
            return { ok: false, error: "Babel produced no output" };
        }

        // --- 2. Create a restricted sandbox (Same as before) ---
        const sandbox: any = {
            module: { exports: {} },
            exports: {},
            // Mock external dependencies like 'react' and 'react-dom'
            require: (name: string) => { 
                if (name === "react" || name === "react-dom") {
                    // Return minimal object to satisfy requires in the compiled JS
                    return {
                        createElement: () => ({}),
                        Component: function () {},
                        useState: () => [null, () => {}],
                        // Add other required React exports if necessary
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

        // --- 3. Execute compiled JS ---
        const script = new vm.Script(js, { filename: "compiled.js" });
        script.runInContext(context);

        const exported = sandbox.module.exports;

        if (!exported?.default) {
            return { ok: false, error: "No default export found in compiled TSX" };
        }

        return { ok: true, js };
    } catch (err: any) {
        // Babel errors often include file paths; strip them for security/clarity
        const errorMessage = err?.message?.replace(/ \(.*:\d+:\d+\)$/, '') || String(err);
        return { ok: false, error: `Babel error: ${errorMessage}` };
    }
}
