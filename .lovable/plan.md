Alle Stundenwerte in `public.time_entries` mit Faktor 1.3 multiplizieren.

```sql
UPDATE public.time_entries SET hours = ROUND(hours * 1.3, 2);
```

Betrifft alle 38 aktuellen Einträge. Status und Blöcke bleiben unverändert.
