import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { brand } from "@/config/brand";

const Footer = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <footer className="border-t border-border bg-muted pb-20">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-16 md:py-20">
        {/* Top: Brand + Navigation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          {/* Brand */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-2 mb-5">
              <img src={brand.logoSrc} alt={brand.logoAlt} className="h-8 w-auto logo-invertible" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed font-body max-w-sm">
              {t("footer.tagline")}
            </p>
          </div>

          {/* Navigation columns */}
          <div className="lg:col-span-7 grid grid-cols-2 gap-8">
            <div>
              <h4 className="font-body text-xs font-semibold text-foreground uppercase tracking-widest mb-5">
                {t("footer.navigation")}
              </h4>
              <ul className="space-y-3 text-sm text-muted-foreground font-body">
                <li>
                  <Link to="/" className="hover:text-foreground transition-colors">
                    {t("nav.home")}
                  </Link>
                </li>
                <li>
                  <Link to="/news" className="hover:text-foreground transition-colors">
                    {t("nav.news")}
                  </Link>
                </li>
                <li>
                  <span>{t("footer.contact")}</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-body text-xs font-semibold text-foreground uppercase tracking-widest mb-5">
                {t("footer.legal")}
              </h4>
              <ul className="space-y-3 text-sm text-muted-foreground font-body">
                <li>
                  <Link to="/impressum" className="hover:text-foreground transition-colors">
                    {t("footer.legalNotice")}
                  </Link>
                </li>
                <li>
                  <Link to="/datenschutz" className="hover:text-foreground transition-colors">
                    {t("footer.privacyPolicy")}
                  </Link>
                </li>
                {isLoggedIn ? (
                  <>
                    <li>
                      <Link to="/admin" className="hover:text-foreground transition-colors">
                        {t("footer.admin")}
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={() => supabase.auth.signOut()}
                        className="hover:text-foreground transition-colors text-left"
                      >
                        {t("common.logout")}
                      </button>
                    </li>
                  </>
                ) : (
                  <li>
                    <Link to="/admin/login" className="hover:text-foreground transition-colors">
                      {t("common.login")}
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Disclaimer card */}
        <div className="border-t border-border pt-10">
          <div className="bg-background/50 border border-border rounded-lg p-6 sm:p-8 max-w-4xl">
            <h4 className="font-body text-xs font-bold text-foreground uppercase tracking-widest mb-4 flex items-center">
              <span className="w-1.5 h-1.5 bg-foreground rounded-full mr-3" />
              Transparenzhinweis / Disclaimer
            </h4>
            <div className="space-y-3 text-[13px] leading-relaxed text-muted-foreground font-body italic">
              <p>Die Inhalte auf dieser Seite dienen ausschließlich der Information, Inspiration und persönlichen Weiterbildung.</p>
              <p>Einige der in den Beiträgen und Video-Interviews enthaltenen Links sind sogenannte Affiliate-Links. Das bedeutet: Wenn Du über einen dieser Links ein Produkt oder eine Dienstleistung erwirbst, kann eine Provision an uns gezahlt werden – ohne dass Dir dadurch zusätzliche Kosten entstehen.</p>
              <p>Wir empfehlen ausschließlich Inhalte, Produkte oder Angebote, die wir selbst geprüft haben oder als wertvoll im Kontext unserer Themen erachten.</p>
              <p>Die in den Videos und Beiträgen geäußerten Meinungen spiegeln die persönlichen Ansichten der jeweiligen Interviewpartner wider und stellen keine verbindlichen Aussagen oder Garantien dar.</p>
              <p>Es wird keine Haftung für die Aktualität, Richtigkeit oder Vollständigkeit der bereitgestellten Informationen übernommen. Die Umsetzung der Inhalte erfolgt eigenverantwortlich.</p>
              <p>Hinweis: Die Inhalte stellen keine finanzielle, medizinische, rechtliche oder sonstige professionelle Beratung dar.</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-3 text-[11px] text-muted-foreground uppercase tracking-widest font-body">
          <p>{t("footer.copyright", { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
