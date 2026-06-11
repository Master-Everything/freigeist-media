## Problem
Das Logo `freigeist-logo.png` ist türkis (RGB ~42,128,155) auf transparentem Hintergrund. Die aktuelle CSS-Regel `filter: invert(1)` invertiert die Farbe lediglich (Ergebnis: rötlich/orange), nicht zu Weiß. Die transparenten Bereiche bleiben transparent — daher der Eindruck, das Logo sei "durchscheinend".

## Lösung
In `src/index.css` die Regel für `.dark .logo-invertible` so anpassen, dass alle nicht-transparenten Pixel reinweiß werden — unabhängig von der Ursprungsfarbe:

```css
.dark .logo-invertible {
  filter: brightness(0) invert(1);
}
```

`brightness(0)` setzt alle sichtbaren Pixel auf Schwarz, `invert(1)` macht sie dann zu Weiß. Transparenz bleibt erhalten.

## Geänderte Dateien
- `src/index.css` (Zeilen 549–551)

Keine weiteren Änderungen an Header, Footer oder Logo-Asset nötig.