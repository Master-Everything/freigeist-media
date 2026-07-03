import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import AccordionNodeView from "./AccordionNodeView";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    accordion: {
      insertAccordion: () => ReturnType;
      insertAccordionItem: () => ReturnType;
    };
  }
}

export const Accordion = Node.create({
  name: "accordion",
  group: "block",
  content: "accordionItem+",
  defining: true,

  parseHTML() {
    return [{ tag: "div.freigeist-accordion" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { class: "freigeist-accordion" }),
      0,
    ];
  },

  addCommands() {
    return {
      insertAccordion:
        () =>
        ({ chain }) => {
          return chain()
            .insertContent({
              type: "accordion",
              content: [
                {
                  type: "accordionItem",
                  attrs: { title: "Titel des Abschnitts" },
                  content: [
                    { type: "paragraph", content: [{ type: "text", text: "Inhalt…" }] },
                  ],
                },
              ],
            })
            .run();
        },
      insertAccordionItem:
        () =>
        ({ state, chain }) => {
          const { $from } = state.selection;
          for (let d = $from.depth; d > 0; d--) {
            if ($from.node(d).type.name === "accordion") {
              const insertPos = $from.after(d);
              return chain()
                .insertContentAt(insertPos - 1, {
                  type: "accordionItem",
                  attrs: { title: "Neuer Abschnitt" },
                  content: [
                    { type: "paragraph", content: [{ type: "text", text: "Inhalt…" }] },
                  ],
                })
                .run();
            }
          }
          return false;
        },
    };
  },
});

export const AccordionItem = Node.create({
  name: "accordionItem",
  content: "block+",
  defining: true,
  isolating: true,

  addAttributes() {
    return {
      title: {
        default: "",
        parseHTML: (el) => {
          const summary = (el as HTMLElement).querySelector("summary");
          return summary ? summary.textContent?.trim() || "" : "";
        },
        renderHTML: () => ({}),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "details.freigeist-accordion-item",
        contentElement: (node) => {
          const el = node as HTMLElement;
          const body = el.querySelector(".freigeist-accordion-body") as HTMLElement | null;
          return body || el;
        },
      },
      {
        tag: "details",
        contentElement: (node) => {
          const el = node as HTMLElement;
          const body = el.querySelector(".freigeist-accordion-body") as HTMLElement | null;
          if (body) return body;
          // Fallback: strip <summary>
          const clone = el.cloneNode(true) as HTMLElement;
          const s = clone.querySelector("summary");
          if (s) s.remove();
          return clone;
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      "details",
      mergeAttributes(HTMLAttributes, { class: "freigeist-accordion-item" }),
      ["summary", {}, node.attrs.title || ""],
      ["div", { class: "freigeist-accordion-body" }, 0],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(AccordionNodeView);
  },
});
