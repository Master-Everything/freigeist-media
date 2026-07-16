import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogOut, Sun, Moon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { brand } from "@/config/brand";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useProfile();
  const { isAdmin } = useUserRole();
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      <header className="h-14 bg-card border-b border-border flex items-center px-6 justify-between">
        <div className="flex items-center gap-8">
          <Link to="/admin" className="font-ui text-sm font-bold tracking-wider text-primary uppercase">
            {brand.shortName} <span className="text-muted-foreground font-normal">Admin</span>
          </Link>
          <nav className="flex items-center gap-4 font-ui text-sm">
            <Link
              to="/admin"
              className={`transition-colors ${isActive("/admin") ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t("nav.dashboard")}
            </Link>
            {isAdmin && (
              <Link
                to="/admin/project"
                className={`transition-colors ${location.pathname.startsWith("/admin/project") ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
              >
                {t("nav.project")}
              </Link>
            )}
            <Link
              to="/admin/posts"
              className={`transition-colors ${location.pathname.startsWith("/admin/posts") ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t("nav.posts")}
            </Link>
            <Link
              to="/admin/feedback"
              className={`transition-colors ${location.pathname.startsWith("/admin/feedback") ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t("nav.feedback")}
            </Link>
            <Link
              to="/admin/guide"
              className={`transition-colors ${location.pathname.startsWith("/admin/guide") ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t("nav.guide")}
            </Link>
            {isAdmin && (
              <>
                <Link
                  to="/admin/users"
                  className={`transition-colors ${location.pathname.startsWith("/admin/users") ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {t("nav.users")}
                </Link>
                <Link
                  to="/admin/documentation"
                  className={`transition-colors ${location.pathname.startsWith("/admin/documentation") ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {t("nav.docs")}
                </Link>
                <Link
                  to="/admin/changelog"
                  className={`transition-colors ${location.pathname.startsWith("/admin/changelog") ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {t("nav.changelog")}
                </Link>
                <Link
                  to="/admin/work-summary"
                  className={`transition-colors ${location.pathname.startsWith("/admin/work-summary") ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {t("nav.summary")}
                </Link>
                <Link
                  to="/admin/estimate"
                  className={`transition-colors ${location.pathname.startsWith("/admin/estimate") ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {t("nav.estimate")}
                </Link>
                <Link
                  to="/admin/aufwand"
                  className={`transition-colors ${location.pathname.startsWith("/admin/aufwand") ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {t("nav.aufwand")}
                </Link>
                <Link
                  to="/admin/onboarding"
                  className={`transition-colors ${location.pathname.startsWith("/admin/onboarding") ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {t("nav.onboarding")}
                </Link>
              </>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </Button>
          <LanguageSwitcher />
          <Link to="/" className="font-ui text-xs text-muted-foreground hover:text-foreground transition-colors">
            {t("nav.viewSite")}
          </Link>
          {profile?.display_name && (
            <span className="font-ui text-xs text-muted-foreground">{profile.display_name}</span>
          )}
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut size={14} /> {t("common.logout")}
          </Button>
        </div>
      </header>
      <main className="max-w-[1400px] mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
