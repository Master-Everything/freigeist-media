import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const PAGE_SIZE = 20;

export function useInfinitePosts(categorySlug?: string) {
  const query = useInfiniteQuery({
    queryKey: ["infinite-posts", categorySlug || ""],
    queryFn: async ({ pageParam = 0 }) => {
      let q = supabase
        .from("posts")
        .select("*, categories(*)")
        .eq("status", "published")
        .is("deleted_at", null)
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .range(pageParam, pageParam + PAGE_SIZE - 1);

      if (categorySlug) {
        q = q.eq("category_slug", categorySlug);
      }

      const { data, error } = await q;
      if (error) throw error;
      return { data: data ?? [], nextOffset: pageParam + PAGE_SIZE };
    },
    getNextPageParam: (lastPage) =>
      lastPage.data.length < PAGE_SIZE ? undefined : lastPage.nextOffset,
    initialPageParam: 0,
  });

  const posts = query.data?.pages.flatMap((p) => p.data) ?? [];
  const totalLoaded = posts.length;

  return { ...query, posts, totalLoaded };
}
