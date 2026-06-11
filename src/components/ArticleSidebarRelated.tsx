import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ArticleThumbnail from "@/components/ArticleThumbnail";
import CategoryPill from "@/components/CategoryPill";

interface RelatedPost {
  id: string;
  slug: string;
  title: string;
  published_at: string | null;
  image_url?: string | null;
  video_url?: string | null;
  categories?: {
    name: string;
    color: string;
    icon: string;
    slug: string;
  } | null;
}

interface ArticleSidebarRelatedProps {
  posts: RelatedPost[];
  title?: string;
}

const ArticleSidebarRelated = ({ posts, title = "Popular Posts" }: ArticleSidebarRelatedProps) => {
  const { i18n } = useTranslation();

  if (!posts || posts.length === 0) return null;

  return (
    <div>
      <h3 className="font-ui text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-4">
        {title}
      </h3>
      <div className="flex flex-col gap-4">
        {posts.map((post) => (
          <Link
            key={post.id}
            to={`/news/${post.slug}`}
            className="group flex gap-3 items-start"
          >
            <ArticleThumbnail
              categoryIcon={post.categories?.icon}
              categoryColor={post.categories?.color}
              imageUrl={post.image_url}
              videoUrl={post.video_url}
              className="w-16 h-16 flex-shrink-0 rounded-md"
            />
            <div className="flex-1 min-w-0">
              <CategoryPill
                name={post.categories?.name}
                color={post.categories?.color}
                size="sm"
              />
              <h4 className="font-body text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mt-1">
                {post.title}
              </h4>
              <p className="font-ui text-xs text-muted-foreground mt-1">
                {new Date(post.published_at || "").toLocaleDateString(
                  i18n.language === "de" ? "de-DE" : "en-GB",
                  { day: "numeric", month: "short", year: "numeric" }
                )}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ArticleSidebarRelated;
