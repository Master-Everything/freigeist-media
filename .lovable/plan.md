## Fix: Elementor-Divider beim Import ignorieren

In `supabase/functions/import-website/index.ts`, Funktion `cleanHtml` (Zeile 133), **vor** dem generischen `<div>`-Stripping (Zeile 145) einen Vorabschritt einfügen, der Elementor-Divider-Blöcke komplett entfernt (inkl. Inhalt wie `<hr>`, `<svg>`, Separator-Line):

```ts
// Remove Elementor divider widgets entirely (including inner <hr>/<svg>)
s = s.replace(
  /<div[^>]*class=["'][^"']*elementor-widget-divider[^"']*["'][^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/gi,
  ""
);
s = s.replace(
  /<div[^>]*class=["'][^"']*elementor-divider[^"']*["'][^>]*>[\s\S]*?<\/div>/gi,
  ""
);
```

Zusätzlich als Sicherheitsnetz `<hr>` aus der Allowed-Liste (Zeile 148 & 164) rauslassen — steht dort bereits nicht drin, wird also durch das generische Stripping in Zeile 165-167 sowieso entfernt. Damit sollten keine Trennlinien aus Elementor mehr im Import landen.

## Verifikation

- Erneuter Import eines freigeist.media-Posts mit Divider → keine Linien mehr im Body.
- Andere Elemente (Überschriften, Bilder, Videos) unverändert.
