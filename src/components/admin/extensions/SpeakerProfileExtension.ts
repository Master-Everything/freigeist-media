import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import SpeakerProfileNodeView from "./SpeakerProfileNodeView";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    speakerProfile: {
      insertSpeakerProfile: () => ReturnType;
    };
  }
}

export const SpeakerProfile = Node.create({
  name: "speakerProfile",
  group: "block",
  content: "block+",
  defining: true,
  isolating: true,

  addAttributes() {
    return {
      imageSrc: {
        default: null,
        parseHTML: (el) => {
          const img = (el as HTMLElement).querySelector("img");
          return img ? img.getAttribute("src") : null;
        },
        renderHTML: () => ({}),
      },
      imageAlt: {
        default: "",
        parseHTML: (el) => {
          const img = (el as HTMLElement).querySelector("img");
          return img ? img.getAttribute("alt") || "" : "";
        },
        renderHTML: () => ({}),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "aside.speaker-profile",
        contentElement: (node) => {
          const el = node as HTMLElement;
          return (el.querySelector(".speaker-bio") as HTMLElement) || el;
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      "aside",
      mergeAttributes(HTMLAttributes, { class: "speaker-profile" }),
      [
        "figure",
        { class: "speaker-photo" },
        ["img", { src: node.attrs.imageSrc || "", alt: node.attrs.imageAlt || "" }],
      ],
      ["div", { class: "speaker-bio" }, 0],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(SpeakerProfileNodeView);
  },

  addCommands() {
    return {
      insertSpeakerProfile:
        () =>
        ({ chain }) => {
          return chain()
            .insertContent({
              type: "speakerProfile",
              attrs: { imageSrc: "", imageAlt: "" },
              content: [
                {
                  type: "heading",
                  attrs: { level: 3 },
                  content: [{ type: "text", text: "Name des Speakers" }],
                },
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Kurze Biografie …" }],
                },
              ],
            })
            .run();
        },
    };
  },
});
