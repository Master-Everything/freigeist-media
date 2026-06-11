import { List } from "lucide-react";

interface Heading {
  id: string;
  text: string;
}

interface ArticleTableOfContentsProps {
  headings: Heading[];
  activeId: string;
}

const ArticleTableOfContents = ({ headings, activeId }: ArticleTableOfContentsProps) => {
  if (headings.length === 0) return null;

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <List size={16} className="text-primary" />
        <h3 className="font-ui text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Table of Contents
        </h3>
      </div>
      <nav className="flex flex-col gap-1">
        {headings.map((h) => (
          <button
            key={h.id}
            onClick={() => handleClick(h.id)}
            className={`text-left text-[0.82rem] leading-snug py-1.5 px-3 rounded-md transition-colors border-l-2 ${
              activeId === h.id
                ? "border-primary text-primary font-medium bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            {h.text}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default ArticleTableOfContents;
