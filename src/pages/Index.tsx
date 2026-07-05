import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { getIconByName } from "@/lib/icons";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { de as deLocale, enUS as enLocale } from "date-fns/locale";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ArticleThumbnail from "@/components/ArticleThumbnail";
import { usePosts } from "@/hooks/usePosts";
import { useCategories } from "@/hooks/useCategories";
import { useAuthorLookup } from "@/hooks/useAuthorLookup";
import { getYouTubeThumbnail } from "@/lib/videoUtils";
import { toAbsoluteUrl } from "@/lib/imageUrl";

const Index = () => {
  const { t, i18n } = useTranslation();
  const { data: posts, isLoading: postsLoading } = usePosts();
  const { data: categories, isLoading: catsLoading } = useCategories();

  const hero = posts?.find((p) => p.featured) || posts?.[0];
  const secondaryPosts = posts?.filter((p) => p.id !== hero?.id).slice(0, 3) || [];
  const heroAuthorIds = useMemo(() => hero?.created_by ? [hero.created_by] : [], [hero?.created_by]);
  const { data: authorMap } = useAuthorLookup(heroAuthorIds);

  if (postsLoading || catsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">Loading…</p>
        </div>
        <Footer />
      </div>
    );
  }

  // Group remaining posts by category
  const heroAndSecondaryIds = new Set([hero?.id, ...secondaryPosts.map((p) => p.id)]);
  const remainingPosts = posts?.filter((p) => !heroAndSecondaryIds.has(p.id)) || [];

  const postsByCategory: Record<string, typeof remainingPosts> = {};
  for (const post of remainingPosts) {
    const slug = post.category_slug || "_uncategorized";
    if (!postsByCategory[slug]) postsByCategory[slug] = [];
    if (postsByCategory[slug].length < 4) postsByCategory[slug].push(post);
  }

  // Sort categories by article count (most active first)
  const sortedCategorySlugs = Object.keys(postsByCategory).sort(
    (a, b) => postsByCategory[b].length - postsByCategory[a].length
  );

  const categoryCounts = posts?.reduce((acc, post) => {
    if (post.category_slug) acc[post.category_slug] = (acc[post.category_slug] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const showcaseCategories = categories || [];

  if (!hero) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-24 text-center">
          <p className="font-heading text-2xl font-bold text-foreground">No articles published yet.</p>
          <p className="font-ui text-muted-foreground mt-2">Check back soon for updates.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const getImage = (post: typeof hero) =>
    toAbsoluteUrl(post?.image_url) || (post?.video_url ? getYouTubeThumbnail(post.video_url) : null);

  const heroCat = categories?.find((c) => c.slug === hero.category_slug);
  const heroImage = getImage(hero);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* ── Editorial Masthead ── */}
      {(() => {
        const locale = i18n.language?.startsWith("de") ? deLocale : enLocale;
        const dateStr = format(new Date(), "EEE, dd MMM yyyy", { locale }).toUpperCase();
        const topCats = Object.entries(categoryCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([slug]) => categories?.find((c) => c.slug === slug))
          .filter(Boolean) as NonNullable<typeof categories>;
        return (
          <section className="max-w-[1600px] mx-auto px-6 lg:px-12 pt-10 md:pt-14 pb-6 md:pb-10">
            <header className="w-full border-b border-foreground/80 pb-6 md:pb-10 animate-in fade-in duration-700">
              {/* Wordmark */}
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h1 className="font-heading text-[14vw] md:text-[11vw] lg:text-[160px] leading-[0.85] font-bold tracking-tighter text-foreground uppercase flex flex-col">
                  <span className="block">{t("home.masthead.line1")}</span>
                  <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-4 md:gap-10">
                    <span className="block">
                      MEDIA{" "}
                      <span aria-hidden="true" className="text-primary">
                        &amp;
                      </span>{" "}
                      TV
                    </span>
                    <span className="font-ui text-sm md:text-base font-normal tracking-normal normal-case max-w-sm md:max-w-md md:mb-3 lg:mb-6 text-muted-foreground leading-snug">
                      {t("home.masthead.descriptor")}
                    </span>
                  </div>
                </h1>
              </div>

              {/* Bottom meta row */}
              <div className="mt-8 md:mt-14 flex flex-wrap gap-4 justify-between items-center border-t border-foreground/10 pt-4">
                <nav className="flex flex-wrap gap-6 md:gap-8 font-ui text-[10px] md:text-xs tracking-[0.25em] uppercase font-bold">
                  {topCats.map((cat) => (
                    <Link
                      key={cat.slug}
                      to={`/news?kategorie=${cat.slug}`}
                      className="text-foreground hover:opacity-60 transition-opacity"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </nav>
                <div className="font-ui text-[10px] md:text-xs tracking-[0.25em] uppercase font-bold text-muted-foreground">
                  {dateStr}
                </div>
              </div>
            </header>
          </section>
        );
      })()}

      {/* ── Hero Section ── */}
      <section className="max-w-[1600px] mx-auto px-6 lg:px-12 pt-4 md:pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 lg:gap-8">
          {/* Main hero */}
          <Link
            to={`/news/${hero.slug}`}
            className="group lg:col-span-3 flex flex-col"
          >
            <div className="relative overflow-hidden rounded-xl aspect-[16/9] bg-muted">
              {heroImage ? (
                <img
                  src={heroImage}
                  alt={hero.title}
                  className="absolute inset-0 w-full h-full object-contain transition-transform duration-700 group-hover:scale-[1.02]"
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))`,
                  }}
                >
                  {heroCat?.icon && (() => {
                    const Icon = getIconByName(heroCat.icon);
                    return <Icon size={140} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary-foreground/10" strokeWidth={1} />;
                  })()}
                </div>
              )}
            </div>
            <div className="pt-5">
              {heroCat && (
                <span
                  className="inline-flex items-center gap-1.5 font-ui text-[0.7rem] font-semibold uppercase tracking-wide rounded-full px-2.5 py-1 w-fit mb-3"
                  style={{ backgroundColor: `${heroCat.color}18`, color: heroCat.color }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: heroCat.color }} />
                  {heroCat.name}
                </span>
              )}
              <h2 className="font-heading text-[clamp(1.5rem,3.2vw,2.4rem)] font-[800] text-foreground leading-[1.15] group-hover:text-primary transition-colors">
                {hero.title}
              </h2>
              {hero.subtitle && (
                <p className="font-body text-muted-foreground text-[1rem] mt-2 line-clamp-2 max-w-2xl">
                  {hero.subtitle}
                </p>
              )}
              <div className="font-ui text-[0.78rem] text-muted-foreground flex items-center gap-2 mt-3">
                <span className="font-semibold text-foreground">{(hero.created_by && authorMap?.[hero.created_by]?.displayName) || "Unknown"}</span>
                <span>·</span>
                <span>{new Date(hero.published_at || "").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                <span>·</span>
                <span>{hero.reading_time} min read</span>
              </div>
            </div>
          </Link>

          {/* Secondary stories */}
          <div className="lg:col-span-2 flex flex-row lg:flex-col gap-4 lg:gap-6 overflow-x-auto lg:overflow-x-visible scrollbar-hide">
            {secondaryPosts.map((post) => {
              const cat = categories?.find((c) => c.slug === post.category_slug);
              const img = getImage(post);
              return (
                <Link
                  key={post.id}
                  to={`/news/${post.slug}`}
                  className="group flex-shrink-0 w-[280px] lg:w-auto flex flex-col lg:flex-1"
                >
                  <div className="relative overflow-hidden rounded-lg aspect-[16/9] bg-muted">
                    {img ? (
                      <img
                        src={img}
                        alt={post.title}
                        className="absolute inset-0 w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div
                        className="absolute inset-0"
                        style={{ backgroundColor: cat?.color ? `${cat.color}20` : "hsl(var(--muted))" }}
                      />
                    )}
                  </div>
                  <div className="pt-3">
                    {cat && (
                      <span
                        className="font-ui text-[0.7rem] font-semibold uppercase tracking-wide mb-1 inline-block"
                        style={{ color: cat.color }}
                      >
                        {cat.name}
                      </span>
                    )}
                    <h3 className="font-heading text-[1.05rem] font-bold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Category pill bar (sticky) ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-1.5">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <Link
              to="/news"
              className="flex-shrink-0 px-3 py-1.5 rounded-full font-ui text-[0.78rem] uppercase font-medium border border-border text-muted-foreground hover:border-primary/50 transition-colors"
            >
              All
            </Link>
            {showcaseCategories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/news?kategorie=${cat.slug}`}
                className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-ui text-[0.78rem] uppercase font-medium border border-border text-muted-foreground hover:border-primary/50 transition-colors"
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                {cat.name}
                {categoryCounts[cat.slug] > 0 && (
                  <span className="text-[0.65rem] font-bold opacity-80 ml-1">{categoryCounts[cat.slug]}</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Category Sections ── */}
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-10 pb-24 space-y-12">
        {sortedCategorySlugs.map((slug) => {
          const cat = categories?.find((c) => c.slug === slug);
          const sectionPosts = postsByCategory[slug];
          if (!sectionPosts?.length) return null;

          return (
            <section key={slug} className="border-t border-border pt-8">
              {/* Section header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  {cat?.color && (
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  )}
                  <h2 className="font-heading text-lg font-bold text-foreground">
                    {cat?.name || "Uncategorized"}
                  </h2>
                </div>
                {cat && (
                  <Link
                    to={`/news?kategorie=${cat.slug}`}
                    className="font-ui text-[0.78rem] font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    See all <ArrowRight size={13} />
                  </Link>
                )}
              </div>

              {/* Cards grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
                {sectionPosts.map((article) => {
                  const articleCat = categories?.find((c) => c.slug === article.category_slug);
                  const articleImage = getImage(article);

                  return (
                    <Link
                      key={article.id}
                      to={`/news/${article.slug}`}
                      className="group flex flex-col"
                    >
                      <div className="relative overflow-hidden rounded-lg aspect-[16/9] mb-3 bg-muted">
                        {articleImage ? (
                          <img
                            src={articleImage}
                            alt={article.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : articleCat?.icon ? (
                          <ArticleThumbnail
                            categoryIcon={articleCat.icon}
                            categoryColor={articleCat.color}
                            className="w-full h-full"
                          />
                        ) : null}
                      </div>

                      <div className="font-ui text-[0.62rem] uppercase tracking-wider text-muted-foreground mb-1.5">
                        <span>{new Date(article.published_at || "").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                      </div>

                      <h3 className="font-heading text-[1.05rem] font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                        {article.title}
                      </h3>

                      {article.subtitle && (
                        <p className="font-body text-[0.85rem] text-muted-foreground mt-1.5 line-clamp-2">
                          {article.subtitle}
                        </p>
                      )}
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* All News CTA */}
        <div className="flex justify-center pt-4">
          <Link
            to="/news"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md border border-primary/30 bg-card font-ui text-sm font-semibold text-primary hover:bg-primary/10 transition-all"
          >
            All News <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Index;
