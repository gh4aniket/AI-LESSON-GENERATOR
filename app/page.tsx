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

  async function fetchLessons() {
    const { data } = await supabase
      .from("lessons")
      .select("*")
      .order("created_at", { ascending: false });

    setLessons(data || []);
  }

  // Initial fetch + Realtime listener
  useEffect(() => {
    fetchLessons();

  const channel = supabase
    .channel("lessons-realtime")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "lessons" },
      (payload) => {
       fetchLessons();
      }
    )
    .subscribe();


    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function handleGenerate() {
    const { data } = await supabase
      .from("lessons")
      .insert([{ outline }])
      .select()
      .single();

    await fetch("/api/generate", {
      method: "POST",
      body: JSON.stringify({ id: data.id, outline }),
    });

    setOutline("");
  }

  async function handleDelete(id: number,outline:string) {
  const deleted=await supabase.from("lessons").delete().eq("id", id).select().single();;
  setTimeout(()=>{alert(`deleted "${outline}"`)},1000)
}

 async function handleview(status:string,id:number) {
  
if(status=="generated")
{
  router.push(`/lessons/${id}`);
}
  else
  {
    alert("lesson is not generated!")
  }

}


  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-extrabold mb-4 text-blue-800 border-b-2 border-blue-300 pb-2">
        AI Lesson Generator
      </h1>

      <textarea
        className="w-full border border-blue-300 p-3 rounded-lg text-blue-900 bg-white transition-all duration-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300 shadow-sm"
        placeholder="Enter lesson outline..."
        value={outline}
        onChange={(e) => setOutline(e.target.value)}
      />

      <button
        onClick={handleGenerate}
        type="button"
        className="flex items-center gap-2.5 border border-gray-500/30 px-4 py-2 text-sm text-gray-800 rounded bg-white hover:text-cyan-500 hover:bg-cyan-500/10 hover:border-cyan-500/30 active:scale-95 transition"
      >
        GENERATE
      </button>

      <table className="w-full mt-6 border border-blue-200 rounded-lg overflow-hidden bg-blue-50 text-blue-900">
        <thead className="bg-blue-100 border-b border-blue-200">
          <tr>
            <th className="text-left px-6 py-3 border-r border-blue-200 w-1/2 font-serif text-lg text-blue-800">
              Title
            </th>
            <th className="text-left px-6 py-3 border-r border-blue-200 w-1/4 font-mono text-base text-blue-700">
              Status
            </th>
            <th className="text-left px-6 py-3 font-sans text-sm uppercase tracking-widest text-blue-600 w-full">
              ACTION
            </th>
          </tr>
        </thead>
        <tbody>
          {lessons.map((l, idx) => (
            <tr
              key={l.id}
              className={`${
                idx % 2 === 0 ? "bg-blue-50" : "bg-blue-100/70"
              } cursor-pointer transition-all duration-300 hover:bg-blue-200 hover:border-blue-400`}
            >
              <td className="px-6 py-4 border-t border-blue-200 border-r font-serif text-lg">
                {l.outline.slice(0, 40)}
              </td>
              <td className="px-6 py-4 border-t border-blue-200 border-r font-mono text-base">
                {l.status}
              </td>
              <td onClick={() => handleview(l.status,l.id)} className="px-6 py-4 border-t border-blue-200 font-sans text-sm uppercase tracking-wider">
               <pre>➡️[VIEW]</pre>
              </td>
              <td onClick={() => handleDelete(l.id,l.outline)} className="px-6 py-4 border-t border-blue-200 font-sans text-sm uppercase tracking-wider">
               <pre>⛔[DELETE]</pre>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
