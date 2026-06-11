import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { brand } from "@/config/brand";

const Impressum = () => {
  const { t } = useTranslation();
  return (
  <div className="min-h-screen bg-background">
    <Header />
    <main className="max-w-[820px] mx-auto px-6 pt-10 pb-20">
      <Link to="/" className="inline-flex items-center gap-1.5 font-ui text-[0.85rem] text-muted-foreground hover:text-primary transition-colors mb-6">
        <ArrowLeft size={14} /> {t("legalNotice.back")}
      </Link>
      <h1 className="font-heading text-3xl font-bold text-foreground mb-8">{t("legalNotice.title")}</h1>
      <div className="font-body text-lg leading-relaxed text-body space-y-4">
        <h2 className="font-heading text-xl font-bold text-foreground">{t("legalNotice.publisherHeading")}</h2>
        <p>{t("legalNotice.publisherBody", { brand: brand.name })}</p>

        <p className="font-semibold">{brand.name}</p>
        <p><strong>{t("legalNotice.contactLabel")}:</strong> {brand.contactEmail}</p>

        <h2 className="font-heading text-xl font-bold text-foreground pt-4">{t("legalNotice.disclaimerHeading")}</h2>
        <p>{t("legalNotice.disclaimerBody", { brand: brand.name })}</p>

        <h2 className="font-heading text-xl font-bold text-foreground pt-4">{t("legalNotice.liabilityHeading")}</h2>
        <p>{t("legalNotice.liabilityBody", { brand: brand.name })}</p>

        <h2 className="font-heading text-xl font-bold text-foreground pt-4">{t("legalNotice.ipHeading")}</h2>
        <p>{t("legalNotice.ipBody", { brand: brand.name })}</p>

        <h2 className="font-heading text-xl font-bold text-foreground pt-4">{t("legalNotice.lawHeading")}</h2>
        <p>{t("legalNotice.lawBody")}</p>
      </div>
    </main>
    <Footer />
  </div>
  );
};

export default Impressum;
