## Ziel
Neuen User **Enrico Eckebrecht** (enricoecke@yahoo.de) anlegen mit Rollen **admin** + **editorial_manager**, Passwort `IchmeldeFGan123+`.

## Vorgehen

Eine Migration, die:

1. Auth-User in `auth.users` anlegt (E-Mail bestätigt, bcrypt-Passwort via `crypt()`) plus passenden `auth.identities`-Eintrag.
2. Der Trigger `handle_new_user` erzeugt automatisch den `profiles`-Eintrag; Display-Name wird danach auf "Enrico Eckebrecht" gesetzt.
3. In `public.user_roles` die Rollen `admin` und `editorial_manager` zuweisen.

## SQL

```sql
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change,
  email_change_token_new, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(), 'authenticated', 'authenticated',
  'enricoecke@yahoo.de',
  crypt('IchmeldeFGan123+', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Enrico Eckebrecht"}',
  now(), now(), '', '', '', ''
);

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, created_at, updated_at, last_sign_in_at)
SELECT gen_random_uuid(), u.id, u.id::text,
       jsonb_build_object('sub', u.id::text, 'email', u.email),
       'email', now(), now(), now()
FROM auth.users u WHERE u.email = 'enricoecke@yahoo.de';

UPDATE public.profiles SET display_name = 'Enrico Eckebrecht'
WHERE id = (SELECT id FROM auth.users WHERE email = 'enricoecke@yahoo.de');

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE email = 'enricoecke@yahoo.de'
UNION ALL
SELECT id, 'editorial_manager'::app_role FROM auth.users WHERE email = 'enricoecke@yahoo.de';
```

Nach der Migration kann Enrico sich sofort einloggen.