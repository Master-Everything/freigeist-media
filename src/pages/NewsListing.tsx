import { useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryPill from "@/components/CategoryPill";
import ArticleThumbnail from "@/components/ArticleThumbnail";
import { useInfinitePosts } from "@/hooks/useInfinitePosts";
import { useCategories } from "@/hooks/useCategories";
import { useTranslation } from "react-i18next";

import { Skeleton } from "@/components/ui/skeleton";
import { toAbsoluteUrl } from "@/lib/imageUrl";
import { getYouTubeThumbnail } from "@/lib/videoUtils";

/* ── Skeleton for a single tile ── */
const TileSkeleton = () => (
  <div className="flex flex-col">
    <Skeleton className="w-full aspect-[4/3] rounded-md mb-3" />
    <Skeleton className="h-3 w-24 mb-2" />
    <Skeleton className="h-5 w-3/4 mb-1" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-2/3 mt-1" />
  </div>
);

const NewsListing = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("kategorie") || "";
  const sentinelRef = useRef<HTMLDivElement>(null);
  

  const { data: categories } = useCategories();
  const {
    posts,
    totalLoaded,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfinitePosts(activeCategory || undefined);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const setCategory = (slug: string) => {
    const params = new URLSearchParams();
    if (slug) params.set("kategorie", slug);
    setSearchParams(params);
  };

  const activeCat = activeCategory
    ? categories?.find((c) => c.slug === activeCategory)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* ── Page header ── */}
      <section className="pt-16 pb-10 text-center">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-foreground">
            {(() => {
              const title = t("newsListing.title");
              const idx = title.indexOf("&");
              if (idx === -1) return title;
              return (
                <>
                  {title.slice(0, idx)}
                  <span className="text-primary">&</span>
                  {title.slice(idx + 1)}
                </>
              );
            })()}
          </h1>
          <p className="mt-3 text-muted-foreground font-body text-lg max-w-xl mx-auto">
            {t("newsListing.subtitle")}
          </p>
        </section>

      {/* ── Category filter pills (sticky) ── */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl">
          <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-1.5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                <button
                  onClick={() => setCategory("")}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full font-ui text-[0.78rem] uppercase font-medium border transition-colors ${
                    !activeCategory
                      ? "bg-primary/10 border-primary text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  All
                </button>
                {categories?.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => setCategory(cat.slug)}
                    className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-ui text-[0.78rem] uppercase font-medium border transition-colors ${
                      activeCategory === cat.slug
                        ? "border-current"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                    style={
                      activeCategory === cat.slug
                        ? { backgroundColor: `${cat.color}15`, borderColor: cat.color, color: cat.color }
                        : {}
                    }
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    {cat.name}
                  </button>
                ))}
              </div>
              <span className="flex-shrink-0 font-ui text-xs text-muted-foreground whitespace-nowrap">
                {totalLoaded} Article{totalLoaded !== 1 ? "s" : ""}
                {activeCat ? ` · ${activeCat.name}` : ""}
              </span>
            </div>
          </div>
        </div>

      {/* ── Tile grid ── */}
      <main className="max-w-[1600px] mx-auto px-6 lg:px-12 py-10 pb-24">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <TileSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            {posts.length === 0 && (
              <p className="text-center text-muted-foreground py-16 font-ui">
                No articles found.
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
              {posts.map((article) => {
                const cat = categories?.find((c) => c.slug === article.category_slug);
                const displayImage =
                  (article.image_url ? toAbsoluteUrl(article.image_url) : null) ||
                  ((article as any).video_url ? getYouTubeThumbnail((article as any).video_url) : null);
                const dateStr = new Date(article.published_at || "").toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });

                return (
                  <Link
                    key={article.id}
                    to={`/news/${article.slug}`}
                    className="group flex flex-col"
                  >
                    {/* Image */}
                    <div className="relative overflow-hidden rounded-md aspect-[16/9] mb-3 bg-muted">
                      {displayImage ? (
                        <img
                          src={displayImage}
                          alt=""
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : cat?.icon ? (
                        <ArticleThumbnail
                          categoryIcon={cat.icon}
                          categoryColor={cat.color}
                          className="w-full h-full"
                        />
                      ) : null}
                    </div>

                    {/* Meta */}
                    <div className="font-ui text-[0.65rem] uppercase tracking-wider text-muted-foreground mb-1.5">
                      {cat?.name && (
                        <>
                          <span style={{ color: cat.color }}>{cat.name}</span>
                          <span className="mx-1.5">—</span>
                        </>
                      )}
                      <span>{dateStr}</span>
                    </div>

                    {/* Title */}
                    <h3 className="font-heading text-[1.05rem] font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>

                    {/* Excerpt */}
                    {article.subtitle && (
                      <p className="font-body text-[0.88rem] text-muted-foreground mt-1.5 line-clamp-2">
                        {article.subtitle}
                      </p>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Loading more */}
            {isFetchingNextPage && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
                {Array.from({ length: 3 }).map((_, i) => (
                  <TileSkeleton key={i} />
                ))}
              </div>
            )}

            {/* End */}
            {!hasNextPage && posts.length > 0 && (
              <p className="text-center text-muted-foreground/60 font-ui text-xs py-10">
                You've reached the end
              </p>
            )}
          </>
        )}

        <div ref={sentinelRef} className="h-1" />
      </main>

      <Footer />
    </div>
  );
};

export default NewsListing;
