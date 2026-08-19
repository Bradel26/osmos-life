import { clearSessionCookie } from '../../_lib/session.js';

export async function onRequestPost({ request }) {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Set-Cookie': clearSessionCookie(new URL(request.url).protocol === 'https:') }
  });
}
