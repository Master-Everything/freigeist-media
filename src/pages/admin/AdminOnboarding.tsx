import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Copy, Printer, BookOpen, Mail, UserPlus, LogIn, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const LOGIN_URL = "https://6f84d1b9c3e2.igate.pw/admin/login";

const AdminOnboarding = () => {
  const { t } = useTranslation();

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(t("onboarding.markdown", { loginUrl: LOGIN_URL }));
      toast.success(t("common.markdownCopied"));
    } catch {
      toast.error(t("common.copyFailed"));
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-[860px] print:max-w-none">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              {t("onboarding.title")}
            </h1>
            <div className="flex gap-2 print:hidden">
              <Button variant="outline" size="sm" onClick={handleCopyMarkdown}>
                <Copy size={14} /> {t("common.copyMarkdown")}
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer size={14} /> {t("common.exportPdf")}
              </Button>
            </div>
          </div>
          <p className="font-ui text-sm text-muted-foreground">
            {t("onboarding.exportHint")}
          </p>
        </div>

        <Separator />

        {/* Section 1 */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen size={18} className="text-primary" />
            </div>
            <h2 className="font-heading text-lg font-bold tracking-tight text-foreground">
              {t("onboarding.whatIs.title")}
            </h2>
          </div>
          <Card>
            <CardContent className="pt-5">
              <p className="font-ui text-sm text-muted-foreground leading-relaxed">
                {t("onboarding.whatIs.text")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Section 2 */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <UserPlus size={18} className="text-primary" />
            </div>
            <h2 className="font-heading text-lg font-bold tracking-tight text-foreground">
              {t("onboarding.access.title")}
            </h2>
          </div>
          <p className="font-ui text-sm text-muted-foreground leading-relaxed">
            {t("onboarding.access.intro")}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="pt-5 space-y-2">
                <div className="flex items-center gap-2">
                  <Mail size={15} className="text-primary" />
                  <span className="font-heading text-sm font-semibold text-foreground">{t("onboarding.access.option1Title")}</span>
                </div>
                <p className="font-ui text-sm text-muted-foreground leading-relaxed">
                  {t("onboarding.access.option1Text")}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 space-y-2">
                <div className="flex items-center gap-2">
                  <UserPlus size={15} className="text-primary" />
                  <span className="font-heading text-sm font-semibold text-foreground">{t("onboarding.access.option2Title")}</span>
                </div>
                <p className="font-ui text-sm text-muted-foreground leading-relaxed"
                   dangerouslySetInnerHTML={{ __html: t("onboarding.access.option2Text") }} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Section 3 */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <LogIn size={18} className="text-primary" />
            </div>
            <h2 className="font-heading text-lg font-bold tracking-tight text-foreground">
              {t("onboarding.login.title")}
            </h2>
          </div>
          <Card>
            <CardContent className="pt-5 space-y-3">
              <p className="font-ui text-sm text-muted-foreground leading-relaxed">
                {t("onboarding.login.text")}
              </p>
              <div className="bg-muted rounded-md px-4 py-2.5">
                <code className="font-mono text-sm text-foreground">{LOGIN_URL}</code>
              </div>
              <p className="font-ui text-sm text-muted-foreground leading-relaxed">
                {t("onboarding.login.enterCredentials")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Section 4 */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <ArrowRight size={18} className="text-primary" />
            </div>
            <h2 className="font-heading text-lg font-bold tracking-tight text-foreground">
              {t("onboarding.next.title")}
            </h2>
          </div>
          <Card>
            <CardContent className="pt-5">
              <p className="font-ui text-sm text-muted-foreground leading-relaxed"
                 dangerouslySetInnerHTML={{ __html: t("onboarding.next.text") }} />
              <p className="font-ui text-sm text-muted-foreground leading-relaxed mt-3">
                {t("onboarding.next.contact")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOnboarding;
