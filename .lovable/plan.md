## Änderung
Enrico (`6192cd40-d190-47f1-abbb-90ab15666a28`) verliert die Rolle `admin` und behält nur `editorial_manager`.

```sql
DELETE FROM public.user_roles
WHERE user_id = '6192cd40-d190-47f1-abbb-90ab15666a28'
  AND role = 'admin';
```