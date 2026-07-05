## Ziel
Beim Import von avis.press-Artikeln darf pro Beitrag nur **eine** Speaker-Box entstehen. Das Speaker-Bild dient als eindeutiges Erkennungsmerkmal.

## Problem
Der aktuelle Detektor in `supabase/functions/import-website/index.ts` (Funktion `renderFreigeistBody`) sucht Bild-Widget + Text-Editor-Widget mit kurzer Namens-Überschrift. Wenn ein Artikel z.B. zwei solcher Paarungen enthält (Speaker + z.B. Interviewer-Bio), entstehen zwei `<aside class="speaker-profile">`-Blöcke.

## Änderung
In `renderFreigeistBody` nach dem bestehenden Speaker-Matching:

1. **Nur der erste Treffer wird zur Speaker-Box.**  
   - Beim ersten gültigen Paar (Bild + Namens-Heading): normale Konvertierung zu `<aside class="speaker-profile">`.
   - Ab dem zweiten Treffer: Match unverändert lassen (fällt zurück auf normale Widget-Rendering-Regeln — Bild bleibt als reguläres `<figure>`, Text bleibt als normaler Absatz mit Heading).

2. **Bild als Identität.**  
   - Nur Paare mit gültigem, nicht-leerem `src` (kein Icon/Placeholder — via bestehender `isIconOrPlaceholder`-Prüfung) werden als Speaker-Box erkannt.
   - Wird eine Speaker-Box gesetzt, wird ihre `src` gespeichert; taucht dieselbe `src` später erneut inline im Body auf, wird das doppelte `<img>` entfernt (analog zur bestehenden Featured-Image-Dedup-Logik).

3. **Logging** erweitern: `speakerPairsFound`, `speakerBoxCreated=0|1`, `duplicateImageStripped=true|false`.

Alles andere (Elementor-Widget-Regeln, Whitelisting, Placeholder-Restore) bleibt unverändert.

## Technische Details
- Datei: `supabase/functions/import-website/index.ts`, Funktion `renderFreigeistBody` (~Zeile 516–552).
- Flag `speakerBoxCreated` innerhalb des `out.replace(pairRe, …)`-Callbacks; nach `true` liefert der Callback für weitere Treffer den unveränderten `match` zurück.
- Nach dem Replace: falls Speaker-Box gesetzt, `out` mit einem präzisen Regex nach weiteren `<img src="<speakerSrc>">` durchsuchen und entfernen.
- `isIconOrPlaceholder(src)` in der Gültigkeitsprüfung mitverwenden.

Keine Änderungen an DB, Editor-Extension oder Front-End nötig.
