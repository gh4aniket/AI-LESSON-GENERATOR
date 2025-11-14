import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import { compileTSXInSandbox } from "@/lib/esbuildSandbox";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);
const ai = new GoogleGenAI({});

export async function POST(req: Request) {
  const { id, outline } = await req.json();

  // Update status
  await supabase.from("lessons").update({ status: "generating" }).eq("id", id);

  const prompt = `
 Generate a complete React TSX component for this lesson outline:
      "${outline}"

      Requirements:
      - Must include "export default" for a React component.
      - Must not include markdown, no backticks.
      - Return ONLY valid TSX code.
`;

  const completion = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  const code = completion?.candidates[0].content.parts[0].text || "// generation failed";
console.log(code);
  const sandboxResult = await compileTSXInSandbox(code);

 if (!sandboxResult.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: "Lesson TSX failed to compile in sandbox.",
          details: sandboxResult.error,
          raw: code,
        },
        { status: 422 }
      );
    }

  await supabase
    .from("lessons")
    .update({ generated_code: code, status: "generated" })
    .eq("id", id);

  return NextResponse.json({ success: code});
}
