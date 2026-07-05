## Ziel
Beim Website-Import wird Enrico Eckebrecht (`6192cd40-d190-47f1-abbb-90ab15666a28`) fest als Autor (`created_by`) gesetzt.

## Änderung
In `supabase/functions/import-website/index.ts`, im `posts`-Insert (~Zeile 1083) ein Feld ergänzen:

```ts
created_by: "6192cd40-d190-47f1-abbb-90ab15666a28",
```

Analog auch für `import-md` und `import-csv`, damit das Autorenverhalten konsistent ist? → **Nur `import-website`**, weil der User explizit den Website-Import meint. Andere Importer bleiben unverändert.

## Optional (kurz zu prüfen)
Enricos User-ID als Konstante am Dateianfang deklarieren (z.B. `const DEFAULT_AUTHOR_ID = "6192cd40-…"`), damit die ID an einer Stelle steht.

Keine DB-Migration, keine UI-Änderung.
