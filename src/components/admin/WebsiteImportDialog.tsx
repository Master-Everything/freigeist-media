import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Globe, CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface WebsiteImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ImportResult = {
  created: Array<{ id: string; title: string; slug: string }>;
  errors: Array<{ url: string; title?: string; error: string }>;
  total: number;
};

const WebsiteImportDialog = ({ open, onOpenChange }: WebsiteImportDialogProps) => {
  const [urls, setUrls] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleImport = async () => {
    const urlList = urls
      .split("\n")
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    if (urlList.length === 0) {
      toast({ title: "No URLs", description: "Please enter at least one URL.", variant: "destructive" });
      return;
    }

    setImporting(true);
    setResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/import-website`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ urls: urlList }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast({ title: "Import failed", description: data.error || "Unknown error", variant: "destructive" });
      } else {
        setResult(data);
        queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
        toast({
          title: `Imported ${data.created.length} of ${data.total} articles`,
          description: data.errors.length
            ? `${data.errors.length} failed`
            : "All articles imported as drafts.",
        });
      }
    } catch (err: any) {
      toast({ title: "Import failed", description: err.message, variant: "destructive" });
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    if (!importing) {
      setUrls("");
      setResult(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe size={18} /> Import from Website
          </DialogTitle>
          <DialogDescription>
            Paste article URLs (one per line) to scrape and import them as draft posts with images.
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <>
            <Textarea
              placeholder={"https://freigeist.media/article-slug-1/\nhttps://freigeist.media/article-slug-2/"}
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              rows={8}
              disabled={importing}
              className="font-mono text-xs"
            />
            {importing && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 size={14} className="animate-spin" />
                  Scraping and importing articles… This may take a minute.
                </div>
                <Progress value={undefined} className="h-2" />
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={importing}>
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={importing || !urls.trim()}>
                {importing ? "Importing…" : "Import Articles"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="flex flex-col gap-4 max-h-[70vh]">
            <div className="space-y-4 overflow-y-auto pr-1 -mr-1">
              {result.created.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-primary">
                    ✓ {result.created.length} imported successfully
                  </p>
                  {result.created.map((p) => (
                    <div key={p.id} className="flex items-start gap-2 text-sm text-muted-foreground pl-2">
                      <CheckCircle2 size={12} className="text-primary shrink-0 mt-0.5" />
                      <span className="break-words">{p.title}</span>
                    </div>
                  ))}
                </div>
              )}
              {result.errors.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-destructive">
                    ✗ {result.errors.length} failed
                  </p>
                  {result.errors.map((e, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground pl-2">
                      <XCircle size={12} className="text-destructive shrink-0 mt-0.5" />
                      <span className="break-words">{e.url}: {e.error}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WebsiteImportDialog;
