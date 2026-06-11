import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { brand } from "@/config/brand";

const Datenschutz = () => {
  const { t } = useTranslation();
  return (
  <div className="min-h-screen bg-background">
    <Header />
    <main className="max-w-[820px] mx-auto px-6 pt-10 pb-20">
      <Link to="/" className="inline-flex items-center gap-1.5 font-ui text-[0.85rem] text-muted-foreground hover:text-primary transition-colors mb-6">
        <ArrowLeft size={14} /> {t("privacyPolicy.back")}
      </Link>
      <h1 className="font-heading text-3xl font-bold text-foreground mb-8">{t("privacyPolicy.title")}</h1>
      <div className="font-body text-lg leading-relaxed text-body space-y-4">
        <p>{t("privacyPolicy.intro", { brand: brand.name })}</p>

        <h2 className="font-heading text-xl font-bold text-foreground pt-4">{t("privacyPolicy.publisherHeading")}</h2>
        <p>{t("privacyPolicy.publisherBody", { brand: brand.name, email: brand.contactEmail })}</p>

        <h2 className="font-heading text-xl font-bold text-foreground pt-4">{t("privacyPolicy.collectHeading")}</h2>
        <p>{t("privacyPolicy.collectBody")}</p>

        <h2 className="font-heading text-xl font-bold text-foreground pt-4">{t("privacyPolicy.useHeading")}</h2>
        <p>{t("privacyPolicy.useBody")}</p>

        <h2 className="font-heading text-xl font-bold text-foreground pt-4">{t("privacyPolicy.thirdPartyHeading")}</h2>
        <p>{t("privacyPolicy.thirdPartyBody", { brand: brand.name })}</p>

        <h2 className="font-heading text-xl font-bold text-foreground pt-4">{t("privacyPolicy.retentionHeading")}</h2>
        <p>{t("privacyPolicy.retentionBody")}</p>

        <h2 className="font-heading text-xl font-bold text-foreground pt-4">{t("privacyPolicy.childrenHeading")}</h2>
        <p>{t("privacyPolicy.childrenBody")}</p>

        <h2 className="font-heading text-xl font-bold text-foreground pt-4">{t("privacyPolicy.contactHeading")}</h2>
        <p>{t("privacyPolicy.contactBody", { email: brand.contactEmail })}</p>
      </div>
    </main>
    <Footer />
  </div>
  );
};

export default Datenschutz;
