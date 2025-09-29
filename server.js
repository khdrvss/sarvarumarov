import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import { body, validationResult } from 'express-validator';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

// Basic security & parsing
app.use(helmet({
  contentSecurityPolicy: false // disable CSP for simplicity; adjust if serving static
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple request logger (can be removed in prod)
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// CORS (adjust ALLOWED_ORIGIN if needed)
const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
app.use(cors({
  origin: allowedOrigin === '*' ? true : allowedOrigin.split(',').map(o => o.trim()),
  methods: ['POST', 'OPTIONS'],
}));

// --- Start of Corrected Routing ---

// Helper: sanitize string
function s(v) {
  return (v || '').toString().trim();
}

function validatePayload({ name, phone, contact, message }) {
  const errors = [];
  if (!name || name.length < 2) errors.push('Ism noto\'g\'ri');
  if (!phone || phone.length < 7) errors.push('Telefon noto\'g\'ri');
  if (!contact) errors.push('Kontakt kerak');
  if (message && message.length > 1000) errors.push('Xabar juda uzun');
  return errors;
}

const apiRouter = express.Router();

// API route for health check
apiRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok', env: { bot_token: !!process.env.BOT_TOKEN, chat_id: !!process.env.TELEGRAM_CHAT_ID } });
});

// API route for ping test
apiRouter.get('/ping', (_req, res) => {
  res.json({ ok: true, time: Date.now() });
});

// API route for contact form
apiRouter.post(
  '/contact',
  // 1. Validation and Sanitization Rules
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Ism 2 va 50 orasida bolishi kerak')
    .escape(),
  body('phone')
    .trim()
    .isLength({ min: 7, max: 20 })
    .withMessage('Telefon raqami 7 va 20 orasida bolishi kerak')
    .matches(/^[+\d()-\s]+$/)
    .withMessage('Telefon raqamida faqat raqamlar, qavslar, chiziqcha va bosh joylar bolishi mumkin')
    .escape(),
  body('contact')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Kontakt (Telegram/Email) 3 va 100 orasida bolishi kerak')
    .escape(),
  body('message')
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Xabar 1000 belgidan oshmasligi kerak')
    .escape(),

  async (req, res, next) => {
    try {
      // 2. Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ ok: false, errors: errors.array().map(e => e.msg) });
      }

      // 3. Proceed with sanitized data and format the output
      const { name, message } = req.body;
      let { phone, contact } = req.body;

      // Add '+' to phone if it's all digits and doesn't start with it
      if (/^\d+$/.test(phone) && !phone.startsWith('+')) {
        phone = `+${phone}`;
      }

      // Add '@' to contact if it's a potential username (no '@' and no '.')
      if (!contact.startsWith('@') && !contact.includes('.')) {
        contact = `@${contact}`;
      }

      const { BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;
      if (!BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        const setupError = new Error('Server is not configured correctly. Missing BOT_TOKEN or TELEGRAM_CHAT_ID in .env file.');
        setupError.status = 500;
        throw setupError;
      }

      const text = [
        `📩 *Yangi xabar*`,
        `👤 *Ism:* ${name}`,
        `📞 *Telefon:* \`${phone}\``,
        `🔗 *Kontakt:* ${contact}`,
        `📝 *Xabar:* ${message || '-'}`
      ].join('\n');

      await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        chat_id: TELEGRAM_CHAT_ID,
        text: text,
        parse_mode: 'Markdown'
      });

      res.json({ ok: true });
    } catch (err) {
      // Pass error to the central error handler
      next(err);
    }
  }
);

// Register all API routes under /api
app.use('/api', apiRouter);

// Serve static files (index.html, etc.) AFTER API routes
app.use(express.static(__dirname));

// Fallback for Single Page Application (SPA) - serves index.html for any non-API GET request
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Central Error Handler: Catches all errors passed with next(err)
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.url} |`, err.message);
  const status = err.status || err.response?.status || 500;
  // Provide a meaningful error message from Telegram if available
  const message = err.response?.data?.description || err.message || 'Internal Server Error';
  res.status(status).json({ ok: false, error: message });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`BOT_TOKEN is set: ${!!process.env.BOT_TOKEN}`);
  console.log(`TELEGRAM_CHAT_ID is set: ${!!process.env.TELEGRAM_CHAT_ID}`);
});

// --- End of Corrected Routing ---
// (The old routing logic below this block is now replaced)
