
export async function onRequestGet({ env }) {
  if (!env.DISCORD_CLIENT_ID) {
    return new Response("Discord client ID is missing.", { status: 500 });
  }

  const stateBytes = crypto.getRandomValues(new Uint8Array(32));
  const state = Array.from(stateBytes, b =>
    b.toString(16).padStart(2, "0")
  ).join("");

  const redirectUri =
    "https://sphynxweb.pages.dev/oauth/callback";

  const params = new URLSearchParams({
    client_id: env.DISCORD_CLIENT_ID,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: "identify guilds email",
    state
  });

  return new Response(null, {
    status: 302,
    headers: {
      Location: `https://discord.com/oauth2/authorize?${params}`,
      "Set-Cookie": `sphynx_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
      "Cache-Control": "no-store"
    }
  });
}
