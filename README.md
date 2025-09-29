# Sarvar Umarov Landing Page – Contact to Telegram

This adds a minimal Node.js backend that receives the contact form submission and forwards it to a Telegram chat via Bot API.

## 1. Create Telegram Bot
1. Open Telegram, talk to @BotFather
2. /newbot → follow prompts → copy the HTTP API token (BOT_TOKEN)
3. Add the bot to (or start) a chat where you want messages delivered. For a private chat just write any message to the bot so it can send you one back.
4. To get the chat ID quickly:
   - Forward a message from that chat to @userinfobot OR
   - Use https://api.telegram.org/bot<token>/getUpdates after sending a message to the bot and read `chat.id`.

## 2. Environment Variables
Copy `.env.example` to `.env` and fill in:
```
BOT_TOKEN=123456:ABC...      # from BotFather
TELEGRAM_CHAT_ID=123456789   # chat or user id
PORT=3000
ALLOWED_ORIGIN=http://127.0.0.1:5500
```
You may list multiple origins separated by commas or use `*` during local development.

## 3. Install Dependencies
```
npm install
```

## 4. Run Server (development)
```
npm run dev
```
Production:
```
npm start
```
The API listens on `http://localhost:3000`.

## 5. Frontend
`index.html` already contains a script that intercepts the form (`#contactForm`) submit and POSTs JSON to `/api/contact`.

If you serve the HTML via Live Server/VS Code it will POST to the running Node server (ensure CORS origin matches `ALLOWED_ORIGIN`).

## 6. Test with curl (optional)
```
curl -X POST http://localhost:3000/api/contact \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test","phone":"+998900000000","contact":"@username","message":"Salom"}'
```
Expect `{ "ok": true }` and a message in Telegram.

## 7. Notes / Security
- Minimal validation included (length checks). Extend as needed.
- For rate limiting in production add e.g. `express-rate-limit`.
- Do NOT commit your real `.env` to version control.
- If deploying, configure `ALLOWED_ORIGIN` to your real domain.

## 8. Troubleshooting
| Problem | Fix |
|---------|-----|
| 400 with errors | Required fields missing / too short |
| 502 Telegram yuborish xatosi | BOT_TOKEN or CHAT_ID wrong, or Telegram network issue |
| CORS blocked | Ensure `ALLOWED_ORIGIN` matches the page origin |
| No message received | Did you start a chat with bot? Correct chat id? |

---

## Cloudflare Pages Deployment (Functions Based)
The project now includes Cloudflare Pages Functions under `functions/api/*` so you can deploy without running a custom Node server.

### Structure
```
public/               # Static assets (index.html)
functions/api/contact.js  # POST /api/contact
functions/api/ping.js     # GET  /api/ping
functions/api/health.js   # GET  /api/health
```

### Deploy Steps
1. Push repository to GitHub.
2. In Cloudflare Pages: Create project → Connect Git → select repo.
3. Build settings:
   - Framework preset: None
   - Build command: (leave empty)
   - Build output directory: public
4. After first deploy go to: Settings → Environment variables → Add:
   - BOT_TOKEN = your bot token
   - TELEGRAM_CHAT_ID = your personal chat id
5. Redeploy (auto-triggered after saving env vars).

### Local Preview (optional)
If you install Wrangler globally:
```
npm install -D wrangler
npx wrangler pages dev public
```
This will emulate the Pages environment and your functions.

### Curl Test (Cloudflare)
After deploy:
```
curl -X POST https://<your-project>.pages.dev/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","phone":"998901112233","contact":"username","message":"Hi"}'
```
Expect `{ "ok": true }` and Telegram message (phone auto-normalizes to +998901112233, username becomes @username).

### Notes
- `.env` is ignored; production secrets live in Cloudflare env vars.
- `server.js` is no longer required for deployment and can be removed if you rely only on Pages.
- Client JS posts to `/api/contact` (relative) so it works locally (with Node) or on Pages.

## 9. Next Ideas
- Add server-side logging to a file.
- Store leads into a database (e.g. SQLite / Postgres) before sending.
- Add hCaptcha or simple honeypot to reduce spam.

Good luck!
