import { Node, mergeAttributes } from "@tiptap/core";
import { getEmbedUrl } from "@/lib/videoUtils";

export interface VideoOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    video: {
      setVideo: (options: { src: string }) => ReturnType;
    };
  }
}

export const Video = Node.create<VideoOptions>({
  name: "video",
  group: "block",
  atom: true,

  addOptions() {
    return { HTMLAttributes: {} };
  },

  addAttributes() {
    return {
      src: { default: null },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div.video-embed",
        getAttrs: (dom) => {
          const iframe = (dom as HTMLElement).querySelector("iframe");
          return iframe ? { src: iframe.getAttribute("src") } : false;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const embedUrl = HTMLAttributes.src;
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, { class: "video-embed" }),
      [
        "iframe",
        {
          src: embedUrl,
          frameborder: "0",
          allowfullscreen: "true",
          allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
          sandbox: "allow-scripts allow-same-origin allow-presentation",
        },
      ],
    ];
  },

  addCommands() {
    return {
      setVideo:
        (options) =>
        ({ commands }) => {
          const embedUrl = getEmbedUrl(options.src);
          if (!embedUrl) return false;
          return commands.insertContent({
            type: this.name,
            attrs: { src: embedUrl },
          });
        },
    };
  },
});
