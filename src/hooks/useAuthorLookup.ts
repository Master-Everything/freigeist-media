import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AuthorInfo {
  displayName: string;
  role: string;
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  editor: "Editor",
  editorial_manager: "Editorial Manager",
};

export function useAuthorLookup(userIds: string[]) {
  const uniqueIds = [...new Set(userIds.filter(Boolean))];

  return useQuery({
    queryKey: ["author-lookup", uniqueIds.sort().join(",")],
    queryFn: async (): Promise<Record<string, AuthorInfo>> => {
      if (uniqueIds.length === 0) return {};

      const [profilesRes, rolesRes] = await Promise.all([
        supabase.from("profiles").select("id, display_name").in("id", uniqueIds),
        supabase.from("user_roles").select("user_id, role").in("user_id", uniqueIds),
      ]);

      const map: Record<string, AuthorInfo> = {};
      for (const id of uniqueIds) {
        const profile = profilesRes.data?.find((p) => p.id === id);
        const roleRow = rolesRes.data?.find((r) => r.user_id === id);
        map[id] = {
          displayName: profile?.display_name ?? "Unknown",
          role: roleRow ? (ROLE_LABELS[roleRow.role] ?? roleRow.role) : "",
        };
      }
      return map;
    },
    enabled: uniqueIds.length > 0,
  });
}
