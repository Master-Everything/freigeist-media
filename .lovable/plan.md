## Disclaimer im Footer ergänzen

In `src/components/Footer.tsx` einen neuen Disclaimer-Block einfügen, direkt oberhalb der Copyright-Zeile (also innerhalb des `border-t border-border pt-5` Blocks, vor dem `<p>…copyright…</p>`).

### Inhalt
- Überschrift: **Transparenzhinweis / Disclaimer** (klein, uppercase, tracking wie andere Footer-Headings)
- Danach die 6 Absätze wie angegeben, unverändert im Wortlaut, in Deutsch (fest, nicht i18n-übersetzt, da rechtlicher Hinweis vom Nutzer wörtlich vorgegeben)

### Styling
- Container: `max-w-3xl mx-auto` zentriert, `mb-6`
- Text: `text-[11px] text-muted-foreground leading-relaxed font-body`
- Überschrift: `text-xs font-bold text-foreground uppercase tracking-wider mb-3`
- Absätze: `space-y-2`

### Nicht geändert
- Keine i18n-Keys, keine Locale-Files, keine anderen Footer-Bereiche
- Copyright-Zeile bleibt wie sie ist
