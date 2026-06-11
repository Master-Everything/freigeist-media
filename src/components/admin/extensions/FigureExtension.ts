import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import FigureNodeView from "./FigureNodeView";

export interface FigureOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    figure: {
      setFigure: (options: { src: string; alt?: string; caption?: string }) => ReturnType;
      setFigureAlign: (align: "left" | "center" | "right") => ReturnType;
      setFigureFloat: (float: "none" | "left" | "right") => ReturnType;
    };
  }
}

const Figure = Node.create<FigureOptions>({
  name: "figure",
  group: "block",
  content: "figcaption",
  draggable: true,
  isolating: true,

  addOptions() {
    return { HTMLAttributes: {} };
  },

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      dataPending: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-pending") || null,
        renderHTML: (attributes) => {
          if (!attributes.dataPending) return {};
          return { "data-pending": attributes.dataPending };
        },
      },
      dataAlign: {
        default: "center",
        parseHTML: (element) => element.getAttribute("data-align") || "center",
        renderHTML: (attributes) => ({ "data-align": attributes.dataAlign }),
      },
      dataFloat: {
        default: "none",
        parseHTML: (element) => element.getAttribute("data-float") || "none",
        renderHTML: (attributes) => ({ "data-float": attributes.dataFloat }),
      },
      dataWidth: {
        default: 100,
        parseHTML: (element) => {
          const w = element.getAttribute("data-width");
          return w ? parseInt(w, 10) : 100;
        },
        renderHTML: (attributes) => ({
          "data-width": attributes.dataWidth,
          style: `width: ${attributes.dataWidth}%`,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "figure",
        getAttrs(node) {
          const el = node as HTMLElement;
          const img = el.querySelector("img");
          if (!img) return false;
          return {
            src: img.getAttribute("src"),
            alt: img.getAttribute("alt"),
            dataAlign: el.getAttribute("data-align") || "center",
            dataFloat: el.getAttribute("data-float") || "none",
          };
        },
        contentElement(node: HTMLElement) {
          const fc = node.querySelector("figcaption");
          if (fc) return fc;
          const el = document.createElement("figcaption");
          node.appendChild(el);
          return el;
        },
      },
      {
        tag: "img[src]",
        priority: 40,
        getAttrs(node) {
          const el = node as HTMLElement;
          if (el.closest("figure")) return false;
          return { src: el.getAttribute("src"), alt: el.getAttribute("alt") };
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      "figure",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      [
        "img",
        {
          src: node.attrs.src,
          alt: node.attrs.alt || "",
          draggable: "false",
          contenteditable: "false",
        },
      ],
      ["figcaption", 0],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FigureNodeView);
  },

  addCommands() {
    return {
      setFigure:
        ({ src, alt, caption }) =>
        ({ chain }) => {
          return chain()
            .insertContent({
              type: this.name,
              attrs: { src, alt },
              content: [
                {
                  type: "figcaption",
                  content: caption ? [{ type: "text", text: caption }] : [],
                },
              ],
            })
            .run();
        },
      setFigureAlign:
        (align) =>
        ({ tr, state }) => {
          const { selection } = state;
          const pos = selection.$anchor.before(1);
          const node = state.doc.nodeAt(pos);
          if (node?.type.name === "figure") {
            tr.setNodeMarkup(pos, undefined, { ...node.attrs, dataAlign: align, dataFloat: "none" });
            return true;
          }
          return false;
        },
      setFigureFloat:
        (float) =>
        ({ tr, state }) => {
          const { selection } = state;
          const pos = selection.$anchor.before(1);
          const node = state.doc.nodeAt(pos);
          if (node?.type.name === "figure") {
            tr.setNodeMarkup(pos, undefined, { ...node.attrs, dataFloat: float });
            return true;
          }
          return false;
        },
    };
  },
});

const Figcaption = Node.create({
  name: "figcaption",
  group: "",
  content: "inline*",
  defining: true,

  parseHTML() {
    return [{ tag: "figcaption" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["figcaption", mergeAttributes(HTMLAttributes), 0];
  },
});

export { Figure, Figcaption };
