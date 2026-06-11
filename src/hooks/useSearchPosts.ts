import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function useSearchPosts(query: string) {
  const debounced = useDebounce(query.trim(), 300);

  return useQuery({
    queryKey: ["search-posts", debounced],
    enabled: debounced.length >= 2,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("id, title, subtitle, slug, published_at, categories(*)")
        .eq("status", "published")
        .or(`title.ilike.%${debounced}%,subtitle.ilike.%${debounced}%`)
        .order("published_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });
}
