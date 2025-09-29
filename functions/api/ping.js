export function onRequestGet() {
  return new Response(JSON.stringify({ ok: true, time: Date.now() }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
