## Problem
Enrico (User-ID `6192cd40-…`) hat keinen Eintrag in `public.profiles`, weil der `handle_new_user`-Trigger auf `auth.users` nicht existiert. Der Autor-Dialog lädt seine Liste aus `profiles` und zeigt ihn deshalb nicht.

## Fix

Ein Insert in `public.profiles` per Migration:

```sql
INSERT INTO public.profiles (id, display_name)
VALUES ('6192cd40-d190-47f1-abbb-90ab15666a28', 'Enrico Eckebrecht')
ON CONFLICT (id) DO UPDATE SET display_name = EXCLUDED.display_name;
```

Danach erscheint Enrico im Autor-Auswahl-Dialog mit Badge "Admin".

Optional (nicht Teil dieses Fixes, aber Ursache): der `handle_new_user`-Trigger auf `auth.users` müsste separat neu angelegt werden, damit künftig neue User automatisch ein Profil bekommen. Sag Bescheid, wenn ich das gleich mit erledigen soll.