import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, CheckCircle, FileEdit } from "lucide-react";

const AdminDashboard = () => {
  const { profile } = useProfile();
  const { t } = useTranslation();
  const [stats, setStats] = useState({ total: 0, published: 0, drafts: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const { count: total } = await supabase.from("posts").select("*", { count: "exact", head: true });
      const { count: published } = await supabase.from("posts").select("*", { count: "exact", head: true }).eq("status", "published");
      const { count: drafts } = await supabase.from("posts").select("*", { count: "exact", head: true }).eq("status", "draft");
      setStats({ total: total || 0, published: published || 0, drafts: drafts || 0 });
    };
    fetchStats();
  }, []);

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-foreground">{t("dashboard.title")}</h1>
        <p className="font-ui text-sm text-muted-foreground mt-1">{t("dashboard.welcome", { name: profile?.display_name || "..." })}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboard.totalArticles")}</CardTitle>
            <FileText size={16} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboard.published")}</CardTitle>
            <CheckCircle size={16} className="text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{stats.published}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboard.drafts")}</CardTitle>
            <FileEdit size={16} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.drafts}</p>
          </CardContent>
        </Card>
      </div>

      <Button asChild>
        <Link to="/admin/posts">
          {t("dashboard.goToPosts")} <ArrowRight size={14} />
        </Link>
      </Button>
    </AdminLayout>
  );
};

export default AdminDashboard;
