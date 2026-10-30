import { getCookie, readSession } from "../_lib/auth.js";

export async function onRequestGet({ request, env }) {
  const token = getCookie(request, "sphynx_session");
  const user = await readSession(token, env.SESSION_SECRET);

  return Response.json(
    user
      ? {
          authenticated: true,
          id: user.id,
          username: user.username,
          avatar: user.avatar
        }
      : { authenticated: false },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}