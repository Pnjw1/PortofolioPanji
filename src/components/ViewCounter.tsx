"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Eye } from "lucide-react";

export default function ViewCounter({ slug }: { slug: string }) {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    // Jalankan increment saat komponen dipasang
    const incrementAndFetch = async () => {
      // Panggil fungsi RPC untuk increment
      await supabase.rpc("increment_post_views", { post_slug: slug });

      // Ambil data view terbaru
      const { data } = await supabase
        .from("portfolio_posts")
        .select("views")
        .eq("slug", slug)
        .single();

      if (data) {
        setViews(data.views);
      }
    };

    incrementAndFetch();
  }, [slug]);

  if (views === null) {
    return (
      <div className="flex items-center gap-1.5 animate-pulse">
        <Eye size={14} />
        <span>...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <Eye size={14} />
      <span>{views} views</span>
    </div>
  );
}
