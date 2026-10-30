import {
  createSession,
  getCookie,
  sessionCookie,
  clearStateCookie
} from "../_lib/auth.js";

const REDIRECT_URI = "https://sphynxweb.pages.dev/oauth/callback";

function fail(message) {
  return Response.redirect(
    `https://sphynxweb.pages.dev/?error=${encodeURIComponent(message)}`,
    302
  );
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");
  const savedState = getCookie(request, "sphynx_oauth_state");

  if (!code || !returnedState || !savedState ||
      returnedState !== savedState) {
    return fail("Invalid Discord login. Please try again.");
  }

  if (!env.DISCORD_CLIENT_ID ||
      !env.DISCORD_CLIENT_SECRET ||
      !env.SESSION_SECRET) {
    return fail("The website login is not configured yet.");
  }

  try {
    const tokenResponse = await fetch(
      "https://discord.com/api/oauth2/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          client_id: env.DISCORD_CLIENT_ID,
          client_secret: env.DISCORD_CLIENT_SECRET,
          grant_type: "authorization_code",
          code,
          redirect_uri: REDIRECT_URI
        })
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      return fail("Discord authorization failed. Please try again.");
    }

    const userResponse = await fetch(
      "https://discord.com/api/users/@me",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`
        }
      }
    );

    const user = await userResponse.json();

    if (!userResponse.ok || !user.id) {
      return fail("Could not verify your Discord account.");
    }

    const session = await createSession(user, env.SESSION_SECRET);

    const headers = new Headers({
      Location: "https://sphynxweb.pages.dev/",
      "Set-Cookie": sessionCookie(session)
    });

    headers.append("Set-Cookie", clearStateCookie());

    return new Response(null, { status: 302, headers });
  } catch (error) {
    return fail("Something went wrong during Discord login.");
  }
}