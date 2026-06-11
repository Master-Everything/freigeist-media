import { useEffect, useRef, useState, useCallback } from "react";
import { Dialog, DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageLightboxProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

const ImageLightbox = ({ images, currentIndex, isOpen, onClose, onNavigate }: ImageLightboxProps) => {
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  const lastDistance = useRef(0);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const translateStart = useRef({ x: 0, y: 0 });
  const lastTap = useRef(0);
  const swipeStartX = useRef(0);
  const swipeDeltaX = useRef(0);

  const src = images[currentIndex] ?? null;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;
  const multiImage = images.length > 1;

  const reset = useCallback(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    reset();
  }, [currentIndex, reset]);

  // Keyboard navigation
  useEffect(() => {
    if (!src) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && hasPrev) onNavigate(currentIndex - 1);
      if (e.key === "ArrowRight" && hasNext) onNavigate(currentIndex + 1);
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [src, currentIndex, hasPrev, hasNext, onNavigate, onClose]);

  const clampScale = (s: number) => Math.min(Math.max(s, 1), 5);

  const getDistance = (t1: React.Touch, t2: React.Touch) =>
    Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      lastDistance.current = getDistance(e.touches[0], e.touches[1]);
    } else if (e.touches.length === 1) {
      const now = Date.now();
      if (now - lastTap.current < 300) {
        e.preventDefault();
        reset();
        lastTap.current = 0;
        return;
      }
      lastTap.current = now;

      if (scale > 1) {
        isDragging.current = true;
        dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        translateStart.current = { ...translate };
      } else {
        // Track for swipe
        swipeStartX.current = e.touches[0].clientX;
        swipeDeltaX.current = 0;
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = getDistance(e.touches[0], e.touches[1]);
      if (lastDistance.current > 0) {
        const delta = (dist - lastDistance.current) * 0.01;
        setScale((s) => clampScale(s + delta));
      }
      lastDistance.current = dist;
    } else if (e.touches.length === 1) {
      if (isDragging.current && scale > 1) {
        const dx = e.touches[0].clientX - dragStart.current.x;
        const dy = e.touches[0].clientY - dragStart.current.y;
        setTranslate({ x: translateStart.current.x + dx, y: translateStart.current.y + dy });
      } else if (scale <= 1) {
        swipeDeltaX.current = e.touches[0].clientX - swipeStartX.current;
      }
    }
  };

  const handleTouchEnd = () => {
    lastDistance.current = 0;
    isDragging.current = false;

    if (scale <= 1 && Math.abs(swipeDeltaX.current) > 50) {
      if (swipeDeltaX.current > 0 && hasPrev) onNavigate(currentIndex - 1);
      if (swipeDeltaX.current < 0 && hasNext) onNavigate(currentIndex + 1);
    }
    swipeDeltaX.current = 0;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    setScale((s) => {
      const next = clampScale(s + delta);
      if (next === 1) setTranslate({ x: 0, y: 0 });
      return next;
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      e.preventDefault();
      isDragging.current = true;
      dragStart.current = { x: e.clientX, y: e.clientY };
      translateStart.current = { ...translate };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setTranslate({ x: translateStart.current.x + dx, y: translateStart.current.y + dy });
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleOverlayClick = () => {
    if (scale <= 1) onClose();
  };

  return (
    <Dialog open={isOpen && !!src} onOpenChange={(open) => !open && onClose()}>
      <DialogPortal>
        <DialogOverlay className="bg-black/90" />
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ touchAction: "none", cursor: scale > 1 ? "grab" : "zoom-out" }}
          onClick={handleOverlayClick}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Close */}
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-50"
          >
            <X size={28} />
          </button>

          {/* Prev */}
          {multiImage && hasPrev && (
            <button
              onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex - 1); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-50 text-white/60 hover:text-white transition-colors bg-black/30 hover:bg-black/50 rounded-full p-2"
            >
              <ChevronLeft size={28} />
            </button>
          )}

          {/* Next */}
          {multiImage && hasNext && (
            <button
              onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex + 1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-50 text-white/60 hover:text-white transition-colors bg-black/30 hover:bg-black/50 rounded-full p-2"
            >
              <ChevronRight size={28} />
            </button>
          )}

          {/* Counter */}
          {multiImage && (
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 text-white/70 text-sm font-ui bg-black/40 px-3 py-1 rounded-full">
              {currentIndex + 1} / {images.length}
            </span>
          )}

          {src && (
            <img
              src={src}
              alt=""
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl select-none"
              draggable={false}
              style={{
                transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`,
                transition: isDragging.current ? "none" : "transform 0.15s ease-out",
              }}
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      </DialogPortal>
    </Dialog>
  );
};

export default ImageLightbox;
