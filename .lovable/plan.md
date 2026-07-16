## Ziel
Projektnamen (`brand.name` = "Freigeist Kongress") in den CSV-Export von `/admin/aufwand` einfügen — im Dateinamen und als Überschriftszeile in der Tabelle.

## Änderungen in `src/pages/admin/AdminAufwand.tsx`

1. `brand` aus `@/config/brand` importieren.
2. In `exportCsv()`:
   - Vor der Header-Zeile eine Titelzeile einfügen: `["Aufwand – Freigeist Kongress"]` gefolgt von einer Leerzeile.
   - Dateiname von `aufwand-YYYY-MM-DD.csv` auf `aufwand-freigeist-kongress-YYYY-MM-DD.csv` ändern (Slug aus `brand.name`: lowercase, Sonderzeichen → `-`).

Keine weiteren Dateien betroffen. Keine Backend-Änderungen.
