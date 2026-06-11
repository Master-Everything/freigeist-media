import { useState, useMemo } from "react";
import { User, Calendar, Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import CategoryPill from "@/components/CategoryPill";
import ImageLightbox from "@/components/ImageLightbox";
import { getEmbedUrl } from "@/lib/videoUtils";
import { toAbsoluteUrl, resolveContentUrls } from "@/lib/imageUrl";
import DOMPurify from "dompurify";

interface PostPreviewProps {
  title: string;
  subtitle: string;
  content: string;
  image_url: string;
  video_url: string;
  author_name: string;
  author_role: string;
  reading_time: number;
  published_at?: Date;
  category_name?: string;
  category_color?: string;
}

const PostPreview = ({
  title,
  subtitle,
  content,
  image_url,
  video_url,
  author_name,
  author_role,
  reading_time,
  published_at,
  category_name,
  category_color,
}: PostPreviewProps) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const displayDate = published_at || new Date();

  const images = useMemo(() => {
    const list: string[] = [];
    const resolved = toAbsoluteUrl(image_url);
    if (resolved) list.push(resolved);
    if (content) {
      const resolvedContent = resolveContentUrls(content);
      const parser = new DOMParser();
      const doc = parser.parseFromString(resolvedContent, "text/html");
      doc.querySelectorAll("img").forEach((img) => {
        if (img.src && !list.includes(img.src)) list.push(img.src);
      });
    }
    return list;
  }, [image_url, content]);

  const openLightbox = (src: string) => {
    const idx = images.indexOf(src);
    setLightboxIndex(idx >= 0 ? idx : null);
  };

  return (
    <ScrollArea className="h-[calc(100vh-12rem)]">
      <article className="max-w-[820px] mx-auto px-6 pt-10 pb-20 bg-card rounded-lg border border-border">
        <CategoryPill name={category_name} color={category_color} />

        <h1 className="font-heading text-[clamp(2rem,5vw,2.9rem)] font-[800] text-foreground leading-[1.18] tracking-[-0.02em] mt-4">
          {title || "Untitled Post"}
        </h1>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-ui text-[0.84rem] text-muted-foreground mt-6 pb-6 border-b border-border">
          {author_name && (
            <span className="inline-flex items-center gap-1.5">
              <User size={14} className="text-primary" />
              <span className="font-semibold text-foreground">{author_name}</span>
              {author_role && <span className="text-muted-foreground">— {author_role}</span>}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Calendar size={14} />
            {displayDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock size={14} />
            {reading_time} min read
          </span>
        </div>

        {video_url && getEmbedUrl(video_url) && (
          <div className="mt-8 w-full aspect-video rounded-lg overflow-hidden border border-border">
            <iframe
              src={getEmbedUrl(video_url)!}
              className="w-full h-full"
              allowFullScreen
              sandbox="allow-scripts allow-same-origin allow-presentation"
            />
          </div>
        )}

        {image_url && (
          <div className="mt-8 rounded-lg overflow-hidden bg-muted cursor-pointer" onClick={() => openLightbox(toAbsoluteUrl(image_url))}>
            <img src={toAbsoluteUrl(image_url)} alt={title} className="w-full h-auto object-cover" />
          </div>
        )}

        {subtitle && (
          <div className="mt-8 mb-10 border-l-4 border-primary pl-5">
            <p className="font-body text-[1.15rem] leading-[1.7] italic text-muted-foreground">
              {subtitle}
            </p>
          </div>
        )}

        <div
          className="article-body"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(resolveContentUrls(content), {
            FORBID_TAGS: ["script", "style", "object", "embed", "form"],
            FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus", "onblur"],
            ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
            ADD_TAGS: ["iframe"],
            ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling", "sandbox"],
          }) }}
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.tagName === "IMG") {
              openLightbox((target as HTMLImageElement).src);
            }
          }}
        />
      </article>
      <ImageLightbox
        images={images}
        currentIndex={lightboxIndex ?? 0}
        isOpen={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </ScrollArea>
  );
};

export default PostPreview;
