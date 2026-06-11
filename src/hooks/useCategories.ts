import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** Categories that have at least one published, non-deleted post */
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*, posts!inner(id)")
        .eq("posts.status", "published")
        .is("posts.deleted_at", null)
        .order("name");
      if (error) throw error;
      // Deduplicate and strip posts property
      const seen = new Set<number>();
      return (data ?? [])
        .filter((cat) => {
          if (seen.has(cat.id)) return false;
          seen.add(cat.id);
          return true;
        })
        .map(({ posts, ...cat }) => cat);
    },
  });
}

/** All categories (for admin forms) */
export function useAllCategories() {
  return useQuery({
    queryKey: ["all-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });
}
