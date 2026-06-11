import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

interface AuthorOption {
  id: string;
  display_name: string;
  role: string;
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  editor: "Editor",
  editorial_manager: "Editorial Manager",
};

interface AuthorSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (author: { id: string; display_name: string; role: string }) => void;
}

export default function AuthorSelectDialog({
  open,
  onOpenChange,
  onSelect,
}: AuthorSelectDialogProps) {
  const [search, setSearch] = useState("");

  const { data: authors = [], isLoading } = useQuery({
    queryKey: ["author-select-list"],
    queryFn: async (): Promise<AuthorOption[]> => {
      const [profilesRes, rolesRes] = await Promise.all([
        supabase.from("profiles").select("id, display_name"),
        supabase.from("user_roles").select("user_id, role"),
      ]);

      const profiles = profilesRes.data ?? [];
      const roles = rolesRes.data ?? [];

      return profiles.map((p) => {
        const roleRow = roles.find((r) => r.user_id === p.id);
        return {
          id: p.id,
          display_name: p.display_name,
          role: roleRow ? (ROLE_LABELS[roleRow.role] ?? roleRow.role) : "",
        };
      });
    },
    enabled: open,
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return authors;
    const q = search.toLowerCase();
    return authors.filter(
      (a) =>
        a.display_name.toLowerCase().includes(q) ||
        a.role.toLowerCase().includes(q),
    );
  }, [authors, search]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Autor auswählen</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Suchen…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="max-h-64 overflow-y-auto -mx-1">
          {isLoading && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Laden…
            </p>
          )}
          {!isLoading && filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Keine Ergebnisse
            </p>
          )}
          {filtered.map((author) => (
            <button
              key={author.id}
              type="button"
              className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md text-left text-sm hover:bg-accent transition-colors"
              onClick={() => {
                onSelect({
                  id: author.id,
                  display_name: author.display_name,
                  role: author.role,
                });
                onOpenChange(false);
                setSearch("");
              }}
            >
              <span className="font-medium">{author.display_name}</span>
              {author.role && (
                <Badge variant="secondary" className="text-xs shrink-0">
                  {author.role}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
