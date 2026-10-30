export async function onRequestGet({ request, env }) {
  if (!env.DISCORD_CLIENT_ID || !env.DISCORD_CLIENT_SECRET) {
    return new Response("Discord OAuth is not configured.", { status: 500 });
  }

  const stateBytes = crypto.getRandomValues(new Uint8Array(32));
  const state = Array.from(stateBytes, b =>
    b.toString(16).padStart(2, "0")
  ).join("");

  const redirectUri = "https://sphynxweb.pages.dev/oauth/callback";

  const params = new URLSearchParams({
    client_id: env.DISCORD_CLIENT_ID,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: "identify guilds",
    state
  });

  const headers = new Headers({
    Location: `https://discord.com/oauth2/authorize?${params}`,
    "Set-Cookie": `sphynx_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`
  });

  return new Response(null, { status: 302, headers });
}