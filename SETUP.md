# Pool Lounge - Ghid de instalare

## 1. Descarcă proiectul

Dacă ai acces la fișiere, copiază tot folderul proiectului. Sau descarcă ca ZIP.

## 2. Creează cont Supabase (gratuit)

1. Mergi la https://supabase.com și creează un cont gratuit
2. Click "New Project" → alege un nume (ex: "pool-lounge") → setează o parolă → alege regiunea cea mai apropiată → Click "Create new project"
3. Așteaptă ~2 minute până se creează proiectul

## 3. Configurează baza de date

1. În dashboard-ul Supabase, mergi la **SQL Editor** (din meniul din stânga)
2. Click **New Query**
3. Copiază **TOT** conținutul fișierului `supabase-setup.sql` și lipește-l acolo
4. Click **Run** (butonul verde)
5. Verifică că nu apar erori — ar trebui să vadă mesajul "Success"

## 4. Obține credențialele

1. În dashboard-ul Supabase, mergi la **Settings** → **API**
2. Copiază:
   - **Project URL** (ex: `https://xxxxx.supabase.co`)
   - **anon public** key (ex: `eyJhbGci...`)

## 5. Configurează variabilele de mediu

1. Deschide fișierul `.env` din rădăcina proiectului
2. Înlocuiește valorile cu datele tale de la Supabase:

```
VITE_SUPABASE_URL=https://xxxxx-ta-proiect.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...cheia-ta-anon
```

## 6. Instalează și rulează local

```bash
npm install
npm run dev
```

Deschide http://localhost:5173 în browser.

## 7. Publică pe Netlify

### Varianta simplă (drag & drop):
1. Rulează `npm run build` — se creează folderul `dist/`
2. Mergi la https://app.netlify.com
3. Trage folderul `dist/` în zona de upload

### Varianta persistentă (cu CI/CD):
1. Încarcă proiectul pe GitHub
2. În Netlify → "New site" → "Import from Git" → alege repo-ul
3. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Adaugă variabilele de mediu în Netlify:
   - Site settings → Environment variables → Add:
     - `VITE_SUPABASE_URL` = URL-ul tău
     - `VITE_SUPABASE_ANON_KEY` = cheia ta anon

## Date de autentificare admin

- **URL:** http://site-ul-tau/#/admin
- **Email:** admin@admin.ro
- **Parolă:** 1234

Schimbă-le din Setări după prima autentificare!
