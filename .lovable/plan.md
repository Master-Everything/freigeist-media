## Ziel

Aus den importierten WordPress-Buttons sollen echte CTA-Buttons werden — mit demselben Look wie im [Freigeist Composer](/projects/0207192e-0432-4839-a713-0149cb068298) (Teal-Gradient, weißer Text, Hover-Scale). **Wichtig:** Beim Import wird der Button-Style nur auf Links angewendet, deren Text Sterne-Icons (✨) enthält — wie z. B. „✨ 👉 Zur Webseite des Saphir Cub ✨". Alle anderen Links bleiben normale Text-Links. Zusätzlich bekommt der Editor einen Toolbar-Button, mit dem sich ein solcher CTA manuell einfügen lässt.

## Umsetzung

### 1. Globaler CTA-Style (`src/index.css`)

Neue Klasse `.freigeist-cta`, identisch zum Composer:

- `display: inline-block`, `border-radius: 0.5rem`
- Gradient `linear-gradient(90deg, #2A809B → #3BB8A8)`
- Padding `0.875rem 2rem`, `font-weight: 700`, `font-size: 15px`
- Weißer Text, kein Underline, Shadow
- Hover: umgekehrter Gradient, `scale(1.05)`, stärkerer Shadow
- Overrides für `.prose` und `.dark .prose-invert`, damit Prose-Defaults (Underline/Farbe) den Button nicht überschreiben — greift in Public-Article und im Editor.
- `p:has(> a.freigeist-cta:only-child) { text-align: center; margin: 2rem 0; }`

### 2. Import: nur Sparkle-Links werden CTAs

In `supabase/functions/import-website/index.ts` (Button-Widget-Replace bei Zeile ~561):

- Button-Text wie bisher extrahieren.
- **Sparkle-Detection:** enthält der Text mindestens ein ✨ (`\u2728`) — oder eine kleine Whitelist verwandter Sparkle-Emojis wie 🌟 `\u1F31F`, ⭐ `\u2B50` — wird der Link als `<p><a class="freigeist-cta" href="…">…</a></p>` gerendert. Die Sparkle-Emojis werden aus dem sichtbaren Button-Label entfernt (der Style bringt die visuelle Prominenz).
- Ohne Sparkle: normaler Link `<p><a href="…" target="_blank" rel="noopener">…</a></p>` — kein CTA-Style.
- Dieselbe Sparkle-Regel zusätzlich auf plain `<a>`-Tags im Body anwenden, falls die Sparkle-Buttons in manchen Posts nicht als Elementor-Button-Widget, sondern als reine Textlinks vorliegen.

### 3. Editor: Klasse erhalten + Toolbar-Button

- `Link.configure` in `src/components/admin/RichTextEditor.tsx` durch eine kleine `Link.extend`-Variante ersetzen, die das `class`-Attribut aus dem HTML parst und beim Rendern erhält — sonst würde TipTap beim Öffnen eines importierten Posts die `freigeist-cta`-Klasse verwerfen.
- Neuer Toolbar-Button „CTA einfügen" (Icon `MousePointerClick` aus lucide, direkt neben dem Link-Button):
  - Wenn Text markiert ist → als Button-Label übernehmen, sonst Platzhalter „Jetzt entdecken".
  - URL via `window.prompt` erfragen (konsistent mit dem bestehenden Link-Button).
  - Fügt `<p><a class="freigeist-cta" href="…" target="_blank" rel="noopener">Label</a></p>` an der Cursor-Position ein.

### 4. Verifikation

- Re-Import der Beispiel-URL `https://freigeist.media/guenter-marc-silber-knappheit-physische-realitaes/` (bzw. Sebastian-Kieser-Post):
  - „✨ 👉 Zur Webseite des Saphir Cub ✨" → Teal-Gradient-Button (zentriert, Sparkles im Label entfernt).
  - Andere Textlinks im Body bleiben normale Links.
- Manuelles Einfügen via neuen Toolbar-Button erzeugt denselben Style.
- Nach Speichern + erneutem Öffnen bleibt der Button-Style im Editor erhalten.

## Nicht enthalten

- Kein Backfill bereits importierter Posts.
- Keine Style-Varianten (Größen/Farben) — ein einziger Freigeist-CTA-Look.
- Keine Änderungen am Composer-Projekt.
