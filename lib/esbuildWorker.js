"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// lib/esbuildWorker.ts
var import_worker_threads = require("worker_threads");
var esbuild = __toESM(require("esbuild"));
var import_vm = __toESM(require("vm"));
async function compile(tsxSource) {
  try {
    const result = await esbuild.build({
      stdin: {
        contents: tsxSource,
        loader: "tsx",
        resolveDir: process.cwd(),
        sourcefile: "lesson.tsx"
      },
      bundle: true,
      platform: "node",
      format: "cjs",
      write: false,
      external: ["react"]
    });
    if (!result.outputFiles || result.outputFiles.length === 0) {
      return { ok: false, error: "Esbuild produced no output" };
    }
    const js = result.outputFiles[0].text;
    const sandbox = {
      module: { exports: {} },
      exports: {},
      require: (name) => {
        if (name === "react") {
          return {
            createElement: () => ({}),
            Component: function() {
            }
          };
        }
        throw new Error(`Blocked module: ${name}`);
      },
      console: {
        log: () => {
        },
        error: () => {
        },
        warn: () => {
        }
      }
    };
    const context = import_vm.default.createContext(sandbox);
    const script = new import_vm.default.Script(js, {
      filename: "lesson.compiled.js",
      displayErrors: true
    });
    script.runInContext(context);
    const exported = sandbox.module.exports;
    if (!exported || !exported.default) {
      return { ok: false, error: "No default export found in compiled TSX" };
    }
    return { ok: true, js };
  } catch (err) {
    return { ok: false, error: err?.message || String(err) };
  }
}
(async () => {
  const { tsxSource } = import_worker_threads.workerData;
  const result = await compile(tsxSource);
  import_worker_threads.parentPort?.postMessage(result);
})();
