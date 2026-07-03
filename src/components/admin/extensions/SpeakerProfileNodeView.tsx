import React, { useState } from "react";
import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import { ImagePlus, Trash2, User } from "lucide-react";
import { toAbsoluteUrl } from "@/lib/imageUrl";
import ImageGalleryDialog from "../ImageGalleryDialog";

interface Props {
  node: any;
  updateAttributes: (attrs: Record<string, any>) => void;
  deleteNode: () => void;
}

const SpeakerProfileNodeView: React.FC<Props> = ({ node, updateAttributes, deleteNode }) => {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const src = node.attrs.imageSrc;

  return (
    <NodeViewWrapper
      as="aside"
      className="speaker-profile my-6 rounded-lg border border-border bg-muted/30 p-4"
      data-drag-handle
    >
      <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-4">
        <div contentEditable={false} className="relative group">
          {src ? (
            <img
              src={toAbsoluteUrl(src)}
              alt={node.attrs.imageAlt || ""}
              className="w-full aspect-square object-cover rounded-md"
            />
          ) : (
            <div className="w-full aspect-square flex items-center justify-center rounded-md bg-muted text-muted-foreground">
              <User size={32} />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 rounded-md transition-opacity gap-2">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setGalleryOpen(true);
              }}
              className="text-white hover:text-primary"
              title="Bild wählen"
            >
              <ImagePlus size={18} />
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                deleteNode();
              }}
              className="text-white hover:text-destructive"
              title="Speaker-Profil entfernen"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
        <NodeViewContent className="speaker-bio" />
      </div>
      <ImageGalleryDialog
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        onSelect={(url) => {
          updateAttributes({ imageSrc: url });
          setGalleryOpen(false);
        }}
      />
    </NodeViewWrapper>
  );
};

export default SpeakerProfileNodeView;
