import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import type { EditorView } from "@tiptap/pm/view";
import StarterKit from "@tiptap/starter-kit";
import { Figure, Figcaption } from "./extensions/FigureExtension";
import { Video } from "./extensions/VideoExtension";
import { Accordion, AccordionItem } from "./extensions/AccordionExtension";
import { SpeakerProfile } from "./extensions/SpeakerProfileExtension";
import { getEmbedUrl } from "@/lib/videoUtils";

import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, Quote, Undo, Redo, Link as LinkIcon,
  Image as ImageIcon, Heading1, Heading2, Heading3, Minus, Upload,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, Film,
  RefreshCw, Loader2, Download, ChevronDown, User, Sparkles,
} from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import ImageGalleryDialog from "./ImageGalleryDialog";

import { PendingImageContext, type PendingImageCallbacks } from "./PendingImageContext";
import { checkImageConflict, uploadImageFile, getNextAvailableName, type ConflictInfo } from "./imageUploadUtils";
import { isWebP, convertToWebP } from "./webpConverter";
import { sanitizeFilename } from "./ImageGalleryDialog";
import { batchConvertEditorImages, scanNonWebPImages, type ScannedImage } from "./batchWebPConverter";
import WebPBatchConfirmDialog from "./WebPBatchConfirmDialog";
import { toAbsoluteUrl, toRelativePath, resolveContentUrls, relativizeContentUrls } from "@/lib/imageUrl";
const STORAGE_HOST = "supabase.co/storage";

const scrollIfNeeded = (view: EditorView, pos: number) => {
  try {
    const coords = view.coordsAtPos(pos);
    const viewportTop = window.scrollY;
    const viewportBottom = viewportTop + window.innerHeight;
    if (coords.top < viewportTop || coords.bottom > viewportBottom) {
      view.dispatch(view.state.tr.scrollIntoView());
    }
  } catch {
    // pos may be invalid after large transactions; silently skip
  }
};

interface ReplacementEntry {
  originalSrc: string;
  file: File;
}


interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  onEditorReady?: (editor: Editor) => void;
}

const MenuButton = ({ onClick, pressed, children, title }: {
  onClick: () => void; pressed?: boolean; children: React.ReactNode; title: string;
}) => (
  <Toggle size="sm" pressed={pressed} onPressedChange={() => onClick()} aria-label={title} title={title}
    className="h-8 w-8 p-0 data-[state=on]:bg-accent">
    {children}
  </Toggle>
);

const RichTextEditor = ({ content, onChange, onEditorReady }: RichTextEditorProps) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [pendingInsertMode, setPendingInsertMode] = useState<"replace" | { pos: number } | null>(null);
  const [replacementQueue, setReplacementQueue] = useState<ReplacementEntry[]>([]);
  const [currentReplacement, setCurrentReplacement] = useState<ReplacementEntry | null>(null);
  const [batchConverting, setBatchConverting] = useState(false);
  const [batchProgress, setBatchProgress] = useState("");
  const [batchDialogOpen, setBatchDialogOpen] = useState(false);
  const [scannedImages, setScannedImages] = useState<ScannedImage[]>([]);
  const [downloadConverting, setDownloadConverting] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState("");

  // Map of blob URLs to pending files for inline WebP conversion
  const pendingFilesRef = useRef<Map<string, File>>(new Map());
  // Map of blob URLs to conflict info for inline conflict resolution
  const pendingConflictsRef = useRef<Map<string, ConflictInfo>>(new Map());
  // Reference to editor for use in callbacks
  const editorRef = useRef<Editor | null>(null);

  /**
   * Find a figure node by its src attribute and update its attributes.
   */
  const updateFigureBySrc = useCallback((src: string, attrs: Record<string, any>) => {
    const ed = editorRef.current;
    if (!ed) return;
    const { doc, tr } = ed.view.state;
    doc.descendants((node, pos) => {
      if (node.type.name === "figure" && node.attrs.src === src) {
        tr.setNodeMarkup(pos, undefined, { ...node.attrs, ...attrs });
        return false;
      }
    });
    ed.view.dispatch(tr);
  }, []);

  /**
   * Upload a file and update the figure node's src from tempUrl to the final URL.
   */
  const uploadAndFinalize = useCallback(async (file: File, tempUrl: string) => {
    updateFigureBySrc(tempUrl, { dataPending: "uploading" });

    const { conflict: conflictInfo, sanitizedName } = await checkImageConflict(file);
    if (conflictInfo) {
      // Store conflict info and show inline conflict UI
      pendingConflictsRef.current.set(tempUrl, conflictInfo);
      updateFigureBySrc(tempUrl, { dataPending: "conflict" });
      return;
    }
    const url = await uploadImageFile(file, sanitizedName);
    if (!url) {
      toast({ title: t("postForm.uploadFailed"), variant: "destructive" });
      updateFigureBySrc(tempUrl, { dataPending: null, src: tempUrl });
      return;
    }
    updateFigureBySrc(tempUrl, { src: url, dataPending: null });
    pendingFilesRef.current.delete(tempUrl);
    URL.revokeObjectURL(tempUrl);
  }, [toast, t, updateFigureBySrc]);

  /**
   * Insert a placeholder figure immediately at the given position,
   * then handle WebP conversion / upload asynchronously.
   */
  const insertPendingFigure = useCallback((file: File, mode: "replace" | { pos: number }, ed: Editor) => {
    const tempUrl = URL.createObjectURL(file);
    pendingFilesRef.current.set(tempUrl, file);

    const pendingState = isWebP(file) ? "uploading" : "webp-convert";

    const figureJson = {
      type: "figure",
      attrs: { src: tempUrl, dataPending: pendingState },
      content: [{ type: "figcaption", content: [] }],
    };

    if (mode && typeof mode === "object" && "pos" in mode) {
      ed.chain().focus().insertContentAt(mode.pos, figureJson).run();
    } else {
      ed.chain().focus().insertContent(figureJson).run();
    }

    // If it's already WebP, start uploading immediately
    if (isWebP(file)) {
      uploadAndFinalize(file, tempUrl);
    }
    // Otherwise, the FigureNodeView will show the convert/keep UI
  }, [uploadAndFinalize]);

  /**
   * PendingImageContext callbacks consumed by FigureNodeView
   */
  const pendingImageCallbacks = useMemo<PendingImageCallbacks>(() => ({
    getPendingFile: (tempUrl: string) => pendingFilesRef.current.get(tempUrl),
    onConvertDecision: async (tempUrl: string, action: "convert" | "keep") => {
      const file = pendingFilesRef.current.get(tempUrl);
      if (!file) return;

      if (action === "convert") {
        updateFigureBySrc(tempUrl, { dataPending: "uploading" });
        const converted = await convertToWebP(file);
        pendingFilesRef.current.set(tempUrl, converted);
        await uploadAndFinalize(converted, tempUrl);
      } else {
        await uploadAndFinalize(file, tempUrl);
      }
    },
    getPendingConflict: (tempUrl: string) => pendingConflictsRef.current.get(tempUrl),
    onConflictResolved: async (tempUrl: string, action: "use-existing" | "rename", newName?: string) => {
      const conflictInfo = pendingConflictsRef.current.get(tempUrl);
      if (!conflictInfo) return;

      if (action === "use-existing") {
        updateFigureBySrc(tempUrl, { src: conflictInfo.existingUrl, dataPending: null });
      } else {
        const finalName = newName || conflictInfo.suggestedName;
        updateFigureBySrc(tempUrl, { dataPending: "uploading" });
        const url = await uploadImageFile(conflictInfo.file, finalName);
        if (url) {
          updateFigureBySrc(tempUrl, { src: url, dataPending: null });
        } else {
          updateFigureBySrc(tempUrl, { dataPending: "conflict" });
          return;
        }
      }
      pendingConflictsRef.current.delete(tempUrl);
      pendingFilesRef.current.delete(tempUrl);
      URL.revokeObjectURL(tempUrl);
    },
    onConflictCancel: (tempUrl: string) => {
      pendingConflictsRef.current.delete(tempUrl);
      pendingFilesRef.current.delete(tempUrl);
      URL.revokeObjectURL(tempUrl);
    },
  }), [updateFigureBySrc, uploadAndFinalize]);

  const findAndReplaceNodeSrc = useCallback((originalSrc: string, newUrl: string) => {
    const ed = editorRef.current;
    if (!ed) return;
    const { doc, tr } = ed.view.state;
    doc.descendants((node, pos) => {
      if (node.type.name === "figure" && node.attrs.src === originalSrc) {
        tr.setNodeMarkup(pos, undefined, { ...node.attrs, src: newUrl });
        return false;
      }
    });
    ed.view.dispatch(tr);
  }, []);

  const isExternalUrl = useCallback((src: string | null) => {
    if (!src) return false;
    if (src.startsWith("data:")) return false;
    if (src.startsWith("post-images/")) return false;
    if (src.includes(STORAGE_HOST)) return false;
    return src.startsWith("http://") || src.startsWith("https://");
  }, []);

  const scanAndQueueExternalImages = useCallback((editorInstance: any) => {
    if (!editorInstance) return;
    const entries: ReplacementEntry[] = [];
    editorInstance.state.doc.descendants((node: any) => {
      if (node.type.name === "figure" && isExternalUrl(node.attrs.src)) {
        entries.push({ originalSrc: node.attrs.src, file: null as any });
      }
    });
    if (entries.length === 0) return;
    Promise.all(
      entries.map(async (entry) => {
        try {
          const res = await fetch(entry.originalSrc);
          const blob = await res.blob();
          const ext = blob.type.split("/")[1] || "png";
          const name = `pasted-image-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
          return { ...entry, file: new File([blob], name, { type: blob.type }) };
        } catch {
          return null;
        }
      })
    ).then((results) => {
      const valid = results.filter((r): r is ReplacementEntry => r !== null && r.file !== null);
      if (valid.length > 0) {
        setReplacementQueue(valid);
      }
    });
  }, [isExternalUrl]);

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'], defaultAlignment: 'justify' }),
      Figure,
      Figcaption,
      Video,
      Accordion,
      AccordionItem,
      SpeakerProfile,
      Link.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            class: {
              default: null,
              parseHTML: (el) => el.getAttribute("class"),
              renderHTML: (attrs) => (attrs.class ? { class: attrs.class } : {}),
            },
            target: {
              default: null,
              parseHTML: (el) => el.getAttribute("target"),
              renderHTML: (attrs) => (attrs.target ? { target: attrs.target } : {}),
            },
          };
        },
      }).configure({
        openOnClick: false,
        protocols: ["http", "https", "mailto", "tel"],
        HTMLAttributes: { class: "text-primary underline", rel: "noopener noreferrer nofollow" },
        validate: (href: string) => /^(https?:|mailto:|tel:|\/|#)/i.test(href),
      }),
    ],
    content: resolveContentUrls(content),
    onUpdate: ({ editor }) => onChange(relativizeContentUrls(editor.getHTML())),
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none min-h-[300px] p-4 focus:outline-none dark:prose-invert",
      },
      handleDrop: (view, event, _slice, moved) => {
        if (moved || !event.dataTransfer?.files.length) return false;
        const file = event.dataTransfer.files[0];
        if (!file.type.startsWith("image/")) return false;
        event.preventDefault();
        const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
        const mode: "replace" | { pos: number } = coordinates ? { pos: coordinates.pos } : "replace";
        const ed = editorRef.current;
        if (ed) insertPendingFigure(file, mode, ed);
        return true;
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        // Check for raw image data FIRST — prefer it over HTML
        if (items) {
          for (const item of Array.from(items)) {
            if (item.type.startsWith("image/")) {
              event.preventDefault();
              const file = item.getAsFile();
              if (file) {
                const ed = editorRef.current;
                if (ed) insertPendingFigure(file, "replace", ed);
              }
              return true;
            }
          }
        }
        // No raw image — fall back to HTML handling (rich text with inline images)
        const hasHtml = event.clipboardData?.types.includes("text/html");
        if (hasHtml) {
          setTimeout(() => scanAndQueueExternalImages(view), 100);
          return false;
        }
        return false;
      },
    },
  });

  // Keep editorRef in sync
  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  useEffect(() => {
    if (editor && resolveContentUrls(content) !== editor.getHTML()) {
      editor.commands.setContent(resolveContentUrls(content), { emitUpdate: false });
    }
  }, [content]);

  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  useEffect(() => {
    if (currentReplacement || replacementQueue.length === 0) return;
    const [next, ...rest] = replacementQueue;
    setReplacementQueue(rest);
    setCurrentReplacement(next);
    if (isWebP(next.file)) {
      handleReplacementUpload(next.file, next.originalSrc);
    } else {
      // For replacement queue (external images), insert inline pending
      const ed = editorRef.current;
      if (ed) {
        // The figure already exists with the original external src.
        // Convert in-place: update its src to a blob URL and set pending
        const tempUrl = URL.createObjectURL(next.file);
        pendingFilesRef.current.set(tempUrl, next.file);
        findAndReplaceNodeSrc(next.originalSrc, tempUrl);
        updateFigureBySrc(tempUrl, { dataPending: "webp-convert" });
      }
    }
  }, [replacementQueue, currentReplacement]);

  const handleReplacementUpload = async (file: File, originalSrc: string) => {
    const { conflict: conflictInfo, sanitizedName } = await checkImageConflict(file);
    if (conflictInfo) {
      // For replacement queue, use inline conflict via pending figure
      const tempUrl = URL.createObjectURL(file);
      pendingFilesRef.current.set(tempUrl, file);
      pendingConflictsRef.current.set(tempUrl, conflictInfo);
      findAndReplaceNodeSrc(originalSrc, tempUrl);
      updateFigureBySrc(tempUrl, { dataPending: "conflict" });
      setCurrentReplacement(null);
      return;
    }
    const url = await uploadImageFile(file, sanitizedName);
    if (url) {
      findAndReplaceNodeSrc(originalSrc, url);
    }
    setCurrentReplacement(null);
  };

  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt("URL:");
    if (url) editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addCtaButton = () => {
    const url = window.prompt("Button-URL:");
    if (!url) return;
    const raw = (window.prompt("Button-Text:", "Jetzt entdecken") || "Jetzt entdecken").trim();
    const hasSparkle = /[\u2728\u2B50]|\uD83C\uDF1F/.test(raw);
    const label = hasSparkle ? raw : `\u2728 ${raw} \u2728`;
    editor
      .chain()
      .focus()
      .insertContent(
        `<p style="text-align:center"><a class="freigeist-cta" href="${url}" target="_blank" rel="noopener noreferrer">${label}</a></p><p></p>`,
      )
      .run();
  };



  const addVideo = () => {
    const url = window.prompt("YouTube or Vimeo URL:");
    if (!url) return;
    if (!getEmbedUrl(url)) {
      toast({ title: "Invalid URL", description: t("postForm.invalidVideoUrl"), variant: "destructive" });
      return;
    }
    editor.chain().focus().setVideo({ src: url }).run();
  };

  const openBatchDialog = () => {
    if (!editor) return;
    const images = scanNonWebPImages(editor.view);
    if (images.length === 0) {
      toast({ title: t("webp.noImagesToConvert"), description: t("webp.allWebP") });
      return;
    }
    setScannedImages(images);
    setBatchDialogOpen(true);
  };

  const handleBatchConvert = async () => {
    if (!editor) return;
    setBatchConverting(true);
    setBatchProgress(t("webp.scanning"));
    try {
      const result = await batchConvertEditorImages(
        editor.view,
        (done, total) => setBatchProgress(`${done}/${total}…`),
      );
      toast({
        title: t("webp.conversionComplete"),
        description: t("webp.conversionResult", { converted: result.converted, failed: result.failed }),
      });
    } finally {
      setBatchConverting(false);
      setBatchProgress("");
      setBatchDialogOpen(false);
    }
  };

  const handleDownloadAndConvert = async () => {
    if (!editor) return;
    const externalEntries: { src: string; pos: number }[] = [];
    editor.state.doc.descendants((node: any, pos: number) => {
      if (node.type.name === "figure" && isExternalUrl(node.attrs.src)) {
        externalEntries.push({ src: node.attrs.src, pos });
      }
    });
    if (externalEntries.length === 0) {
      toast({ title: t("webp.noExternal"), description: t("webp.allLocal") });
      return;
    }
    setDownloadConverting(true);
    let converted = 0;
    let failed = 0;
    for (let i = 0; i < externalEntries.length; i++) {
      setDownloadProgress(`${i + 1}/${externalEntries.length}…`);
      const entry = externalEntries[i];
      try {
        const res = await fetch(entry.src);
        const blob = await res.blob();
        const urlPath = new URL(entry.src).pathname.split("/").pop() || "image";
        const rawName = urlPath.toLowerCase().replace(/[^a-z0-9._-]/g, "-").replace(/-+/g, "-");
        const sanitized = sanitizeFilename(rawName);
        const baseName = sanitized.replace(/\.[^.]+$/, "");
        const webpFile = await convertToWebP(new File([blob], sanitized, { type: blob.type }));
        const finalName = `${baseName}.webp`;
        const { conflict: ci } = await checkImageConflict(
          new File([webpFile], finalName, { type: "image/webp" })
        );
        let uploadName = finalName;
        if (ci) {
          uploadName = getNextAvailableName(finalName, ci.existingNames);
        }
        const url = await uploadImageFile(
          new File([webpFile], uploadName, { type: "image/webp" }),
          uploadName
        );
        if (url) {
          findAndReplaceNodeSrc(entry.src, url);
          converted++;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
    }
    setDownloadConverting(false);
    setDownloadProgress("");
    toast({
      title: t("webp.downloadComplete"),
      description: t("webp.conversionResult", { converted, failed }),
    });
  };

  const handleImageUploadClick = () => fileInputRef.current?.click();

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (fileInputRef.current) fileInputRef.current.value = "";
    insertPendingFigure(file, "replace", editor);
  };

  // handleConflictResolved removed — conflict resolution now handled inline via PendingImageContext

  return (
    <PendingImageContext.Provider value={pendingImageCallbacks}>
      <div className="rounded-md border border-input bg-background">
        <div className="flex flex-wrap items-center gap-0.5 border-b border-border p-1 sticky top-0 z-10 bg-background">
          <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} pressed={editor.isActive("bold")} title="Bold">
            <Bold size={14} />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} pressed={editor.isActive("italic")} title="Italic">
            <Italic size={14} />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().toggleUnderline().run()} pressed={editor.isActive("underline")} title="Underline">
            <UnderlineIcon size={14} />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().toggleStrike().run()} pressed={editor.isActive("strike")} title="Strikethrough">
            <Strikethrough size={14} />
          </MenuButton>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} pressed={editor.isActive("heading", { level: 1 })} title="Heading 1">
            <Heading1 size={14} />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} pressed={editor.isActive("heading", { level: 2 })} title="Heading 2">
            <Heading2 size={14} />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} pressed={editor.isActive("heading", { level: 3 })} title="Heading 3">
            <Heading3 size={14} />
          </MenuButton>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} pressed={editor.isActive("bulletList")} title="Bullet List">
            <List size={14} />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} pressed={editor.isActive("orderedList")} title="Ordered List">
            <ListOrdered size={14} />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().toggleBlockquote().run()} pressed={editor.isActive("blockquote")} title="Blockquote">
            <Quote size={14} />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule">
            <Minus size={14} />
          </MenuButton>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <MenuButton onClick={() => editor.chain().focus().setTextAlign('left').run()} pressed={editor.isActive({ textAlign: 'left' })} title="Align Left">
            <AlignLeft size={14} />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().setTextAlign('center').run()} pressed={editor.isActive({ textAlign: 'center' })} title="Align Center">
            <AlignCenter size={14} />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().setTextAlign('right').run()} pressed={editor.isActive({ textAlign: 'right' })} title="Align Right">
            <AlignRight size={14} />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} pressed={editor.isActive({ textAlign: 'justify' })} title="Justify">
            <AlignJustify size={14} />
          </MenuButton>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <MenuButton onClick={addLink} pressed={editor.isActive("link")} title="Add Link">
            <LinkIcon size={14} />
          </MenuButton>
          <MenuButton onClick={addCtaButton} title="CTA-Button einfügen">
            <Sparkles size={14} />
          </MenuButton>
          <MenuButton onClick={handleImageUploadClick} title="Upload Image">
            <Upload size={14} />
          </MenuButton>
          <MenuButton onClick={() => setGalleryOpen(true)} title="Image Gallery">
            <ImageIcon size={14} />
          </MenuButton>
          <MenuButton onClick={addVideo} title="Embed Video">
            <Film size={14} />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().insertAccordion().run()} title="Akkordeon einfügen">
            <ChevronDown size={14} />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().insertSpeakerProfile().run()} title="Speaker-Profil einfügen">
            <User size={14} />
          </MenuButton>
          <MenuButton onClick={openBatchDialog} title="Convert all images to WebP">
            {batchConverting ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          </MenuButton>
          {batchConverting && (
            <span className="text-xs text-muted-foreground ml-1">{batchProgress}</span>
          )}
          <MenuButton onClick={handleDownloadAndConvert} title="Download external images & convert to WebP">
            {downloadConverting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          </MenuButton>
          {downloadConverting && (
            <span className="text-xs text-muted-foreground ml-1">{downloadProgress}</span>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileSelected} />
          <Separator orientation="vertical" className="mx-1 h-6" />
          <MenuButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
            <Undo size={14} />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
            <Redo size={14} />
          </MenuButton>
        </div>
        
        <EditorContent editor={editor} />
        <ImageGalleryDialog
          open={galleryOpen}
          onOpenChange={setGalleryOpen}
          onSelect={(url) => editor.chain().setFigure({ src: url }).run()}
        />
        <WebPBatchConfirmDialog
          open={batchDialogOpen}
          onOpenChange={setBatchDialogOpen}
          images={scannedImages}
          onConfirm={handleBatchConvert}
          converting={batchConverting}
          progress={batchProgress}
        />
      </div>
    </PendingImageContext.Provider>
  );
};

export default RichTextEditor;
