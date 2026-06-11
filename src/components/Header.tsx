import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Menu, X, ChevronDown, ExternalLink, Sun, Moon, Rss } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { useCategories } from "@/hooks/useCategories";
import { brand } from "@/config/brand";
import SearchDialog from "@/components/SearchDialog";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { data: categories } = useCategories();
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMobileOpen(false);
    setCatOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setCatOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <>
      <header className="sticky top-0 z-50 h-[80px] bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 h-full flex items-center justify-between">
          <Link to="/">
            <img src={brand.logoSrc} alt={brand.logoAlt} className="h-14 w-auto logo-invertible" />
          </Link>

          <nav className="hidden md:flex items-center gap-8 font-ui text-base font-medium">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-md transition-colors ${location.pathname === "/" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
            >
              {t("nav.home")}
            </Link>
            <Link
              to="/news"
              className={`px-3 py-1.5 rounded-md transition-colors ${location.pathname.startsWith("/news") ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
            >
              {t("nav.news")}
            </Link>
            <div ref={catRef} className="relative">
              <button
                onClick={() => setCatOpen(!catOpen)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                {t("nav.categories")} <ChevronDown size={14} className={`transition-transform ${catOpen ? "rotate-180" : ""}`} />
              </button>
              {catOpen && (
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-[560px] bg-card border border-border rounded-lg shadow-lg shadow-black/40 p-5 grid grid-cols-3 gap-3">
                  {categories?.map((cat) => (
                    <Link
                      key={cat.slug}
                      to={`/news?kategorie=${cat.slug}`}
                      className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition-colors font-ui text-xs font-medium text-foreground"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link
              to="/rss"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${location.pathname === "/rss" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
            >
              <Rss size={15} />
              {t("footer.rssFeed")}
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <button
              onClick={toggleTheme}
              className="hidden md:flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted transition-colors text-muted-foreground"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <a
              href={brand.externalLinks.genesisBond.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-primary/40 text-primary text-xs font-semibold uppercase tracking-wider hover:bg-primary/10 hover:border-primary/60 transition-all glow-cyan-hover"
            >
              {brand.externalLinks.genesisBond.label} <ExternalLink size={12} />
            </a>
            <a
              href={brand.externalLinks.marketplace.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-primary/40 text-primary text-xs font-semibold uppercase tracking-wider hover:bg-primary/10 hover:border-primary/60 transition-all glow-cyan-hover"
            >
              {brand.externalLinks.marketplace.label} <ExternalLink size={12} />
            </a>
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted transition-colors text-muted-foreground"
            >
              <Search size={18} />
            </button>
            <button
              className="md:hidden flex items-center justify-center w-10 h-10 text-foreground"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-[60] bg-background overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <img src={brand.logoSrc} alt={brand.logoAlt} className="h-14 w-auto logo-invertible" />
            <button onClick={() => setMobileOpen(false)} className="text-foreground">
              <X size={24} />
            </button>
          </div>
          <nav className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => { setMobileOpen(false); setSearchOpen(true); }}
                className="flex items-center gap-2 font-ui text-lg font-medium text-muted-foreground"
              >
                <Search size={18} /> {t("nav.search")}
              </button>
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted transition-colors text-muted-foreground ml-auto"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
            <Link to="/" className="block font-ui text-lg font-medium text-foreground">{t("nav.home")}</Link>
            <Link to="/news" className="block font-ui text-lg font-medium text-foreground">{t("nav.news")}</Link>
            <a
              href={brand.externalLinks.genesisBond.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 font-ui text-lg font-medium text-primary"
            >
              {brand.externalLinks.genesisBond.label} <ExternalLink size={16} />
            </a>
            <a
              href={brand.externalLinks.marketplace.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 font-ui text-lg font-medium text-primary"
            >
              {brand.externalLinks.marketplace.label} <ExternalLink size={16} />
            </a>
            <div>
              <p className="font-ui text-xs uppercase tracking-wider text-muted-foreground mb-3">{t("nav.categories")}</p>
              <div className="grid grid-cols-2 gap-2">
                {categories?.map((cat) => (
                  <Link
                    key={cat.slug}
                    to={`/news?kategorie=${cat.slug}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition-colors font-ui text-sm text-muted-foreground"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
            <Link to="/rss" className="flex items-center gap-2 font-ui text-lg font-medium text-foreground">
              <Rss size={18} /> {t("footer.rssFeed")}
            </Link>
          </nav>
        </div>
      )}

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
};

export default Header;
