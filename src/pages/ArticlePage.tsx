import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, User, Calendar, Clock, Share2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReadingProgress from "@/components/ReadingProgress";
import CategoryPill from "@/components/CategoryPill";
import ArticleThumbnail from "@/components/ArticleThumbnail";
import SocialShareButtons from "@/components/SocialShareButtons";
import ImageLightbox from "@/components/ImageLightbox";
import ArticleTableOfContents from "@/components/ArticleTableOfContents";
import ArticleSidebarRelated from "@/components/ArticleSidebarRelated";
import { usePost, useRelatedPosts } from "@/hooks/usePost";
import { usePosts } from "@/hooks/usePosts";
import { useAuthorLookup } from "@/hooks/useAuthorLookup";
import { getEmbedUrl } from "@/lib/videoUtils";
import { toAbsoluteUrl, resolveContentUrls } from "@/lib/imageUrl";
import { toast } from "sonner";
import { brand } from "@/config/brand";
import DOMPurify from "dompurify";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function extractAndInjectHeadings(html: string): { html: string; headings: { id: string; text: string }[] } {
  const headings: { id: string; text: string }[] = [];
  const processed = html.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/gi, (_match, attrs, inner) => {
    const text = inner.replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .trim();
    const id = slugify(text);
    headings.push({ id, text });
    return `<h2${attrs} id="${id}">${inner}</h2>`;
  });
  return { html: processed, headings };
}

const ArticlePage = () => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activeHeadingId, setActiveHeadingId] = useState("");
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data: article, isLoading } = usePost(id);
  const { data: allPosts } = usePosts();
  const { data: related } = useRelatedPosts(article?.category_slug || undefined, article?.id);
  const authorIds = useMemo(() => article?.created_by ? [article.created_by] : [], [article?.created_by]);
  const { data: authorMap } = useAuthorLookup(authorIds);
  const bodyRef = useRef<HTMLDivElement>(null);

  const newestPosts = useMemo(() => {
    if (!allPosts || !article) return [];
    return allPosts.filter((p) => p.id !== article.id).slice(0, 5);
  }, [allPosts, article]);

  // Process content: resolve URLs and inject heading IDs
  const { processedHtml, headings } = useMemo(() => {
    if (!article?.content) return { processedHtml: "", headings: [] };
    const resolved = resolveContentUrls(article.content);
    const sanitized = DOMPurify.sanitize(resolved, {
      FORBID_TAGS: ["script", "style", "object", "embed", "form"],
      FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus", "onblur"],
      ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
      ADD_TAGS: ["iframe"],
      ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling", "sandbox"],
    });
    const { html, headings } = extractAndInjectHeadings(sanitized);
    return { processedHtml: html, headings };
  }, [article?.content]);

  // IntersectionObserver for active heading tracking
  useEffect(() => {
    if (headings.length === 0 || !bodyRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveHeadingId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0.1 }
    );

    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[];

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  // Collect all images: featured + body images
  const images = useMemo(() => {
    if (!article) return [];
    const list: string[] = [];
    const featuredImg = toAbsoluteUrl((article as any).image_url);
    if (featuredImg) list.push(featuredImg);
    if (processedHtml) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(processedHtml, "text/html");
      doc.querySelectorAll("img").forEach((img) => {
        if (img.src && !list.includes(img.src)) list.push(img.src);
      });
    }
    return list;
  }, [article, processedHtml]);

  const openLightbox = (src: string) => {
    const idx = images.indexOf(src);
    setLightboxIndex(idx >= 0 ? idx : null);
  };

  if (isLoading) {
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

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-[944px] mx-auto px-6 py-20 text-center">
          <h1 className="font-heading text-3xl font-bold text-foreground">Article not found</h1>
          <Link to="/news" className="font-ui text-sm text-primary hover:underline mt-4 inline-block">
            ← {t("newsListing.backToNews")}
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const cat = article.categories;

  return (
    <div className="min-h-screen bg-background">
      <ReadingProgress />
      <Header />

      <div className="max-w-[1280px] mx-auto px-6 my-8 flex flex-col lg:flex-row gap-8">
        {/* Article column */}
        <article className="flex-1 min-w-0 max-w-[944px] px-6 pt-10 pb-20 bg-card rounded-lg border border-border">
          {/* Back */}
          <Link
            to="/news"
            className="inline-flex items-center gap-1.5 font-ui text-[0.85rem] text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft size={14} /> {t("newsListing.backToNews")}
          </Link>

          {/* Breadcrumb */}
          <nav className="font-ui text-[0.78rem] text-muted-foreground mb-6">
            <Link to="/news" className="hover:text-primary transition-colors">News</Link>
            <span className="mx-1.5">›</span>
            <Link to={`/news?kategorie=${article.category_slug}`} className="hover:text-primary transition-colors">
              {cat?.name}
            </Link>
            <span className="mx-1.5">›</span>
            <span className="text-foreground">{article.title.slice(0, 40)}…</span>
          </nav>

          {/* Header */}
          <CategoryPill name={cat?.name} color={cat?.color} />
          <h1 className="font-heading text-[clamp(2rem,5vw,2.9rem)] font-[800] text-foreground leading-[1.18] tracking-[-0.02em] mt-4">
            {article.title}
          </h1>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-ui text-[0.84rem] text-muted-foreground mt-6 pb-6 border-b border-border">
            <span className="inline-flex items-center gap-1.5">
              <User size={14} className="text-primary" />
              <span className="font-semibold text-foreground">
                {(article.created_by && authorMap?.[article.created_by]?.displayName) || "Unknown"}
              </span>
              {(() => {
                const role = article.created_by && authorMap?.[article.created_by]?.role;
                return role ? <span className="text-muted-foreground">— {role}</span> : null;
              })()}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={14} />
              {new Date(article.published_at || "").toLocaleDateString(i18n.language === "de" ? "de-DE" : "en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock size={14} />
              {t("article.minRead", { min: article.reading_time })}
            </span>
          </div>

          {/* Share */}
          <div className="flex items-center gap-4 mt-4">
            <button
              onClick={async () => {
                const shareUrl = `${brand.productionUrl}${window.location.pathname}`;
                const shareData = { title: article.title, url: shareUrl };
                if (navigator.share) {
                  try { await navigator.share(shareData); } catch {}
                } else {
                  await navigator.clipboard.writeText(shareUrl);
                  toast(t("article.linkCopied"));
                }
              }}
              className="inline-flex items-center gap-1.5 font-ui text-[0.84rem] text-muted-foreground hover:text-primary transition-colors"
            >
              <Share2 size={14} /> Share
            </button>
            <SocialShareButtons title={article.title} url={`${brand.productionUrl}${window.location.pathname}`} />
          </div>

          {/* Featured Video */}
          {(article as any).video_url && getEmbedUrl((article as any).video_url) && (
            <div className="mt-8 w-full aspect-video rounded-lg overflow-hidden border border-border">
              <iframe
                src={getEmbedUrl((article as any).video_url)!}
                className="w-full h-full"
                allowFullScreen
                sandbox="allow-scripts allow-same-origin allow-presentation"
              />
            </div>
          )}

          {/* Featured Image */}
          {(article as any).image_url && (
            <div className="mt-8 rounded-lg overflow-hidden bg-muted cursor-pointer aspect-[16/9]" onClick={() => openLightbox(toAbsoluteUrl((article as any).image_url))}>
              <img
                src={toAbsoluteUrl((article as any).image_url)}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Lead */}
          {article.subtitle && (
            <div className="mt-8 mb-10 border-l-4 border-primary pl-5">
              <p className="font-body text-[1.15rem] leading-[1.7] italic text-muted-foreground">
                {article.subtitle}
              </p>
            </div>
          )}

          {/* Body */}
          <div
            ref={bodyRef}
            className="article-body"
            lang={i18n.language === "de" ? "de" : "en"}
            dangerouslySetInnerHTML={{ __html: processedHtml }}
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (target.tagName === "IMG") {
                openLightbox((target as HTMLImageElement).src);
              }
            }}
          />

          {/* Related (mobile only) */}
          {related && related.length > 0 && (
            <div className="mt-14 pt-8 border-t border-border lg:hidden">
              <h2 className="font-ui text-xs uppercase tracking-[0.15em] text-muted-foreground mb-6">
                Related Articles
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {related.map((rel) => (
                  <Link
                    key={rel.id}
                    to={`/news/${rel.slug}`}
                    className="group flex sm:flex-col gap-3 items-start"
                  >
                    <ArticleThumbnail categoryIcon={rel.categories?.icon} categoryColor={rel.categories?.color} imageUrl={(rel as any).image_url} videoUrl={(rel as any).video_url} className="w-20 h-20 sm:w-full sm:h-32 flex-shrink-0" />
                    <div>
                      <h3 className="font-body text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {rel.title}
                      </h3>
                      <p className="font-ui text-xs text-muted-foreground mt-1">
                        {new Date(rel.published_at || "").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* Sidebar (desktop only) */}
        <aside className="hidden lg:block w-[280px] flex-shrink-0">
          <div className="sticky top-24 space-y-8">
            <ArticleTableOfContents headings={headings} activeId={activeHeadingId} />
            {related && related.length > 0 && (
              <ArticleSidebarRelated posts={related as any} />
            )}
            {newestPosts.length > 0 && (
              <ArticleSidebarRelated posts={newestPosts as any} title="New Posts" />
            )}
          </div>
        </aside>
      </div>

      <ImageLightbox
        images={images}
        currentIndex={lightboxIndex ?? 0}
        isOpen={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
      <Footer />
    </div>
  );
};

export default ArticlePage;
