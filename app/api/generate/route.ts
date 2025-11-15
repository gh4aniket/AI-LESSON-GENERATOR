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
  You are an expert lesson creator with complete knowledge of various topics.
  the lesson you create are detailed and descriptive, with various sections like description,title,content etc. based on that topic
 Generate a complete React TSX component for this lesson outline:
      "${outline}"

      Requirements:
      - Must include "export default" for a React component.
      -Must include "import React from 'react'".
      - Return ONLY valid TSX code,which is a proper and complete tsx component.
      -use "" while generating any code explaning symbols like "{}","::",";" etc. inside tags like <p>,<h1>etc.
      -dont use {},$,: etc or any react code symbols inside any tag like <p>,<ul>,<pre>,etc.
      - Must not include markdown, no backticks.
            - the lesson must be discriptive and elaborated.
       - all the tags that are opened closed should be closed like <p>,<h1> etc.
       - make sure tags heirarchy is correct so that there is no error like "In HTML, <ul> cannot be a descendant of <p>.This will cause a hydration error.".
      - add any section into the lesson based on that topic-for example a lesson on disease like alzheimer's can include section like what, cause,symptoms,cure,etc.
      -can use some icons and emojis if valid.
      -m
      -use tailwind css for styling
      - style the sections to have attracting UI, with border affects and colouring
      -Use divs containers with: bg-blue-100 rounded-xl shadow-lg p-6 mb-8 border transition-all duration-300 hover:shadow-xl.
      -Use varied pastel border colors per section (border-blue-200, border-green-200, border-purple-200, etc.).
      -Headings:
      -h1: text-4xl font-extrabold text-center mb-4 (color: indigo/blue).
      -h2: text-2xl font-semibold mb-3 border-b-2 pb-2 (section-themed color).
      -Paragraphs: text-gray-700 leading-relaxed text-lg mb-4; use subtle emphasis with italic, font-bold, and color spans.
      -Lists: pl-8 text-gray-500 leading-relaxed; list items use light alternating backgrounds (bg-gray-50/100) and rounded-md p-2 mb-2.
      -Spans for key terms: use bright thematic colors (text-blue-600 text-green-600 text-purple-600) and bg-*-50 px-2 rounded.
      -Code blocks: bg-gray-900 text-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto.
     `;

  const completion = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  const code = completion?.candidates[0].content.parts[0].text || "// generation failed";
  const sandboxResult = await compileTSXInSandbox(code);

 if (!sandboxResult.ok) {
   await supabase
    .from("lessons")
    .update({status: "failed"})
    .eq("id", id);
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
    .update({ generated_code: code, status: "generated" ,compiled_js: sandboxResult.js})
    .eq("id", id);

  return NextResponse.json({ success: code});
}
