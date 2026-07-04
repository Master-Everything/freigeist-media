## Plan

**Ziel:** Beim Import von Freigeist-Interviews den statischen Feedback-Aufruf + das eingebettete Kontaktformular aus dem Body entfernen, da wir dafür jetzt das eigene `InterviewFeedbackForm` haben.

### Änderungen in `supabase/functions/import-website/index.ts`

In `extractFreigeistArticle` (nach dem Speaker-Block-Handling, bevor das finale `bodyHtml` gebaut wird) einen zusätzlichen Cleanup-Schritt einfügen:

1. **Feedback-Überschrift + Absatz entfernen**
   Entferne jede Überschrift (`<h1>`–`<h4>`) sowie den unmittelbar folgenden `<p>`, wenn der Überschriften-Text (case-insensitive, whitespace-normalisiert) mit `wie hat dir das interview gefallen` beginnt.

2. **Formular-Reste entfernen**
   - Alle `<form>…</form>`-Blöcke droppen.
   - Alle Absätze/Blöcke droppen, die ausschließlich aus Placeholder-Texten bestehen: `dein name`, `deine email-adresse`, `dein feedback zum interview`, `interview feedback absenden` (auch als kombinierter Textknoten `Dein Name Deine Email-Adresse Dein Feedback zum Interview... Interview Feedback absenden`).
   - Alle `<input>`, `<textarea>`, `<button>`-Reste, die vom Sanitizer sowieso raus wären, hier explizit vorher droppen, damit keine leeren Wrapper übrig bleiben.

3. **Leere Wrapper aufräumen**
   Nach dem Entfernen alle danach leer gewordenen `<div>`/`<section>`/`<p>` (nur whitespace/`&nbsp;`) verwerfen — analog zum bestehenden Divider-Cleanup.

4. **Log**
   Ein `feedbackBlockRemoved=yes|no` Feld ins bestehende Import-Log aufnehmen, damit man beim Testimport sofort sieht, ob der Block erkannt wurde.

### Nicht ändern
- `import-md`, `import-csv`, generischer Website-Import.
- Featured-Image-Logik, Speaker-Block-Logik, Divider-Filter.
- Frontend / `InterviewFeedbackForm`.

### Deploy + Verifikation
- `import-website` neu deployen.
- Testimport einer Freigeist-Interview-URL.
- Erwartet: `feedbackBlockRemoved=yes`, im Admin-Editor keine „Wie hat Dir das Interview gefallen"-Passage und keine Formular-Textreste mehr; auf der Public-Article-Page erscheint stattdessen nur das eingebaute `InterviewFeedbackForm`.
