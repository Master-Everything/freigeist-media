## Ziel

Der Freigeist-Import soll den WordPress-Subtitle zuverlässig übernehmen. Laut Screenshot steht er direkt unter der Blog-Headline, daher wird diese Position zur höchsten Priorität.

## Umsetzung

### 1. Subtitle-Extraktion priorisieren

In `supabase/functions/import-website/index.ts` passe ich `extractFreigeistExcerpt` so an, dass die Fallback-Reihenfolge lautet:

1. **Direkt unter der H1**: Nach dem ersten Freigeist-/Elementor-H1 wird der unmittelbar folgende Textblock als Subtitle gelesen.
2. **Elementor Excerpt Widget**: Falls vorhanden, wird `theme-post-excerpt` weiterhin unterstützt.
3. **CSS-Klassen-Fallback**: Falls Elementor nur Klassen wie `elementor-widget-theme-post-excerpt` ausgibt.
4. **Meta-Fallback**: `description` / `og:description`, falls im sichtbaren HTML nichts erkannt wird.

### 2. Schutz gegen falsche Treffer

Der H1-Fallback ignoriert bewusst:

- Datum/Autor-Widgets (`post-info`)
- Bilder, Videos, Buttons, Listen und Navigation
- lange Content-Abschnitte, die eindeutig Artikelbody sind

Dadurch wird der kurze Text direkt unter der Überschrift genutzt, nicht versehentlich der erste Absatz des Artikels.

### 3. Speicherung bleibt unverändert

Das bestehende Mapping bleibt:

```ts
subtitle = a.excerpt;
```

und beim Insert:

```ts
subtitle,
```

Es wird also nur die Extraktion robuster und positionsbasiert korrigiert.

### 4. Verifikation

Nach Umsetzung teste ich die Beispiel-URL:

```text
https://freigeist.media/guenter-marc-silber-knappheit-physische-realitaet/
```

Erwarteter Subtitle:

```text
Was physisches Silber heute von Papierwerten unterscheidet – und warum Zeit ein entscheidender Faktor ist.
```

bzw. bei deinem Screenshot-Beispiel:

```text
Was Kurse wirklich bewegt, warum viele Anleger in Crashphasen falsch reagieren.
```

## Nicht enthalten

- Kein Backfill bereits importierter Posts.
- Keine Änderungen an anderen Import-Feldern.
- Keine Datenbankänderung.