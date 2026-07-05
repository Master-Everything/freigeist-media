## Ziel
Den über die Editor-Toolbar eingefügten CTA-Button (`a.freigeist-cta`) im Artikelbody um 15% vergrößern — sowohl im Editor als auch in der veröffentlichten Ansicht.

## Änderung
Nur `src/index.css`, Regelblock `.freigeist-cta` (Zeile 714–733). Werte werden proportional um ~15% erhöht:

| Property | Vorher | Nachher (+15%) |
|---|---|---|
| `font-size` | `15px` | `17px` |
| `padding` | `0.875rem 2rem` | `1.006rem 2.3rem` |
| `border-radius` | `0.5rem` | `0.575rem` |
| `box-shadow` y/blur | `0 4px 12px` | `0 5px 14px` |

Hover-Shadow analog von `0 6px 20px` auf `0 7px 23px`. Farben, Gradient, Font-Weight, Hover-Scale und Zentrierungs-Regel bleiben unverändert.

## Nicht betroffen
- Header-CTAs ("Live Calls" / "Zugang anfragen")
- "All News"-Button auf der Startseite
- Toolbar-Buttons im Editor
- `RichTextEditor.tsx` (der eingefügte HTML-Markup bleibt gleich, nur das CSS ändert sich → alte Artikel skalieren automatisch mit)
