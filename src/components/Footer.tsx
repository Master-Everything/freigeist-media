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
    <footer className="border-t border-border py-10 pb-20 bg-muted">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src={brand.logoSrc} alt={brand.logoAlt} className="h-7 w-auto logo-invertible" />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed font-body">
              {t("footer.tagline")}
            </p>
          </div>

          <div>
            <h4 className="font-body text-xs font-bold text-foreground uppercase tracking-wider mb-3">{t("footer.navigation")}</h4>
            <div className="space-y-1.5 text-xs text-muted-foreground font-body">
              <Link to="/" className="block hover:text-primary transition-colors">{t("nav.home")}</Link>
              <Link to="/news" className="block hover:text-primary transition-colors">{t("nav.news")}</Link>
              <span className="block">{t("footer.contact")}</span>
            </div>
          </div>

          <div>
            <h4 className="font-body text-xs font-bold text-foreground uppercase tracking-wider mb-3">{t("footer.legal")}</h4>
            <div className="space-y-1.5 text-xs text-muted-foreground font-body">
              <Link to="/impressum" className="block hover:text-primary transition-colors">{t("footer.legalNotice")}</Link>
              <Link to="/datenschutz" className="block hover:text-primary transition-colors">{t("footer.privacyPolicy")}</Link>
              {isLoggedIn ? (
                <>
                  <Link to="/admin" className="block hover:text-primary transition-colors">{t("footer.admin")}</Link>
                  <button
                    onClick={() => supabase.auth.signOut()}
                    className="block hover:text-primary transition-colors"
                  >
                    {t("common.logout")}
                  </button>
                </>
              ) : (
                <Link to="/admin/login" className="block hover:text-primary transition-colors">{t("common.login")}</Link>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-5">
          <p className="text-[10px] text-muted-foreground text-center font-body">
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
