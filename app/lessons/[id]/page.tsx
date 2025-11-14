"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useParams } from "next/navigation";
import CountingNumbers from "./ai-code";

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
      const cleaned = data.generated_code?data.generated_code
  .replace(/^```(?:tsx)?\s*\n/, "") 
  .replace(/```$/, ""):""; 
data.generated_code=cleaned;
      setLesson(data);
      console.log(lesson);
    }
    load();
  }, [id]);

  if (!lesson) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Lesson View</h1>
      {lesson.generated_code ? (
       "dvdsvds"
      ) : (
        <p>Status: {lesson.status}</p>
      )}
      
     <p>outline: {lesson.outline}</p>
    <p>data:{lesson.generated_code?lesson.generated_code:"no"}</p>
     <CountingNumbers/>
    </div>
  );
}
