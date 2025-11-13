"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default function HomePage() {
  const [outline, setOutline] = useState("");
  const [lessons, setLessons] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
     async function fetchLessons() {
    const { data } = await supabase.from("lessons").select("*").order("created_at", { ascending: false });
    setLessons(data || []);
  }
fetchLessons();
  }, []);

 

  async function handleGenerate() {
    const { data } = await supabase.from("lessons").insert([{ outline }]).select().single();
    await fetch("/api/generate", {
      method: "POST",
      body: JSON.stringify({ id: data.id, outline }),
    });
    setOutline("");
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">AI Lesson Generator</h1>
      <textarea
        className="w-full border p-2 rounded mb-2"
        placeholder="Enter lesson outline..."
        value={outline}
        onChange={(e) => setOutline(e.target.value)}
      />
      <button onClick={handleGenerate} className="bg-blue-500 text-white px-4 py-2 rounded">
        Generate
      </button>

      <table className="w-full mt-6 border">
        <thead>
          <tr><th>Title</th><th>Status</th></tr>
        </thead>
        <tbody>
          {lessons.map((l) => (
            <tr key={l.id} onClick={() => router.push(`/lessons/${l.id}`)} className="cursor-pointer hover:bg-gray-100">
              <td>{l.outline.slice(0, 40)}</td>
              <td>{l.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
