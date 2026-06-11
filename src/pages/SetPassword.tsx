import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { brand } from "@/config/brand";

const SetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    const hash = (location.state as { hash?: string })?.hash || window.location.hash;
    if (hash.includes("error=")) {
      const params = new URLSearchParams(hash.replace(/^#/, ""));
      const desc = params.get("error_description");
      const code = params.get("error_code");
      if (code === "otp_expired" || desc) {
        setLinkError(
          desc
            ? decodeURIComponent(desc.replace(/\+/g, " "))
            : t("auth.linkExpiredDesc")
        );
      }
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        (event === "SIGNED_IN" ||
          event === "PASSWORD_RECOVERY" ||
          event === "INITIAL_SESSION") &&
        session
      ) {
        setSessionReady(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError(t("auth.passwordMinLength"));
      return;
    }
    if (password !== confirm) {
      setError(t("auth.passwordsMismatch"));
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <p className="font-ui text-lg font-bold tracking-wider text-primary uppercase">{brand.shortName}</p>
          <CardTitle className="text-xl mt-2">{t("auth.setPassword")}</CardTitle>
          <CardDescription>
            {linkError
              ? t("auth.linkInvalid")
              : sessionReady
              ? t("auth.setPasswordDesc")
              : t("auth.processingLink")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {linkError ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-destructive">{linkError}</p>
              <p className="text-sm text-muted-foreground">
                {t("auth.contactAdmin")}
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link to="/admin/login">{t("auth.goToLogin")}</Link>
              </Button>
            </div>
          ) : !sessionReady ? (
            <div className="flex justify-center py-6">
              <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="password"
                placeholder={t("auth.newPassword")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <Input
                type="password"
                placeholder={t("auth.confirmPassword")}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t("auth.saving") : t("auth.savePassword")}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SetPassword;
