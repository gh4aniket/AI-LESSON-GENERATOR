"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useParams } from "next/navigation";
import DynamicRenderer from "./ai-code";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default function LessonView() {
  const { id } = useParams<{ id: string }>();
  const [lesson, setLesson] = useState<any>(null);
  const[code,setcode]=useState<any>("");
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
    <div className="min-h-screen flex items-center justify-center mt-10">
  <div className="p-6 mb-50 w-[1000px]">
    <DynamicRenderer code={lesson.generated_code} />
  </div>
</div>

  );
}
