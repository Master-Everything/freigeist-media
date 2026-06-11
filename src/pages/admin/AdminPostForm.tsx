import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePostById } from "@/hooks/usePost";
import { useAllCategories } from "@/hooks/useCategories";
import { useQueryClient } from "@tanstack/react-query";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuthorLookup } from "@/hooks/useAuthorLookup";
import { useTranslation } from "react-i18next";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { X, Image as ImageIcon, CalendarIcon, Film, RefreshCw, Loader2, Eye, PenLine, UserPen } from "lucide-react";
import { format, parse, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import RichTextEditor from "@/components/admin/RichTextEditor";
import ImageGalleryDialog from "@/components/admin/ImageGalleryDialog";
import ImageConflictPanel from "@/components/admin/ImageConflictPanel";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { brand } from "@/config/brand";
import { resolveAccessLevel, type AccessLevel } from "@/lib/entitlements";
import WebPConvertPanel from "@/components/admin/WebPConvertPanel";
import { checkImageConflict, uploadImageFile, type ConflictInfo } from "@/components/admin/imageUploadUtils";
import { getEmbedUrl } from "@/lib/videoUtils";
import { isWebP } from "@/components/admin/webpConverter";
import { convertStorageImageToWebP, isOwnNonWebP } from "@/components/admin/batchWebPConverter";
import PostPreview from "@/components/admin/PostPreview";
import AIRightSidebar from "@/components/admin/AIRightSidebar";
import AuthorSelectDialog from "@/components/admin/AuthorSelectDialog";
import { toAbsoluteUrl, toRelativePath, relativizeContentUrls } from "@/lib/imageUrl";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const AdminPostForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id && id !== "new";
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: existingPost, isLoading: postLoading } = usePostById(isEdit ? id : undefined);
  const { data: categories } = useAllCategories();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isAdmin, isEditorialManager } = useUserRole();

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    slug: "",
    category_slug: "",
    content: "",
    created_by: null as string | null,
    reading_time: 5,
    featured: false,
    status: "draft" as "draft" | "published",
    image_url: "",
    video_url: "",
    access_level: null as AccessLevel | null,
  });
  const [saving, setSaving] = useState(false);
  const [slugManual, setSlugManual] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [publishedAt, setPublishedAt] = useState<Date | undefined>(undefined);
  const [dateInput, setDateInput] = useState("");
  const [dragging, setDragging] = useState(false);
  const [imageConflict, setImageConflict] = useState<ConflictInfo | null>(null);
  const [webpPending, setWebpPending] = useState<File | null>(null);
  const [convertingFeatured, setConvertingFeatured] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [authorDialogOpen, setAuthorDialogOpen] = useState(false);
  const [tiptapEditor, setTiptapEditor] = useState<any>(null);

  useEffect(() => {
    if (existingPost) {
      setForm({
        title: existingPost.title,
        subtitle: existingPost.subtitle || "",
        slug: existingPost.slug,
        category_slug: existingPost.category_slug || "",
        content: existingPost.content || "",
        created_by: existingPost.created_by || null,
        reading_time: existingPost.reading_time || 5,
        featured: existingPost.featured || false,
        status: (existingPost.status as "draft" | "published") || "draft",
        image_url: (existingPost as any).image_url || "",
        video_url: (existingPost as any).video_url || "",
        access_level: ((existingPost as any).access_level as AccessLevel | null) ?? null,
      });
      setSlugManual(true);
      if (existingPost.published_at) {
        const d = new Date(existingPost.published_at);
        setPublishedAt(d);
        setDateInput(format(d, "dd.MM.yyyy"));
      }
    }
  }, [existingPost]);

  const updateField = (key: string, value: any) => {
    setForm((f) => {
      const updated = { ...f, [key]: value };
      if (key === "title" && !slugManual) {
        updated.slug = slugify(value);
      }
      return updated;
    });
  };

  const processImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: t("common.error"), description: t("postForm.selectImageFile"), variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: t("common.error"), description: t("postForm.imageTooLarge"), variant: "destructive" });
      return;
    }

    setUploading(true);
    const { conflict: conflictInfo, sanitizedName } = await checkImageConflict(file);

    if (conflictInfo) {
      setUploading(false);
      setImageConflict(conflictInfo);
      return;
    }

    const url = await uploadImageFile(file, sanitizedName);
    if (!url) {
      toast({ title: t("postForm.uploadFailed"), variant: "destructive" });
      setUploading(false);
      return;
    }

    updateField("image_url", url);
    setUploading(false);
    toast({ title: t("postForm.imageUploaded") });
  };

  const interceptImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: t("common.error"), description: t("postForm.selectImageFile"), variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: t("common.error"), description: t("postForm.imageTooLarge"), variant: "destructive" });
      return;
    }
    if (isWebP(file)) {
      processImageUpload(file);
    } else {
      setWebpPending(file);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    interceptImageFile(file);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) interceptImageFile(file);
  };

  const removeImage = () => {
    updateField("image_url", "");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const [featuredConvertConfirm, setFeaturedConvertConfirm] = useState(false);

  const handleConvertFeaturedToWebP = async () => {
    setFeaturedConvertConfirm(false);
    if (!form.image_url || !isOwnNonWebP(form.image_url)) return;
    setConvertingFeatured(true);
    const newUrl = await convertStorageImageToWebP(form.image_url);
    setConvertingFeatured(false);
    if (newUrl) {
      updateField("image_url", newUrl);
      toast({ title: t("postForm.featuredConverted") });
    } else {
      toast({ title: t("postForm.conversionFailed"), variant: "destructive" });
    }
  };

  const save = async (status: "draft" | "published") => {
    if (!form.title || !form.slug) {
      toast({ title: t("common.error"), description: t("postForm.titleSlugRequired"), variant: "destructive" });
      return;
    }
    setSaving(true);

    if (form.featured) {
      const { error: clearError } = await supabase
        .from("posts")
        .update({ featured: false })
        .eq("featured", true)
        .neq("id", isEdit ? id! : "00000000-0000-0000-0000-000000000000");
      if (clearError) {
        toast({ title: t("common.error"), description: clearError.message, variant: "destructive" });
        setSaving(false);
        return;
      }
    }

    const payload = {
      title: form.title,
      subtitle: form.subtitle || null,
      slug: form.slug,
      category_slug: form.category_slug || null,
      content: relativizeContentUrls(form.content) || null,
      reading_time: form.reading_time,
      featured: form.featured,
      status,
      image_url: toRelativePath(form.image_url) || null,
      video_url: form.video_url || null,
      ...(brand.features.subscriptions ? { access_level: form.access_level } : {}),
      published_at: status === "published"
        ? (publishedAt ? publishedAt.toISOString() : new Date().toISOString())
        : (publishedAt ? publishedAt.toISOString() : (isEdit ? existingPost?.published_at : null)),
    };

    let error;
    if (isEdit) {
      const updatePayload: Record<string, any> = { ...payload };
      if (form.created_by) updatePayload.created_by = form.created_by;
      ({ error } = await supabase.from("posts").update(updatePayload).eq("id", id));
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      ({ error } = await supabase.from("posts").insert({ ...payload, created_by: user?.id }));
    }

    if (error) {
      toast({ title: t("common.error"), description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("postForm.saved"), description: isEdit ? t("postForm.postUpdated") : t("postForm.postCreated") });
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      navigate("/admin/posts");
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm(t("postForm.deleteConfirm"))) return;
    const { error } = await supabase.from("posts").update({ deleted_at: new Date().toISOString() }).eq("id", id);
    if (error) {
      toast({ title: t("common.error"), description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("postForm.deleted") });
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      navigate("/admin/posts");
    }
  };

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUserId(user?.id ?? null));
  }, []);

  const authorLookupIds = useMemo(() => {
    const ids: string[] = [];
    if (form.created_by) ids.push(form.created_by);
    if (currentUserId) ids.push(currentUserId);
    return ids;
  }, [form.created_by, currentUserId]);
  const { data: authorMap } = useAuthorLookup(authorLookupIds);

  const isOwner = !existingPost || (existingPost as any).created_by === currentUserId;
  const canEdit = isAdmin || isEditorialManager || isOwner;

  if (isEdit && postLoading) {
    return <AdminLayout><p className="text-muted-foreground">{t("common.loading")}</p></AdminLayout>;
  }

  if (isEdit && !postLoading && !canEdit && currentUserId) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t("postForm.canOnlyEditOwn")}</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/admin/posts")}>{t("common.back")}</Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold">{isEdit ? t("postForm.editPost") : t("postForm.newPost")}</h1>
        {isEdit && (isAdmin || isEditorialManager) && (
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            {t("postForm.deletePost")}
          </Button>
        )}
      </div>

      <div className="pb-24 flex gap-0">
      {showPreview ? (
        (() => {
          const previewCreatedBy = form.created_by || currentUserId;
          const authorInfo = previewCreatedBy && authorMap?.[previewCreatedBy];
          return (
            <div className="flex-1 max-w-2xl">
            <PostPreview
              title={form.title}
              subtitle={form.subtitle}
              content={form.content}
              image_url={form.image_url}
              video_url={form.video_url}
              author_name={authorInfo?.displayName || "Unknown"}
              author_role={authorInfo?.role || ""}
              reading_time={form.reading_time}
              published_at={publishedAt}
              category_name={categories?.find((c) => c.slug === form.category_slug)?.name}
              category_color={categories?.find((c) => c.slug === form.category_slug)?.color}
            />
            </div>
          );
        })()
      ) : (
        <>
        <div className="space-y-5 flex-1 max-w-2xl">
        <div>
          <Label>{t("postForm.title")} *</Label>
          <Input value={form.title} onChange={(e) => updateField("title", e.target.value)} />
        </div>

        <div>
          <Label>{t("postForm.subtitle")}</Label>
          <Textarea rows={2} value={form.subtitle} onChange={(e) => updateField("subtitle", e.target.value)} />
        </div>

        <div>
          <Label>{t("postForm.slug")} *</Label>
          <Input
            value={form.slug}
            onChange={(e) => { setSlugManual(true); updateField("slug", e.target.value); }}
          />
        </div>

        {/* Featured Video */}
        <div>
          <Label>{t("postForm.featuredVideo")}</Label>
          <Input
            placeholder="https://www.youtube.com/watch?v=..."
            value={form.video_url}
            onChange={(e) => updateField("video_url", e.target.value)}
          />
          {form.video_url && getEmbedUrl(form.video_url) && (
            <div className="mt-2 aspect-video rounded-md overflow-hidden border border-border">
              <iframe
                src={getEmbedUrl(form.video_url)!}
                className="w-full h-full"
                allowFullScreen
                sandbox="allow-scripts allow-same-origin allow-presentation"
              />
            </div>
          )}
          {form.video_url && !getEmbedUrl(form.video_url) && (
            <p className="text-sm text-destructive mt-1">{t("postForm.invalidVideoUrl")}</p>
          )}
        </div>

        {/* Featured Image Upload */}
        <div>
          <Label>{t("postForm.featuredImage")}</Label>
          {form.image_url ? (
            <div className="relative mt-2 rounded-lg overflow-hidden border border-border bg-muted flex justify-center">
              <img
                src={toAbsoluteUrl(form.image_url)}
                alt="Featured"
                className="max-w-full max-h-48 w-auto h-auto object-contain"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:opacity-80 transition-opacity"
              >
                <X size={16} />
              </button>
              {isOwnNonWebP(form.image_url) && (
                <button
                  type="button"
                  onClick={() => setFeaturedConvertConfirm(true)}
                  disabled={convertingFeatured}
                  className="absolute top-2 right-12 bg-background text-foreground rounded-full p-1 hover:opacity-80 transition-opacity border border-border"
                  title={t("postForm.convertToWebp")}
                >
                  {convertingFeatured ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                </button>
              )}
            </div>
          ) : (
            <div
              className={cn(
                "mt-2 border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                dragging ? "border-primary bg-primary/5" : "border-border"
              )}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              {uploading ? (
                <p className="text-sm text-muted-foreground">{t("postForm.uploading")}</p>
              ) : (
                <>
                  <ImageIcon size={32} className="mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">{t("postForm.imageUpload")}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t("postForm.imageFormats")}</p>
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      {t("postForm.chooseFile")}
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => setGalleryOpen(true)}>
                      {t("postForm.gallery")}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
          {webpPending && !form.image_url && (
            <div className="mt-2">
              <WebPConvertPanel
                file={webpPending}
                onResult={(resultFile) => {
                  setWebpPending(null);
                  processImageUpload(resultFile);
                }}
                onCancel={() => setWebpPending(null)}
              />
            </div>
          )}
          {imageConflict && !form.image_url && (
            <div className="mt-2">
              <ImageConflictPanel
                conflict={imageConflict}
                onResolved={(url) => {
                  setImageConflict(null);
                  updateField("image_url", url);
                }}
                onCancel={() => setImageConflict(null)}
              />
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
          <ImageGalleryDialog
            open={galleryOpen}
            onOpenChange={setGalleryOpen}
            onSelect={(url) => updateField("image_url", url)}
          />
        </div>

        <div>
          <Label>{t("postForm.category")}</Label>
          <Select value={form.category_slug} onValueChange={(v) => updateField("category_slug", v)}>
            <SelectTrigger><SelectValue placeholder={t("postForm.selectCategory")} /></SelectTrigger>
            <SelectContent>
              {categories?.map((cat) => (
                <SelectItem key={cat.slug} value={cat.slug}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>{t("postForm.content")}</Label>
          <RichTextEditor
            content={form.content}
            onChange={(html) => updateField("content", html)}
            onEditorReady={setTiptapEditor}
          />
        </div>

        {(() => {
          const authorCreatedBy = form.created_by || currentUserId;
          const authorInfo = authorCreatedBy && authorMap?.[authorCreatedBy];
          return (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t("postForm.authorName")}</Label>
                {isAdmin || isEditorialManager ? (
                  <div className="flex items-center gap-2">
                    <Input value={authorInfo?.displayName || "Unknown"} readOnly className="cursor-default bg-muted" />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setAuthorDialogOpen(true)}
                      title="Autor ändern"
                    >
                      <UserPen size={16} />
                    </Button>
                  </div>
                ) : (
                  <Input value={authorInfo?.displayName || "Unknown"} disabled className="bg-muted" />
                )}
              </div>
              <div>
                <Label>{t("postForm.authorRole")}</Label>
                <Input
                  value={authorInfo?.role || ""}
                  readOnly
                  className="bg-muted cursor-default"
                />
              </div>
            </div>
          );
        })()}

        <AuthorSelectDialog
          open={authorDialogOpen}
          onOpenChange={setAuthorDialogOpen}
          onSelect={({ id: userId }) => {
            updateField("created_by", userId);
          }}
        />

        <div>
          <Label>{t("postForm.readingTime")}</Label>
          <Input type="number" min={1} value={form.reading_time} onChange={(e) => updateField("reading_time", parseInt(e.target.value) || 1)} className="w-24" />
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="featured"
            checked={form.featured}
            onCheckedChange={(c) => updateField("featured", !!c)}
          />
          <Label htmlFor="featured">{t("postForm.featured")}</Label>
        </div>

        {brand.features.subscriptions && (() => {
          const cat = categories?.find((c) => c.slug === form.category_slug) as
            | { default_access_level?: AccessLevel | null }
            | undefined;
          const resolved = resolveAccessLevel(
            { access_level: form.access_level },
            cat,
          );
          return (
            <div>
              <Label>Access level</Label>
              <div className="flex items-center gap-2 mt-1">
                <Select
                  value={form.access_level ?? "__inherit"}
                  onValueChange={(v) =>
                    updateField(
                      "access_level",
                      v === "__inherit" ? null : (v as AccessLevel),
                    )
                  }
                >
                  <SelectTrigger className="w-56">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__inherit">Inherit from category</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="subscriber">Subscriber</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
                <Badge variant={resolved.source === "post" ? "default" : "secondary"}>
                  {resolved.level}
                  {resolved.source !== "post" && ` (inherited from ${resolved.source})`}
                </Badge>
              </div>
            </div>
          );
        })()}

        <div>
          <Label>{t("postForm.publicationDate")}</Label>
          <div className="flex items-center gap-2 mt-1">
            <Input
              value={dateInput}
              onChange={(e) => {
                setDateInput(e.target.value);
                const parsed = parse(e.target.value, "dd.MM.yyyy", new Date());
                if (isValid(parsed) && e.target.value.length === 10) {
                  setPublishedAt(parsed);
                }
              }}
              onBlur={() => {
                if (dateInput && dateInput.length > 0) {
                  const parsed = parse(dateInput, "dd.MM.yyyy", new Date());
                  if (isValid(parsed) && dateInput.length === 10) {
                    setPublishedAt(parsed);
                    setDateInput(format(parsed, "dd.MM.yyyy"));
                  } else {
                    setDateInput(publishedAt ? format(publishedAt, "dd.MM.yyyy") : "");
                  }
                } else {
                  setPublishedAt(undefined);
                }
              }}
              placeholder="dd.MM.yyyy"
              className="w-[160px]"
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={publishedAt}
                  onSelect={(d) => {
                    setPublishedAt(d);
                    setDateInput(d ? format(d, "dd.MM.yyyy") : "");
                  }}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            {publishedAt && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => { setPublishedAt(undefined); setDateInput(""); }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* AI Right Sidebar */}
      <AIRightSidebar
        editor={tiptapEditor}
        content={form.content}
        categorySlugs={categories?.map((c) => c.slug) || []}
        postId={id}
        onApplyTitle={(title) => {
          updateField("title", title);
          if (!slugManual) updateField("slug", slugify(title));
        }}
        onApplySubtitle={(sub) => updateField("subtitle", sub)}
        onApplyCategory={(slug) => updateField("category_slug", slug)}
        onApplyReadingTime={(min) => updateField("reading_time", min)}
      />
      </>
      )}
      </div>

      {/* Sticky bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex items-center gap-3 px-6 py-3 max-w-5xl mx-auto">
          <Button
            variant={showPreview ? "default" : "outline"}
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? <><PenLine size={14} /> {t("postForm.editor")}</> : <><Eye size={14} /> {t("postForm.preview")}</>}
          </Button>
          <div className="flex-1" />
          <Button onClick={() => save("draft")} variant="outline" disabled={saving}>
            {t("postForm.saveDraft")}
          </Button>
          <Button onClick={() => save("published")} disabled={saving}>
            {isEdit ? t("postForm.updatePublish") : t("postForm.publish")}
          </Button>
          <Button variant="ghost" onClick={() => navigate("/admin/posts")}>
            {t("common.cancel")}
          </Button>
        </div>
      </div>

      <AlertDialog open={featuredConvertConfirm} onOpenChange={setFeaturedConvertConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("postForm.convertFeaturedTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("postForm.convertFeaturedDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConvertFeaturedToWebP}>{t("postForm.convert")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminPostForm;
