import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { FileText } from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import CategoryPill from "@/components/CategoryPill";
import { useSearchPosts } from "@/hooks/useSearchPosts";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SearchDialog = ({ open, onOpenChange }: SearchDialogProps) => {
  const [query, setQuery] = useState("");
  const { data: results, isLoading } = useSearchPosts(query);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const handleSelect = (slug: string) => {
    onOpenChange(false);
    navigate(`/news/${slug}`);
  };

  const dateLocale = i18n.language === "de" ? "de-DE" : "en-GB";

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder={t("search.placeholder")}
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {query.trim().length < 2 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            {t("search.minChars")}
          </div>
        ) : isLoading ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            {t("search.searching")}
          </div>
        ) : (
          <>
            <CommandEmpty>{t("search.noResults")}</CommandEmpty>
            <CommandGroup heading={t("search.articles")}>
              {results?.map((post) => (
                <CommandItem
                  key={post.id}
                  value={post.title}
                  onSelect={() => handleSelect(post.slug)}
                  className="cursor-pointer"
                >
                  <FileText className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="truncate font-medium">{post.title}</span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {post.categories && (
                        <CategoryPill
                          name={post.categories.name}
                          color={post.categories.color}
                          size="sm"
                        />
                      )}
                      {post.published_at && (
                        <span>
                          {new Date(post.published_at).toLocaleDateString(dateLocale, {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
};

export default SearchDialog;
