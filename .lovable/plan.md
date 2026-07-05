# Plan: Speaker-Konzept ins Projekt-Gedächtnis speichern

## Was passiert bei Genehmigung
Genau zwei Schreiboperationen, kein Code, kein Build, keine DB-Änderung:

1. **Neu anlegen:** `mem://features/speaker-composer-integration` — Feature-Memory mit dem vollständigen Konzept (Architektur, festgelegte Entscheidungen, offene Punkte, Composer-Projekt-ID `0207192e-0432-4839-a713-0149cb068298`).
2. **Index erweitern:** `mem://index.md` — ein zusätzlicher Eintrag im Abschnitt *Memories*, der auf die neue Datei verweist und als „KONZEPT (nur für später)" markiert.

## Was gespeichert wird (Inhalt der Gedächtnis-Datei)
- Ausgangslage: zwei getrennte Lovable-Projekte mit eigenem Supabase-Backend; Composer hat `speakers`-Tabelle (auth-scoped); MCP taugt hier nicht (nur Bauzeit-Agenten).
- Fest entschieden: 1 Hauptsprecher pro Artikel via `speaker_slug` (loser String, kein FK); Profilroute **hier** `/speaker/:slug`; nur Konzept, nicht jetzt bauen.
- Architektur: Composer → öffentliche Edge Function `public-speakers` (Liste + Einzelabruf per Slug, keine Auth, CORS offen, cachefähig); Kongress → `speaker_slug`-Feld, Editor-Autocomplete, Route + Hook, „Über den Sprecher"-Block, SEO/JSON-LD `Person`.
- Offen vor dem Bauen: Bild-Hosting, freizugebende Felder, Slug-Quelle im Composer, Multi-Remix/CORS.
- Nächster Schritt: zwei separate Pläne — (a) Composer: Migration + Edge Function, (b) Kongress: Migration + Route + Editor. Composer-Änderungen müssen in dessen eigener Session passieren.

## Was NICHT passiert
- Keine Migration, kein neues DB-Feld, keine Edge Function, keine Route, kein Code im Kongress-Projekt.
- Keine Änderung am Composer-Projekt.
- Das Konzept liegt danach nur dauerhaft im Gedächtnis und ist in künftigen Sessions über den Index auffindbar.

## Warum so
`mem://` ist die einzige Ablage, die sessionsübergreifend erhalten bleibt und per Index automatisch wieder in den Kontext gelangt — genau „für später". `.lovable/plan.md` wäre nur der aktive Plan-Slot und würde beim nächsten echten Plan überschrieben.

---
_Genehmigen = ich speichere jetzt ins Gedächtnis. Danach kannst du gern wieder in den Plan-Modus zurückschalten._