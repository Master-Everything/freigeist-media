import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Trash2, Eye } from "lucide-react";

interface FeedbackRow {
  id: string;
  post_id: string | null;
  post_slug: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

const AdminFeedback = () => {
  const { t, i18n } = useTranslation();
  const [rows, setRows] = useState<FeedbackRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<FeedbackRow | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("interview_feedback")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error(error.message);
    } else {
      setRows((data as FeedbackRow[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm(t("adminFeedback.deleteConfirm"))) return;
    const { error } = await (supabase as any)
      .from("interview_feedback")
      .delete()
      .eq("id", id);
    if (error) {
      toast.error(t("adminFeedback.deleteError"));
    } else {
      toast.success(t("adminFeedback.deleted"));
      setRows((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const locale = i18n.language === "de" ? "de-DE" : "en-GB";

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-foreground">
          {t("adminFeedback.title")}
        </h1>
        <p className="mt-2 font-body text-sm text-muted-foreground">
          {t("adminFeedback.subtitle")}
        </p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">{t("common.loading")}</p>
      ) : rows.length === 0 ? (
        <p className="text-muted-foreground">{t("adminFeedback.empty")}</p>
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left">
              <tr>
                <th className="px-4 py-3 font-ui font-medium">{t("adminFeedback.date")}</th>
                <th className="px-4 py-3 font-ui font-medium">{t("adminFeedback.post")}</th>
                <th className="px-4 py-3 font-ui font-medium">{t("adminFeedback.name")}</th>
                <th className="px-4 py-3 font-ui font-medium">{t("adminFeedback.email")}</th>
                <th className="px-4 py-3 font-ui font-medium">{t("adminFeedback.message")}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                    {new Date(r.created_at).toLocaleString(locale, {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/news/${r.post_slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {r.post_slug}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{r.name}</td>
                  <td className="px-4 py-3">
                    <a href={`mailto:${r.email}`} className="text-primary hover:underline">
                      {r.email}
                    </a>
                  </td>
                  <td className="px-4 py-3 max-w-[380px]">
                    <span className="line-clamp-2 text-muted-foreground">{r.message}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <Button variant="ghost" size="sm" onClick={() => setSelected(r)}>
                      <Eye size={14} /> {t("adminFeedback.view")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(r.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selected?.name}</DialogTitle>
            <DialogDescription>
              {selected?.email} —{" "}
              {selected &&
                new Date(selected.created_at).toLocaleString(locale, {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2">
            <Link
              to={selected ? `/news/${selected.post_slug}` : "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              /news/{selected?.post_slug}
            </Link>
          </div>
          <p className="mt-4 whitespace-pre-wrap font-body text-sm leading-relaxed text-foreground">
            {selected?.message}
          </p>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminFeedback;
