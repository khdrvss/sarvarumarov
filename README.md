# Sarvar Umarov Landing Page – Contact to Telegram

Landing page with contact form that sends messages to Telegram via Cloudflare Pages Functions.

## Deploy to Cloudflare Pages

### 1. Push to GitHub
```bash
git clone <repository-url>  # or fork this repo
```

### 2. Create Cloudflare Pages Project
1. In Cloudflare Dashboard: Pages → Create a project → Connect Git
2. Select your GitHub repo
3. Build settings:
   - Framework preset: None
   - Build command: (leave empty)
   - Build output directory: `public`

### 3. Add Environment Variables
After first deploy, go to: Settings → Environment variables → Add:
- `BOT_TOKEN` = your Telegram bot token (from @BotFather)
- `TELEGRAM_CHAT_ID` = your personal chat ID

### 4. Test Deployment
- Visit: `https://your-project.pages.dev/api/health` → should show `bot: true, chat: true`
- Submit the contact form → should receive Telegram message

## Getting Bot Token & Chat ID

### Bot Token
1. Message @BotFather on Telegram
2. Use `/newbot` command and follow instructions
3. Copy the bot token provided

### Chat ID
1. Start conversation with your bot (send any message)
2. Visit: `https://api.telegram.org/bot<BOT_TOKEN>/getUpdates`
3. Find `"chat":{"id":NUMBERS}` - those numbers are your chat ID

## Local Development (Optional)
```bash
npm run pages:dev
```
This runs Wrangler dev server with your functions at `http://localhost:8788`

## API Endpoints
- `POST /api/contact` - Submit contact form
- `GET /api/ping` - Health check
- `GET /api/health` - Environment status

## Form Features
- Phone numbers auto-formatted with `+`
- Telegram usernames auto-prefixed with `@`
- Validation and sanitization
- Responsive design with Tailwind CSS
