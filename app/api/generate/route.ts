import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

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
You are an expert lesson genera that outputs a single TypeScript React component.
Output ONLY code — no explanations.
The component should export default function Lesson(): JSX.Element.
Create a small educational lesson for this outline:
"${outline}"
`;

  const completion = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
console.log(completion);
  const code = completion?.candidates[0].content.parts[0].text || "// generation failed";

  await supabase
    .from("lessons")
    .update({ generated_code: code, status: "generated" })
    .eq("id", id);

  return NextResponse.json({ success: code});
}
