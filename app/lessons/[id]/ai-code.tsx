"use client";

import React, { useState, useEffect } from "react";
import * as Babel from "@babel/standalone";

export default function DynamicRenderer({ code }: { code: string }) {
  const [RenderedComponent, setRenderedComponent] = useState<any>(null);

  useEffect(() => {
    try {
      const compiled = Babel.transform(code, {
        presets: ["react", "typescript"],
        plugins: ["transform-modules-commonjs"],
        filename: "dynamic-component.tsx",
      }).code;

      const module: any = { exports: {} };

      const requireShim = (name: string) => {
        if (name === "react") return React;
        throw new Error(`Unknown import: ${name}`);
      };

      const func = new Function("module", "exports", "require", compiled);
      func(module, module.exports, requireShim);

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
