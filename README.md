# homerestaurant-web

Frontend di HomeRestaurant: React + Vite + TypeScript + Tailwind CSS.

## Avvio in locale
```bash
cp .env.example .env   # solo la prima volta
npm install
npm run dev            # http://localhost:5173
```
Il backend (`homerestaurant-api`) deve girare su `http://localhost:8000`: la Home mostra "API online" se il collegamento funziona.

## Comandi utili
| Comando | Cosa fa |
|---|---|
| `npm run gen:api` | rigenera `src/api/schema.d.ts` dall'OpenAPI del backend (backend acceso) |
| `npm run lint` | lint (oxlint) |
| `npm run format` | formattazione (Prettier) |
| `npm test` | test (Vitest) |
| `npm run build` | build di produzione in `dist/` |

## Struttura
```
src/
├── api/          # client tipizzato (openapi-fetch) + tipi generati + hook di query
├── features/     # auth (login, token, route protette), meals, bookings: logica per dominio
├── components/   # UI riutilizzabile
├── pages/        # pagine collegate alle route
└── styles/       # token di design (colori, font) in index.css
```
Dopo ogni modifica alle API del backend: `npm run gen:api`. TypeScript segnala cosa va aggiornato.

## Deploy
Vercel: importa la repo, preset Vite, variabile `VITE_API_URL` = URL del backend su Render.
`vercel.json` reindirizza tutte le route a `index.html` (necessario per React Router).
