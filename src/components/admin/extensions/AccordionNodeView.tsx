import React, { useState } from "react";
import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import { ChevronDown, Trash2, Plus } from "lucide-react";

interface Props {
  node: any;
  updateAttributes: (attrs: Record<string, any>) => void;
  deleteNode: () => void;
  editor: any;
}

const AccordionNodeView: React.FC<Props> = ({ node, updateAttributes, deleteNode, editor }) => {
  const [open, setOpen] = useState(true);
  const title = node.attrs.title || "";

  return (
    <NodeViewWrapper
      as="div"
      className="freigeist-accordion-item my-3 rounded-md border border-border bg-muted/40"
      data-drag-handle
    >
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            setOpen(!open);
          }}
          className="text-muted-foreground hover:text-foreground shrink-0"
          contentEditable={false}
        >
          <ChevronDown
            size={16}
            style={{ transform: open ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform .15s" }}
          />
        </button>
        <input
          type="text"
          value={title}
          onChange={(e) => updateAttributes({ title: e.target.value })}
          placeholder="Titel des Akkordeon-Eintrags"
          className="flex-1 bg-transparent font-semibold text-sm focus:outline-none"
          contentEditable={false}
        />
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            editor?.chain().focus().insertAccordionItem().run();
          }}
          className="text-muted-foreground hover:text-primary shrink-0"
          title="Weiteren Abschnitt hinzufügen"
          contentEditable={false}
        >
          <Plus size={14} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            deleteNode();
          }}
          className="text-muted-foreground hover:text-destructive shrink-0"
          title="Abschnitt löschen"
          contentEditable={false}
        >
          <Trash2 size={14} />
        </button>
      </div>
      <div style={{ display: open ? "block" : "none" }}>
        <NodeViewContent className="px-4 py-3 freigeist-accordion-body" />
      </div>
    </NodeViewWrapper>
  );
};

export default AccordionNodeView;
