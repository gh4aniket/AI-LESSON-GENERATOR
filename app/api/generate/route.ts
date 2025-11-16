import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import { compileTSXInSandbox } from "@/lib/esbuildSandbox";
import { compileTsx } from "@/sandbox/compileTSX";

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

      example component:
      import React from 'react';

const HowToCookFishLesson = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-5xl font-extrabold text-center text-indigo-800 mb-12 drop-shadow-md">
        Mastering the Art of Cooking Fish 🐟
      </h1>

      <div className="container mx-auto max-w-4xl">

        {/* Introduction */}
        <div className="bg-blue-100 rounded-xl shadow-lg p-6 mb-8 border border-blue-200 transition-all duration-300 hover:shadow-xl">
          <h2 className="text-3xl font-semibold mb-5 border-b-2 pb-3 border-blue-500 text-blue-800">
            1. Introduction: Dive into Deliciousness! 🌊
          </h2>
          <p className="text-gray-700 leading-relaxed text-lg mb-4">
            Cooking fish can seem daunting, but it's one of the most rewarding culinary experiences! Fish is
            not only <span className="text-blue-600 font-bold bg-blue-50 px-2 rounded">delicious</span>, but also
            packed with <span className="text-green-600 font-bold bg-green-50 px-2 rounded">nutrients</span>
            like Omega-3 fatty acids, making it a fantastic choice for a healthy meal. This lesson will guide you through
            the essential steps, techniques, and tips to ensure your fish is always cooked to perfection –
            flaky, moist, and full of flavor. Get ready to transform your kitchen into a seafood sanctuary!
          </p>
          <p className="text-gray-700 leading-relaxed text-lg mb-4 italic">
            "The key to great fish is often simplicity and a good understanding of temperature."
          </p>
        </div>

        {/* Choosing Your Fish */}
        <div className="bg-green-100 rounded-xl shadow-lg p-6 mb-8 border border-green-200 transition-all duration-300 hover:shadow-xl">
          <h2 className="text-3xl font-semibold mb-5 border-b-2 pb-3 border-green-500 text-green-800">
            2. Choosing the Right Fish: Freshness First! ✨
          </h2>
          <p className="text-gray-700 leading-relaxed text-lg mb-4">
            The foundation of a great fish dish is <span className="text-purple-600 font-bold bg-purple-50 px-2 rounded">fresh, high-quality fish</span>.
            Knowing how to select it is crucial.
          </p>
          <h3 className="text-xl font-semibold mb-2 text-green-700">What to Look For:</h3>
          <ul className="pl-8 text-gray-500 leading-relaxed list-disc">
            <li className="bg-gray-50 rounded-md p-2 mb-2">
              <span className="font-bold text-gray-800">Smell:</span> It should smell like the ocean – clean and fresh,
              not overly fishy or ammonia-like.
            </li>
            <li className="bg-gray-100 rounded-md p-2 mb-2">
              <span className="font-bold text-gray-800">Eyes:</span> For whole fish, eyes should be clear, bright,
              and bulging slightly, not cloudy or sunken.
            </li>
            <li className="bg-gray-50 rounded-md p-2 mb-2">
              <span className="font-bold text-gray-800">Gills:</span> Should be bright red or pink, not brown or slimy.
            </li>
            <li className="bg-gray-100 rounded-md p-2 mb-2">
              <span className="font-bold text-gray-800">Flesh:</span> Should be firm and spring back when gently pressed.
              Avoid fish with dull, soft, or mushy flesh.
            </li>
            <li className="bg-gray-50 rounded-md p-2 mb-2">
              <span className="font-bold text-gray-800">Skin/Scales:</span> Should be shiny and moist, with scales adhering tightly.
            </li>
          </ul>
          <p className="text-gray-700 leading-relaxed text-lg mt-4 mb-4">
            Consider the <span className="text-blue-600 font-bold bg-blue-50 px-2 rounded">type of fish</span> based on your cooking method.
            Delicate fish like sole or cod are great for pan-frying or steaming, while
            sturdier fish like salmon or tuna can handle grilling or roasting.
          </p>
        </div>

        {/* Preparation */}
        <div className="bg-purple-100 rounded-xl shadow-lg p-6 mb-8 border border-purple-200 transition-all duration-300 hover:shadow-xl">
          <h2 className="text-3xl font-semibold mb-5 border-b-2 pb-3 border-purple-500 text-purple-800">
            3. Preparation: Setting the Stage 🔪
          </h2>
          <p className="text-gray-700 leading-relaxed text-lg mb-4">
            Proper preparation ensures even cooking and optimal flavor.
          </p>
          <h3 className="text-xl font-semibold mb-2 text-purple-700">Key Preparation Steps:</h3>
          <ul className="pl-8 text-gray-500 leading-relaxed list-decimal">
            <li className="bg-gray-50 rounded-md p-2 mb-2">
              <span className="font-bold text-gray-800">Rinse and Pat Dry:</span> Gently rinse fish under cold water and
              then <span className="text-green-600 font-bold bg-green-50 px-2 rounded">thoroughly pat it dry</span> with paper towels.
              Moisture on the surface can prevent a good sear and crispy skin.
            </li>
            <li className="bg-gray-100 rounded-md p-2 mb-2">
              <span className="font-bold text-gray-800">Seasoning:</span> Season generously with salt and pepper just before cooking.
              You can also add other herbs and spices like dill, parsley, paprika, or garlic powder.
              A squeeze of lemon juice is almost always a good idea! 🍋
            </li>
            <li className="bg-gray-50 rounded-md p-2 mb-2">
              <span className="font-bold text-gray-800">Skin Scoring (Optional):</span> For fish with skin (like salmon),
              scoring the skin lightly with a sharp knife can prevent curling and help it crisp up beautifully.
            </li>
            <li className="bg-gray-100 rounded-md p-2 mb-2">
              <span className="font-bold text-gray-800">Bring to Room Temperature (Slightly):</span> Let the fish sit out
              for about 10-15 minutes before cooking. This helps it cook more evenly.
            </li>
          </ul>
        </div>

        {/* Cooking Methods */}
        <div className="bg-orange-100 rounded-xl shadow-lg p-6 mb-8 border border-orange-200 transition-all duration-300 hover:shadow-xl">
          <h2 className="text-3xl font-semibold mb-5 border-b-2 pb-3 border-orange-500 text-orange-800">
            4. Popular Cooking Methods: From Pan to Oven 🔥
          </h2>
          <p className="text-gray-700 leading-relaxed text-lg mb-4">
            There are many ways to cook fish, each bringing out different textures and flavors.
            Here are some of the most popular and effective methods:
          </p>

          <h3 className="text-2xl font-semibold mb-3 border-b-2 pb-2 border-orange-400 text-orange-700">
            Pan-Searing 🍳 (Recommended for fillets with skin)
          </h3>
          <p className="text-gray-700 leading-relaxed text-lg mb-4">
            This method creates a beautiful, crispy skin and a tender, flaky interior.
          </p>
          <ul className="pl-8 text-gray-500 leading-relaxed list-disc">
            <li className="bg-gray-50 rounded-md p-2 mb-2">
              Heat a non-stick or cast-iron skillet over <span className="font-bold text-gray-800">medium-high heat</span>.
              Add a high smoke-point oil (like grapeseed or avocado oil) and a knob of butter.
            </li>
            <li className="bg-gray-100 rounded-md p-2 mb-2">
              Once shimmering, place fish <span className="font-bold text-gray-800">skin-side down</span> (if applicable).
              Press gently for the first 30 seconds to ensure full contact with the pan.
            </li>
            <li className="bg-gray-50 rounded-md p-2 mb-2">
              Cook for 3-5 minutes, depending on thickness, until the skin is crispy and golden,
              and the flesh has cooked about 2/3 of the way up.
            </li>
            <li className="bg-gray-100 rounded-md p-2 mb-2">
              Flip and cook for another 1-3 minutes until opaque and flaky.
              Baste with pan drippings if desired.
            </li>
          </ul>

          <h3 className="text-2xl font-semibold mb-3 mt-6 border-b-2 pb-2 border-orange-400 text-orange-700">
            Baking/Roasting ♨️ (Great for whole fish or thicker fillets)
          </h3>
          <p className="text-gray-700 leading-relaxed text-lg mb-4">
            A hands-off method that's perfect for larger pieces or when cooking for a crowd.
          </p>
          <ul className="pl-8 text-gray-500 leading-relaxed list-disc">
            <li className="bg-gray-50 rounded-md p-2 mb-2">
              Preheat oven to <span className="font-bold text-gray-800">400°F (200°C)</span>.
              Line a baking sheet with parchment paper or foil.
            </li>
            <li className="bg-gray-100 rounded-md p-2 mb-2">
              Place seasoned fish on the baking sheet. You can add lemon slices, herbs, or vegetables around it.
            </li>
            <li className="bg-gray-50 rounded-md p-2 mb-2">
              Bake for 10-15 minutes per inch of thickness, or until the internal temperature reaches 145°F (63°C).
            </li>
          </ul>

          <h3 className="text-2xl font-semibold mb-3 mt-6 border-b-2 pb-2 border-orange-400 text-orange-700">
            Grilling 🔥 (Adds a smoky flavor)
          </h3>
          <p className="text-gray-700 leading-relaxed text-lg mb-4">
            Ideal for sturdier fish like salmon, tuna, swordfish, or mahi-mahi.
          </p>
          <ul className="pl-8 text-gray-500 leading-relaxed list-disc">
            <li className="bg-gray-50 rounded-md p-2 mb-2">
              Preheat grill to <span className="font-bold text-gray-800">medium-high heat</span>.
              Clean and oil the grates well to prevent sticking.
            </li>
            <li className="bg-gray-100 rounded-md p-2 mb-2">
              Brush fish with oil and season.
            </li>
            <li className="bg-gray-50 rounded-md p-2 mb-2">
              Grill 3-5 minutes per side, depending on thickness, until grill marks appear and fish is cooked through.
            ...
      
      Requirements:
      - Must include "export default" for a React component.
      -Must include "import React from 'react'".
      - Return ONLY valid TSX code,which is a proper and complete tsx component.
      -do not use fixed keywords like std,::,&lt etc.
      -use "" while generating any code explaning symbols like "{}","::",";" etc. inside tags like <p>,<h1>etc.
      -dont use {},$,: etc or any react code symbols inside any tag like <p>,<ul>,<pre>,etc.
      - Must not include markdown, no backticks.
            - the lesson must be discriptive and elaborated.
       - all the tags that are opened closed should be closed like <p>,<h1> etc.
       - make sure tags heirarchy is correct so that there is no error like "In HTML, <ul> cannot be a descendant of <p>.This will cause a hydration error.".
      - add any section into the lesson based on that topic-for example a lesson on disease like alzheimer's can include section like what, cause,symptoms,cure,etc.
      -can use some icons and emojis if valid.
      -Produce valid JSX that compiles under Next.js with Bun/esbuild.
      -Do not place JavaScript statements (const, let, await, fetch, functions) inside TSX elements.
      -Do not put raw “}” inside TSX. Use {'}'} only if absolutely necessary.
      -Do not insert comments inside TSX elements. Use // comments only inside TS, never inside returned TSX.
      -Do not insert “cleanup” or useEffect return functions inline inside TSX.
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
const code =
  completion?.candidates?.[0]?.content?.parts?.[0]?.text ?? "// generation failed";
   const compiled = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/compile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tsx: code }),
  })
  
  if(!compiled.ok)
  {
    await supabase
    .from("lessons")
    .update({ status: "failed"})
    .eq("id", id);
    return NextResponse.json({
      ok:false,
      error:compiled.error,
      status:422
    },{status:422});
  }

 
  await supabase
    .from("lessons")
    .update({ generated_code: code, status: "generated"})
    .eq("id", id);

  return NextResponse.json({ success: code});
}
