"use client";

import React, { useState, useEffect } from "react";
import * as Babel from "@babel/standalone";

export default function DynamicRenderer({ code }: { code: string }) {
  const [RenderedComponent, setRenderedComponent] = useState<any>(null);

  useEffect(() => {
    try {
      // Compile JSX/TSX → plain JS
      const compiled = Babel.transform(code, {
        presets: ["react", "typescript"],
        plugins: ["transform-modules-commonjs"],
        filename: "dynamic-component.tsx",
      }).code;

      // Create a module-like wrapper so we can read module.exports.default
      const module: any = { exports: {} };

      const requireShim = (name: string) => {
        if (name === "react") return React;
        throw new Error(`Unknown import: ${name}`);
      };

      // Execute compiled code
      const func = new Function("module", "exports", "require", compiled);
      func(module, module.exports, requireShim);

      // Get the default export
      const Component = module.exports.default;

      if (Component) {
        setRenderedComponent(() => Component);
      }
    } catch (err) {
      console.error("Error evaluating component:", err);
    }
  }, [code]);

  if (!RenderedComponent) return <p>Loading...</p>;
  return <RenderedComponent />;
}
