import { Link } from "react-router-dom";
import { useAllPosts, useTrashedPosts } from "@/hooks/usePosts";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, Plus, Upload, RotateCcw, Globe } from "lucide-react";
import ArticleThumbnail from "@/components/ArticleThumbnail";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef, useEffect, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import WebsiteImportDialog from "@/components/admin/WebsiteImportDialog";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuthorLookup } from "@/hooks/useAuthorLookup";

const AdminPosts = () => {
  const { data: posts, isLoading } = useAllPosts();
  const { data: trashedPosts, isLoading: trashLoading } = useTrashedPosts();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importingCsv, setImportingCsv] = useState(false);
  const [websiteImportOpen, setWebsiteImportOpen] = useState(false);
  const mdInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const { isAdmin, isEditorialManager } = useUserRole();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Derive unique categories from posts
  const categoryOptions = useMemo(() => {
    if (!posts) return [];
    const seen = new Map<string, string>();
    for (const p of posts) {
      if (p.categories?.slug && !seen.has(p.categories.slug)) {
        seen.set(p.categories.slug, p.categories.name);
      }
    }
    return Array.from(seen.entries()).map(([slug, name]) => ({ slug, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [posts]);

  // Filtered & sorted posts
  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    let result = [...posts];
    if (filterCategory !== "all") {
      result = result.filter((p) => p.categories?.slug === filterCategory);
    }
    if (filterStatus !== "all") {
      result = result.filter((p) => p.status === filterStatus);
    }
    result.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.published_at || a.created_at || "").getTime() - new Date(b.published_at || b.created_at || "").getTime();
        case "az":
          return a.title.localeCompare(b.title);
        case "za":
          return b.title.localeCompare(a.title);
        default: // newest
          return new Date(b.published_at || b.created_at || "").getTime() - new Date(a.published_at || a.created_at || "").getTime();
      }
    });
    return result;
  }, [posts, filterCategory, filterStatus, sortBy]);

  const allCreatedByIds = [
    ...(posts ?? []).map((p) => p.created_by),
    ...(trashedPosts ?? []).map((p) => p.created_by),
  ].filter(Boolean) as string[];
  const { data: authorMap } = useAuthorLookup(allCreatedByIds);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUserId(user?.id ?? null));
  }, []);

  const handleMdImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const name = file.name.toLowerCase();
    if (!name.endsWith(".md") && !name.endsWith(".markdown")) {
      toast({ title: "Error", description: "Please select a Markdown (.md) file.", variant: "destructive" });
      return;
    }

    setImporting(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/import-md`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${session?.access_token}` },
          body: formData,
        }
      );
      const result = await res.json();

      if (!res.ok) {
        toast({ title: "Import failed", description: result.error, variant: "destructive" });
      } else {
        const { created, errors, total } = result;
        queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
        toast({
          title: `Imported ${created.length} of ${total} articles`,
          description: errors.length
            ? `${errors.length} failed: ${errors.map((e: any) => e.title).join(", ")}`
            : "All articles imported as drafts.",
        });
      }
    } catch (err: any) {
      toast({ title: "Import failed", description: err.message, variant: "destructive" });
    } finally {
      setImporting(false);
      if (mdInputRef.current) mdInputRef.current.value = "";
    }
  };

  const handleCsvImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast({ title: "Error", description: "Please select a CSV (.csv) file.", variant: "destructive" });
      return;
    }

    setImportingCsv(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/import-csv`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${session?.access_token}` },
          body: formData,
        }
      );
      const result = await res.json();

      if (!res.ok) {
        toast({ title: "Import failed", description: result.error, variant: "destructive" });
      } else {
        const { created, errors, total } = result;
        queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
        toast({
          title: `Imported ${created.length} of ${total} articles`,
          description: errors.length
            ? `${errors.length} failed: ${errors.map((e: any) => e.title).join(", ")}`
            : "All articles imported as drafts.",
        });
      }
    } catch (err: any) {
      toast({ title: "Import failed", description: err.message, variant: "destructive" });
    } finally {
      setImportingCsv(false);
      if (csvInputRef.current) csvInputRef.current.value = "";
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    setDeleting(id);
    const { error } = await supabase.from("posts").update({ deleted_at: new Date().toISOString() }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Moved to trash", description: "Post can be restored from the Trash tab." });
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      queryClient.invalidateQueries({ queryKey: ["trashed-posts"] });
    }
    setDeleting(null);
  };

  const handleRestore = async (id: string, title: string) => {
    const { error } = await supabase.from("posts").update({ deleted_at: null }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Restored", description: `"${title}" has been restored.` });
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      queryClient.invalidateQueries({ queryKey: ["trashed-posts"] });
    }
  };

  const handlePermanentDelete = async (id: string, title: string) => {
    if (!confirm(`Permanently delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Permanently deleted", description: "Post removed forever." });
      queryClient.invalidateQueries({ queryKey: ["trashed-posts"] });
    }
    setDeleting(null);
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">Posts</h1>
        <div className="flex items-center gap-2">
          {(isAdmin) && (
            <>
              <Button variant="outline" onClick={() => mdInputRef.current?.click()} disabled={importing}>
                <Upload size={14} />
                {importing ? "Importing…" : "Import Markdown"}
              </Button>
              <input ref={mdInputRef} type="file" accept=".md,.markdown" className="hidden" onChange={handleMdImport} />
              <Button variant="outline" onClick={() => csvInputRef.current?.click()} disabled={importingCsv}>
                <Upload size={14} />
                {importingCsv ? "Importing…" : "Import CSV"}
              </Button>
              <input ref={csvInputRef} type="file" accept=".csv" className="hidden" onChange={handleCsvImport} />
              <Button variant="outline" onClick={() => setWebsiteImportOpen(true)}>
                <Globe size={14} />
                Import from Website
              </Button>
            </>
          )}
          <Button asChild>
            <Link to="/admin/posts/new"><Plus size={14} /> New Article</Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="posts">
        <TabsList>
          <TabsTrigger value="posts">Posts ({posts?.length ?? 0})</TabsTrigger>
          {(isAdmin || isEditorialManager) && <TabsTrigger value="trash">Trash ({trashedPosts?.length ?? 0})</TabsTrigger>}
        </TabsList>

        <div className="flex items-center gap-3 my-3 flex-wrap">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[180px] h-9 text-sm">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categoryOptions.map((cat) => (
                <SelectItem key={cat.slug} value={cat.slug}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px] h-9 text-sm">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px] h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="az">Title A–Z</SelectItem>
              <SelectItem value="za">Title Z–A</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground ml-auto">{filteredPosts.length} post{filteredPosts.length !== 1 ? "s" : ""}</span>
        </div>

        <TabsContent value="posts">
          {isLoading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                   <TableRow>
                     <TableHead className="w-[60px]"></TableHead>
                     <TableHead>Title</TableHead>
                     <TableHead>Category</TableHead>
                     <TableHead>Status</TableHead>
                     <TableHead>Date</TableHead>
                     <TableHead className="w-[80px]">Actions</TableHead>
                   </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.map((post) => (
                    <TableRow key={post.id}>
                     <TableCell className="w-[60px] p-2">
                        <Link to={`/admin/posts/${post.id}`} className="cursor-pointer block">
                          <ArticleThumbnail
                            imageUrl={post.image_url}
                            videoUrl={post.video_url}
                            categoryIcon={post.categories?.icon}
                            categoryColor={post.categories?.color}
                            className="w-12 h-12"
                          />
                        </Link>
                      </TableCell>
                     <TableCell className="font-medium max-w-[400px]">
                        <Link to={`/admin/posts/${post.id}`} className="cursor-pointer hover:underline">
                          <div className="truncate">{post.title.length > 60 ? post.title.slice(0, 60) + "…" : post.title}</div>
                        </Link>
                        {post.created_by && authorMap?.[post.created_by] && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {authorMap[post.created_by].displayName}
                            {authorMap[post.created_by].role && ` · ${authorMap[post.created_by].role}`}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {post.categories && (
                          <Badge variant="outline" style={{ borderColor: post.categories.color, color: post.categories.color }}>
                            {post.categories.name}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={post.status === "published" ? "default" : "secondary"}>{post.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        <div className="text-foreground font-medium">{new Date(post.published_at || post.created_at || "").toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" })}</div>
                        <div className="text-xs text-muted-foreground">{new Date(post.published_at || post.created_at || "").toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {(isAdmin || isEditorialManager || (post as any).created_by === currentUserId) && (
                            <Button variant="ghost" size="icon" asChild>
                              <Link to={`/admin/posts/${post.id}`}><Pencil size={14} /></Link>
                            </Button>
                          )}
                          {(isAdmin || isEditorialManager) && (
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id, post.title)} disabled={deleting === post.id}>
                              <Trash2 size={14} className="text-destructive" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="trash">
          {trashLoading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : !trashedPosts?.length ? (
            <p className="text-muted-foreground py-8 text-center">Trash is empty.</p>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                     <TableHead className="w-[60px]"></TableHead>
                     <TableHead>Title</TableHead>
                     <TableHead>Category</TableHead>
                     <TableHead>Deleted</TableHead>
                     <TableHead className="w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trashedPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="w-[60px] p-2">
                        <Link to={`/admin/posts/${post.id}`} className="cursor-pointer block">
                          <ArticleThumbnail
                            imageUrl={post.image_url}
                            videoUrl={post.video_url}
                            categoryIcon={post.categories?.icon}
                            categoryColor={post.categories?.color}
                            className="w-12 h-12"
                          />
                        </Link>
                      </TableCell>
                      <TableCell className="font-medium max-w-[400px]">
                        <Link to={`/admin/posts/${post.id}`} className="cursor-pointer hover:underline">
                          <div className="truncate">{post.title.length > 60 ? post.title.slice(0, 60) + "…" : post.title}</div>
                        </Link>
                        {post.created_by && authorMap?.[post.created_by] && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {authorMap[post.created_by].displayName}
                            {authorMap[post.created_by].role && ` · ${authorMap[post.created_by].role}`}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {post.categories && (
                          <Badge variant="outline" style={{ borderColor: post.categories.color, color: post.categories.color }}>
                            {post.categories.name}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        <div className="text-foreground font-medium">{new Date(post.deleted_at || "").toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" })}</div>
                        <div className="text-xs text-muted-foreground">{new Date(post.deleted_at || "").toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleRestore(post.id, post.title)}>
                            <RotateCcw size={14} className="text-primary" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handlePermanentDelete(post.id, post.title)} disabled={deleting === post.id}>
                            <Trash2 size={14} className="text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
      <WebsiteImportDialog open={websiteImportOpen} onOpenChange={setWebsiteImportOpen} />
    </AdminLayout>
  );
};

export default AdminPosts;
