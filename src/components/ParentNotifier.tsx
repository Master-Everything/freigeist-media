import { useEffect } from "react";

const ParentNotifier = () => {
  useEffect(() => {
    if (window.self === window.top) return;

    // Skip in Lovable preview / development iframes
    try {
      const parentOrigin = document.referrer ? new URL(document.referrer).origin : "";
      if (
        parentOrigin.includes("lovable.app") ||
        parentOrigin.includes("lovable.dev") ||
        parentOrigin.includes("localhost")
      ) return;
    } catch {}

    const handler = (e: MouseEvent) => {
      let el = e.target as HTMLElement | null;
      while (el && el.tagName !== "A") el = el.parentElement;
      if (!el) return;
      const anchor = el as HTMLAnchorElement;
      if (!anchor.href?.includes("/news/")) return;
      e.preventDefault();
      window.parent.postMessage(
        {
          type: "avis-article-click",
          url: anchor.href,
          title: anchor.textContent?.trim() || "Article",
        },
        "*"
      );
    };

    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, []);

  return null;
};

export default ParentNotifier;
