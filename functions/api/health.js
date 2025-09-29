export function onRequestGet({ env }) {
  return new Response(JSON.stringify({ status: 'ok', env: { bot: !!env.BOT_TOKEN, chat: !!env.TELEGRAM_CHAT_ID } }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
