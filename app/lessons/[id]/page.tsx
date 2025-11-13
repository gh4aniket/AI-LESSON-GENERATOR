"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useParams } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default function LessonView() {
  const { id } = useParams();
  const [lesson, setLesson] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("lessons").select("*").eq("id", id).single();
      setLesson(data);
    }
    load();
  }, [id]);

  if (!lesson) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Lesson View</h1>
      {lesson.generated_code ? (
        <iframe
          srcDoc={`<html><body><script type="module">${lesson.generated_code}</script></body></html>`}
          className="w-full h-[600px] border rounded"
        />
      ) : (
        <p>Status: {lesson.status}</p>
      )}
    </div>
  );
}
