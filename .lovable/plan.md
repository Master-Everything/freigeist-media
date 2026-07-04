## Logging für Test-Import

Ich baue in `supabase/functions/import-website/index.ts` strukturierte `console.log`-Marker ein, damit wir den nächsten Import via Edge Function Logs Schritt für Schritt validieren können.

### Log-Punkte
Jeweils mit Prefix `[import-website]` und der Ziel-URL, damit filterbar:

1. **Start**: URL, User-Agent-Flag, Timestamp.
2. **Fetch**: HTTP-Status, Content-Length, Ladezeit ms.
3. **Extraktion**: Länge des Roh-HTML, ob Freigeist-/Elementor-Pfad erkannt, gefundener Title, Excerpt-Länge.
4. **cleanHtml**: 
   - Anzahl entfernter Elementor-Divider (Count der Regex-Matches vor Ersetzung).
   - HTML-Länge vor/nach dem Cleaning.
5. **Bilder**: Anzahl gefundener `<img>`, Featured-Image-URL, Anzahl heruntergeladener/hochgeladener Bilder.
6. **Videos**: gefundene Video-Links, erster Video-URL.
7. **Ergebnis**: finale Content-Länge, Anzahl `<h2>`/`<p>`/`<img>` im Body, ob CTA-Button erkannt.
8. **Fehler**: alle Catch-Blöcke loggen Stack + betroffener Schritt.

### Nach dem Testimport
Ich rufe `supabase--edge_function_logs` mit `function_name: "import-website"` ab und fasse zusammen, was extrahiert wurde und ob Divider/CTA/Bilder erwartungsgemäß verarbeitet wurden.

### Aufräumen
Die Logs bleiben permanent drin (leichtgewichtige `console.log`s, kein PII) — falls du sie später entfernt haben willst, sag Bescheid.
