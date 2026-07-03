## Ziel

1. **Import:** Sparkle-Icons (✨ 🌟 ⭐, ggf. mit 👉) bleiben im Button-Label erhalten — nicht mehr strippen.
2. **Editor:** Der „CTA einfügen"-Toolbar-Button soll standardmäßig ebenfalls Sparkles ums Label setzen, damit manuell eingefügte CTAs denselben Look wie die importierten haben.

## Umsetzung

### 1. `supabase/functions/import-website/index.ts`

- Sparkle-Detection unverändert (entscheidet, ob ein Link zum CTA wird).
- `.replace(SPARKLE_RE, '')` beim Button-Label **entfernen** — Original-Text (inkl. ✨ / 🌟 / ⭐ / 👉) wird 1:1 übernommen, nur außen getrimmt.
- Gilt für Elementor-Button-Widget-Replace **und** Plain-`<a>`-Sparkle-Replace.

### 2. `src/components/admin/RichTextEditor.tsx` — CTA-Toolbar-Button

- Beim Einfügen via „CTA einfügen":
  - Wenn Text markiert ist → als Label übernehmen.
  - Wenn nicht → Platzhalter „Jetzt entdecken".
  - **Neu:** Wenn das Label noch **kein** ✨ enthält, wird es automatisch als `✨ {Label} ✨` gewrappt. Enthält es bereits ein Sparkle-Emoji, bleibt es wie eingegeben (kein Doppel-Wrap).
- URL-Prompt wie bisher.
- Ergebnis: `<p><a class="freigeist-cta" href="…" target="_blank" rel="noopener">✨ Label ✨</a></p>`.

### 3. Verifikation

- Re-Import `guenter-marc-silber-knappheit-physische-realitaes/`: Button zeigt „✨ 👉 Zur Webseite des Saphir Cub ✨".
- Editor: Neuer CTA via Toolbar → Button erscheint mit umschließenden ✨.
- Bereits importierte CTAs (nach Re-Import) sehen im Editor identisch aus.

## Nicht enthalten

- Kein Backfill bereits importierter Posts.
- Keine Style-/Detection-Änderungen.
