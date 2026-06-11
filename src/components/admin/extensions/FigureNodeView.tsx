import React, { useCallback, useEffect, useRef, useState } from "react";
import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import { useTranslation } from "react-i18next";
import { toAbsoluteUrl } from "@/lib/imageUrl";
import { Trash2, ArrowUp, ArrowDown, AlignLeft, AlignCenter, AlignRight, WrapText, Square, Loader2 } from "lucide-react";
import { usePendingImage } from "../PendingImageContext";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "../webpConverter";

interface FigureNodeViewProps {
  node: any;
  deleteNode: () => void;
  editor: any;
  getPos: () => number;
  selected: boolean;
  updateAttributes: (attrs: Record<string, any>) => void;
}

const FigureNodeView: React.FC<FigureNodeViewProps> = ({
  node,
  deleteNode,
  editor,
  getPos,
  selected,
  updateAttributes,
}) => {
  const { t } = useTranslation();
  const pendingCtx = usePendingImage();
  const [showToolbar, setShowToolbar] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [resizing, setResizing] = useState(false);
  const [liveWidth, setLiveWidth] = useState<number>(node.attrs.dataWidth || 100);
  const resizeRef = useRef<{ startX: number; startWidth: number; side: string } | null>(null);

  const align = node.attrs.dataAlign || "center";
  const float = node.attrs.dataFloat || "none";
  const width = resizing ? liveWidth : (node.attrs.dataWidth || 100);
  const pending = node.attrs.dataPending;

  const handleImageClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowToolbar(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowToolbar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Resize logic
  const handleResizeStart = useCallback(
    (e: React.MouseEvent, side: string) => {
      e.preventDefault();
      e.stopPropagation();
      const currentWidth = node.attrs.dataWidth || 100;
      setLiveWidth(currentWidth);
      setResizing(true);
      resizeRef.current = { startX: e.clientX, startWidth: currentWidth, side };
    },
    [node.attrs.dataWidth]
  );

  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeRef.current || !wrapperRef.current) return;
      const parent = wrapperRef.current.parentElement;
      if (!parent) return;
      const parentWidth = parent.getBoundingClientRect().width;
      const deltaX = e.clientX - resizeRef.current.startX;
      const deltaPercent = (deltaX / parentWidth) * 100;

      let newWidth: number;
      if (resizeRef.current.side === "left") {
        newWidth = resizeRef.current.startWidth - deltaPercent;
      } else {
        newWidth = resizeRef.current.startWidth + deltaPercent;
      }
      newWidth = Math.round(Math.max(20, Math.min(100, newWidth)));
      setLiveWidth(newWidth);
    };

    const handleMouseUp = () => {
      setResizing(false);
      if (resizeRef.current) {
        updateAttributes({ dataWidth: liveWidth });
        resizeRef.current = null;
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizing, liveWidth, updateAttributes]);

  // Sync liveWidth when node attr changes externally
  useEffect(() => {
    if (!resizing) {
      setLiveWidth(node.attrs.dataWidth || 100);
    }
  }, [node.attrs.dataWidth, resizing]);

  const moveNode = useCallback(
    (direction: "up" | "down") => {
      const pos = getPos();
      const resolvedPos = editor.state.doc.resolve(pos);
      const nodeSize = node.nodeSize;

      if (direction === "up") {
        const before = resolvedPos.nodeBefore;
        if (!before) return;
        const startPos = pos - before.nodeSize;
        const endPos = pos + nodeSize;
        const { tr } = editor.state;
        tr.replaceWith(startPos, endPos, [node.copy(node.content), before]);
        editor.view.dispatch(tr);
      } else {
        const afterPos = pos + nodeSize;
        const $after = editor.state.doc.resolve(afterPos);
        const after = $after.nodeAfter;
        if (!after) return;
        const endPos = afterPos + after.nodeSize;
        const { tr } = editor.state;
        tr.replaceWith(pos, endPos, [after, node.copy(node.content)]);
        editor.view.dispatch(tr);
      }
    },
    [editor, getPos, node]
  );

  const setAlign = useCallback(
    (newAlign: "left" | "center" | "right") => {
      updateAttributes({ dataAlign: newAlign, dataFloat: "none" });
    },
    [updateAttributes]
  );

  const toggleFloat = useCallback(
    (side: "left" | "right") => {
      const isEnabling = float !== side;
      const newFloat = isEnabling ? side : "none";
      const attrs: Record<string, any> = { dataFloat: newFloat };

      if (isEnabling && (node.attrs.dataWidth || 100) >= 80) {
        attrs.dataWidth = 50;
      }
      if (!isEnabling) {
        attrs.dataWidth = 100;
      }
      updateAttributes(attrs);
    },
    [float, node.attrs.dataWidth, updateAttributes]
  );

  const figureClasses = [
    "figure-nodeview",
    showToolbar || selected ? "figure-selected" : "",
    pending ? "figure-pending" : "",
  ].filter(Boolean).join(" ");

  // Render pending UI (WebP convert or uploading spinner or conflict)
  const renderPendingUI = () => {
    if (!pending) return null;

    const pendingFile = pendingCtx?.getPendingFile(node.attrs.src);

    if (pending === "webp-convert") {
      return (
        <div className="flex flex-col items-center gap-3 p-4 bg-muted/50 rounded-md border border-border" contentEditable={false}>
          <p className="text-sm font-medium">{t("webp.convertTitle")}</p>
          {pendingFile && (
            <p className="text-xs text-muted-foreground">
              {pendingFile.name} ({formatFileSize(pendingFile.size)})
            </p>
          )}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onMouseDown={(e) => {
                e.preventDefault();
                pendingCtx?.onConvertDecision(node.attrs.src, "convert");
              }}
            >
              {t("webp.convertBtn")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onMouseDown={(e) => {
                e.preventDefault();
                pendingCtx?.onConvertDecision(node.attrs.src, "keep");
              }}
            >
              {t("webp.keepOriginal")}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onMouseDown={(e) => {
                e.preventDefault();
                deleteNode();
              }}
            >
              {t("common.cancel")}
            </Button>
          </div>
        </div>
      );
    }

    if (pending === "uploading") {
      return (
        <div className="flex items-center justify-center gap-2 p-6 bg-muted/50 rounded-md border border-border" contentEditable={false}>
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{t("webp.converting")}</span>
        </div>
      );
    }

    if (pending === "conflict") {
      const conflictInfo = pendingCtx?.getPendingConflict(node.attrs.src);
      if (!conflictInfo) return null;
      const newPreviewUrl = node.attrs.src; // blob URL of the pasted image
      return (
        <div className="flex flex-col gap-3 p-4 bg-muted/50 rounded-md border border-border" contentEditable={false}>
          <p className="text-sm font-medium">
            {t("conflict.alreadyExists", { name: conflictInfo.sanitizedName })}
          </p>
          <div className="grid grid-cols-2 gap-4">
            {/* Existing image */}
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs font-medium text-muted-foreground">{t("conflict.existingLabel", "Existing image")}</p>
              <img
                src={toAbsoluteUrl(conflictInfo.existingUrl)}
                alt=""
                className="w-full max-h-40 rounded border border-border object-contain bg-background"
              />
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onMouseDown={(e) => {
                  e.preventDefault();
                  pendingCtx?.onConflictResolved(node.attrs.src, "use-existing");
                }}
              >
                {t("conflict.useExisting")}
              </Button>
            </div>
            {/* New pasted image */}
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs font-medium text-muted-foreground">{t("conflict.newLabel", "New image")}</p>
              <img
                src={newPreviewUrl}
                alt=""
                className="w-full max-h-40 rounded border border-border object-contain bg-background"
              />
              <Button
                size="sm"
                className="w-full"
                onMouseDown={(e) => {
                  e.preventDefault();
                  pendingCtx?.onConflictResolved(node.attrs.src, "rename", conflictInfo.suggestedName);
                }}
              >
                {t("conflict.uploadNewName")} ({conflictInfo.suggestedName})
              </Button>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="self-end"
            onMouseDown={(e) => {
              e.preventDefault();
              pendingCtx?.onConflictCancel(node.attrs.src);
              deleteNode();
            }}
          >
            {t("common.cancel")}
          </Button>
        </div>
      );
    }

    return null;
  };

  return (
    <NodeViewWrapper
      as="figure"
      ref={wrapperRef}
      className={figureClasses}
      data-align={align}
      data-float={float}
      data-width={width}
      style={{ width: `${width}%` }}
      data-drag-handle
    >
      <div className="figure-image-wrapper" contentEditable={false}>
        {pending ? (
          renderPendingUI()
        ) : (
          <>
            <img
              src={node.attrs.src}
              alt={node.attrs.alt || ""}
              draggable={false}
              onClick={handleImageClick}
            />

            {/* Resize handles */}
            <div
              className="figure-resize-handle figure-resize-handle-left"
              onMouseDown={(e) => handleResizeStart(e, "left")}
            />
            <div
              className="figure-resize-handle figure-resize-handle-right"
              onMouseDown={(e) => handleResizeStart(e, "right")}
            />
            <div
              className="figure-resize-handle figure-resize-handle-corner"
              onMouseDown={(e) => handleResizeStart(e, "right")}
            />

            {/* Width badge while resizing */}
            {resizing && (
              <div className="figure-width-badge">{liveWidth}%</div>
            )}

            {showToolbar && (
              <div className="figure-toolbar">
                <div className="figure-toolbar-row">
                  <button
                    type="button"
                    title={t("figureToolbar.standard")}
                    className={align === "center" && float === "none" ? "figure-toolbar-active" : ""}
                    onMouseDown={(e) => { e.preventDefault(); updateAttributes({ dataAlign: "center", dataFloat: "none", dataWidth: 100 }); }}
                  >
                    <Square size={16} />
                  </button>
                  <span className="figure-toolbar-separator" />
                  <button
                    type="button"
                    title={t("figureToolbar.alignLeft")}
                    className={align === "left" && float === "none" ? "figure-toolbar-active" : ""}
                    onMouseDown={(e) => { e.preventDefault(); setAlign("left"); }}
                  >
                    <AlignLeft size={16} />
                  </button>
                  <button
                    type="button"
                    title={t("figureToolbar.center")}
                    className={align === "center" && float === "none" ? "figure-toolbar-active" : ""}
                    onMouseDown={(e) => { e.preventDefault(); setAlign("center"); }}
                  >
                    <AlignCenter size={16} />
                  </button>
                  <button
                    type="button"
                    title={t("figureToolbar.alignRight")}
                    className={align === "right" && float === "none" ? "figure-toolbar-active" : ""}
                    onMouseDown={(e) => { e.preventDefault(); setAlign("right"); }}
                  >
                    <AlignRight size={16} />
                  </button>
                  <span className="figure-toolbar-separator" />
                  <button
                    type="button"
                    title={t("figureToolbar.floatLeft")}
                    className={float === "left" ? "figure-toolbar-active" : ""}
                    onMouseDown={(e) => { e.preventDefault(); toggleFloat("left"); }}
                  >
                    <WrapText size={16} style={{ transform: "scaleX(-1)" }} />
                  </button>
                  <button
                    type="button"
                    title={t("figureToolbar.floatRight")}
                    className={float === "right" ? "figure-toolbar-active" : ""}
                    onMouseDown={(e) => { e.preventDefault(); toggleFloat("right"); }}
                  >
                    <WrapText size={16} />
                  </button>
                </div>
                <div className="figure-toolbar-row">
                  <button
                    type="button"
                    title={t("figureToolbar.moveUp")}
                    onMouseDown={(e) => { e.preventDefault(); moveNode("up"); }}
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    type="button"
                    title={t("figureToolbar.moveDown")}
                    onMouseDown={(e) => { e.preventDefault(); moveNode("down"); }}
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button
                    type="button"
                    title={t("figureToolbar.delete")}
                    className="figure-toolbar-delete"
                    onMouseDown={(e) => { e.preventDefault(); deleteNode(); }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <NodeViewContent as={"figcaption" as any} />
    </NodeViewWrapper>
  );
};

export default FigureNodeView;
