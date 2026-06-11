import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const ReadingProgress = () => {
  const [progress, setProgress] = useState(0);
  const location = useLocation();

  const isArticle = location.pathname.match(/^\/news\/[^/]+$/);

  useEffect(() => {
    if (!isArticle) return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setProgress(Math.min((scrollTop / docHeight) * 100, 100));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isArticle, location.pathname]);

  if (!isArticle) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-[3px] z-[999]">
      <div
        className="h-full transition-[width] duration-100"
        style={{
          width: `${progress}%`,
          background: "linear-gradient(90deg, hsl(var(--brand)) 0%, hsl(var(--accent)) 100%)",
        }}
      />
    </div>
  );
};

export default ReadingProgress;
