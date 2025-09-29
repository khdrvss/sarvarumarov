export function onRequestGet({ env }) {
  // For debugging why env vars not visible in production.
  // We don't leak values, only presence and length.
  const botVal = env.BOT_TOKEN;
  const chatVal = env.TELEGRAM_CHAT_ID;
  const listedKeys = Object.keys(env || {}).filter(k => /BOT|CHAT/i.test(k));
  return new Response(
    JSON.stringify({
      status: 'ok',
      env: {
        bot: !!botVal,
        chat: !!chatVal,
        bot_len: botVal ? botVal.length : 0,
        chat_len: chatVal ? String(chatVal).length : 0,
        keys: listedKeys
      }
    }),
    { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } }
  );
}
