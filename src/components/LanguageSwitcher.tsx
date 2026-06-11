import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const current = i18n.language;

  return (
    <div className="flex items-center rounded-md border border-border text-xs font-ui overflow-hidden">
      <button
        onClick={() => i18n.changeLanguage("en")}
        className={`px-2 py-1 transition-colors ${current === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
      >
        EN
      </button>
      <button
        onClick={() => i18n.changeLanguage("de")}
        className={`px-2 py-1 transition-colors ${current === "de" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
      >
        DE
      </button>
    </div>
  );
};

export default LanguageSwitcher;
