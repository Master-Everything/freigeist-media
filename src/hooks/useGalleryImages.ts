import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toAbsoluteUrl } from "@/lib/imageUrl";

export interface GalleryImage {
  name: string;
  url: string;
  size: number; // bytes
  usedInPosts: string[]; // post titles
}

const PAGE_SIZE = 30;

/**
 * Hook that manages gallery images with pagination, post-usage tracking, and deletion.
 */
export function useGalleryImages() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [existingNames, setExistingNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [postUsageMap, setPostUsageMap] = useState<Record<string, string[]>>({});

  /** Build a map: image filename -> list of post titles that use it */
  const buildPostUsageMap = useCallback(async () => {
    const { data: posts } = await supabase
      .from("posts")
      .select("title, content, image_url");

    if (!posts) return {};

    const map: Record<string, string[]> = {};

    const addUsage = (url: string | null, title: string) => {
      if (!url) return;
      const match = url.match(/post-images\/([^?]+)/);
      if (!match) return;
      const filename = decodeURIComponent(match[1]);
      if (!map[filename]) map[filename] = [];
      if (!map[filename].includes(title)) map[filename].push(title);
    };

    for (const post of posts) {
      addUsage(post.image_url, post.title);

      if (post.content) {
        const regex = /post-images\/([^"'?\s)]+)/g;
        let m: RegExpExecArray | null;
        while ((m = regex.exec(post.content)) !== null) {
          const filename = decodeURIComponent(m[1]);
          if (!map[filename]) map[filename] = [];
          if (!map[filename].includes(post.title)) map[filename].push(post.title);
        }
      }
    }

    return map;
  }, []);

  /** Fetch a page of images from storage */
  const fetchPage = useCallback(
    async (pageOffset: number, usageMap: Record<string, string[]>) => {
      const { data: files, error } = await supabase.storage
        .from("post-images")
        .list("", {
          limit: PAGE_SIZE,
          offset: pageOffset,
          sortBy: { column: "created_at", order: "desc" },
        });

      if (error || !files) return { items: [] as GalleryImage[], names: [] as string[], more: false };

      const validFiles = files.filter((f) => !f.name.startsWith("."));
      const names = validFiles.map((f) => f.name);
      const items: GalleryImage[] = validFiles.map((f) => ({
        name: f.name,
        url: toAbsoluteUrl(`post-images/${f.name}`),
        size: (f.metadata as Record<string, unknown>)?.size as number ?? 0,
        usedInPosts: usageMap[f.name] || [],
      }));

      return { items, names, more: validFiles.length === PAGE_SIZE };
    },
    [],
  );

  /** Initial load (resets state) */
  const fetchInitial = useCallback(async () => {
    setLoading(true);
    setOffset(0);
    setImages([]);
    setExistingNames([]);

    const usageMap = await buildPostUsageMap();
    setPostUsageMap(usageMap);

    const { items, names, more } = await fetchPage(0, usageMap);
    setImages(items);
    setExistingNames(names);
    setHasMore(more);
    setOffset(PAGE_SIZE);
    setLoading(false);
  }, [buildPostUsageMap, fetchPage]);

  /** Load more images */
  const fetchMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);

    const { items, names, more } = await fetchPage(offset, postUsageMap);
    setImages((prev) => [...prev, ...items]);
    setExistingNames((prev) => [...prev, ...names]);
    setHasMore(more);
    setOffset((prev) => prev + PAGE_SIZE);
    setLoadingMore(false);
  }, [loadingMore, hasMore, offset, postUsageMap, fetchPage]);

  /** Delete an image from storage and local state */
  const deleteImage = useCallback(async (name: string) => {
    const { error } = await supabase.storage.from("post-images").remove([name]);
    if (error) return false;
    setImages((prev) => prev.filter((img) => img.name !== name));
    setExistingNames((prev) => prev.filter((n) => n !== name));
    return true;
  }, []);

  /** Rename an image: download → upload new → delete old → update post references */
  const renameImage = useCallback(async (oldName: string, newName: string) => {
    // 1. Download
    const { data: blob, error: dlErr } = await supabase.storage.from("post-images").download(oldName);
    if (dlErr || !blob) return false;

    // 2. Upload with new name
    const { error: upErr } = await supabase.storage.from("post-images").upload(newName, blob);
    if (upErr) return false;

    // 3. Delete old
    await supabase.storage.from("post-images").remove([oldName]);

    // 4. Update post references (image_url and content)
    const { data: affectedPosts } = await supabase
      .from("posts")
      .select("id, title, image_url, content")
      .or(`image_url.like.%${oldName}%,content.like.%${oldName}%`);

    if (affectedPosts && affectedPosts.length > 0) {
      for (const post of affectedPosts) {
        const updates: Record<string, string | null> = {};
        if (post.image_url?.includes(oldName)) {
          updates.image_url = post.image_url.split(oldName).join(newName);
        }
        if (post.content?.includes(oldName)) {
          updates.content = post.content.split(oldName).join(newName);
        }
        if (Object.keys(updates).length > 0) {
          await supabase.from("posts").update(updates).eq("id", post.id);
        }
      }
    }

    // 5. Update local state
    const newUrl = toAbsoluteUrl(`post-images/${newName}`);
    setImages((prev) =>
      prev.map((img) =>
        img.name === oldName ? { ...img, name: newName, url: newUrl } : img,
      ),
    );
    setExistingNames((prev) => prev.map((n) => (n === oldName ? newName : n)));

    return true;
  }, []);

  return { images, existingNames, loading, loadingMore, hasMore, fetchInitial, fetchMore, deleteImage, renameImage };
}
