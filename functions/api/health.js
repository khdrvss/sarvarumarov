export function onRequestGet({ env }) {
  return new Response(JSON.stringify({ 
    status: 'ok', 
    env: { 
      bot_token: !!env.BOT_TOKEN, 
      chat_id: !!env.TELEGRAM_CHAT_ID 
    } 
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
