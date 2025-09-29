// Cloudflare Pages Function: /api/contact (POST)
// Also responds to /api/ping (GET) and /api/health (GET) via lightweight handlers in their own files if needed.

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });
}

function sanitize(str = '') {
  return String(str).trim();
}

function normalizePhone(raw = '') {
  let v = raw.replace(/[^0-9+]/g, '');
  if (/^\d{7,15}$/.test(v)) v = '+' + v; // add + if pure digits
  if (!v.startsWith('+')) v = '+' + v.replace(/^\++/, '');
  return v.slice(0, 16);
}

function normalizeContact(raw = '') {
  const v = sanitize(raw);
  if (!v) return v;
  if (v.includes('@') && v.includes('.')) return v; // likely email
  if (!v.startsWith('@')) return '@' + v.replace(/@+/g, '');
  return v;
}

function validate({ name, phone, contact, message }) {
  const errors = [];
  if (!name || name.length < 2 || name.length > 50) errors.push('Ism noto\'g\'ri');
  if (!phone || phone.length < 7) errors.push('Telefon noto\'g\'ri');
  if (!contact) errors.push('Kontakt kerak');
  if (message && message.length > 1000) errors.push('Xabar juda uzun');
  return errors;
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'JSON format xato' }, 400);
  }

  let { name = '', phone = '', contact = '', message = '' } = body;
  name = sanitize(name);
  phone = normalizePhone(phone);
  contact = normalizeContact(contact);
  message = sanitize(message).slice(0, 1000);

  const errors = validate({ name, phone, contact, message });
  if (errors.length) return json({ ok: false, errors }, 400);

  const BOT_TOKEN = env.BOT_TOKEN;
  const CHAT_ID = env.TELEGRAM_CHAT_ID;
  if (!BOT_TOKEN || !CHAT_ID) return json({ ok: false, error: 'Env sozlanmagan' }, 500);

  const text = [
    '📩 *Yangi xabar*',
    `👤 *Ism:* ${name}`,
    `📞 *Telefon:* \`${phone}\``,
    `🔗 *Kontakt:* ${contact}`,
    `📝 *Xabar:* ${message || '-'}`
  ].join('\n');

  const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'Markdown' })
  });

  if (!tgRes.ok) {
    const errTxt = await tgRes.text();
    return json({ ok: false, error: errTxt.slice(0, 200) }, 502);
  }

  return json({ ok: true });
}
