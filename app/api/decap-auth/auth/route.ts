import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

type HandshakeTemplateParams = {
  provider: string;
  authorizeUrl: string;
  origin: string;
};

type FinalizeTemplateParams = {
  provider: string;
  origin: string;
  payload: Record<string, unknown>;
  error?: string;
};

const STATE_COOKIE_NAME = "decap-auth-state";
const STATE_TTL_SECONDS = 10 * 60; // 10 minutes

const GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";

function generateState() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `state-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

function buildHandshakeHtml({ provider, authorizeUrl, origin }: HandshakeTemplateParams) {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${provider} authentication</title>
  </head>
  <body>
    <script>
      (function () {
        const provider = ${JSON.stringify(provider)};
        const authorizeUrl = ${JSON.stringify(authorizeUrl)};
        const expectedOrigin = ${JSON.stringify(origin)};

        function handleMessage(event) {
          if (event.origin !== expectedOrigin) {
            return;
          }
          if (event.data === 'authorizing:' + provider) {
            window.removeEventListener('message', handleMessage, false);
            window.location.replace(authorizeUrl);
          }
        }

        window.addEventListener('message', handleMessage, false);

        if (window.opener) {
          window.opener.postMessage('authorizing:' + provider, expectedOrigin);
        } else {
          console.warn('Decap CMS OAuth popup has no opener window.');
        }
      })();
    </script>
  </body>
</html>`;
}

function buildFinalizeHtml({ provider, origin, payload, error }: FinalizeTemplateParams) {
  const channel = error ? "error" : "success";
  const messageData = error
    ? JSON.stringify({ message: error })
    : JSON.stringify(payload);

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${provider} authentication</title>
  </head>
  <body>
    <script>
      (function () {
        const provider = ${JSON.stringify(provider)};
        const expectedOrigin = ${JSON.stringify(origin)};
        const channel = ${JSON.stringify(channel)};
        const messageData = ${JSON.stringify(messageData)};

        function notifyParent() {
          if (!window.opener) {
            console.warn('Decap CMS OAuth popup has no opener window.');
            return;
          }
          window.opener.postMessage('authorization:' + provider + ':' + channel + ':' + messageData, expectedOrigin);
          window.close();
        }

        notifyParent();
      })();
    </script>
  </body>
</html>`;
}

function getClientCredentials() {
  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing GitHub OAuth credentials. Please set GITHUB_OAUTH_CLIENT_ID and GITHUB_OAUTH_CLIENT_SECRET environment variables.",
    );
  }

  return { clientId, clientSecret };
}

function buildRedirectUri(request: NextRequest) {
  const url = new URL(request.url);
  return `${url.origin}/api/decap-auth/auth`;
}

function createStateCookie(response: NextResponse, value: string, originUrl: URL) {
  response.cookies.set({
    name: STATE_COOKIE_NAME,
    value,
    httpOnly: true,
    sameSite: "lax",
    path: "/api/decap-auth",
    maxAge: STATE_TTL_SECONDS,
    secure: originUrl.protocol === "https:",
  });
}

function clearStateCookie(response: NextResponse) {
  response.cookies.set({
    name: STATE_COOKIE_NAME,
    value: "",
    path: "/api/decap-auth",
    maxAge: 0,
  });
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const origin = `${url.protocol}//${url.host}`;
  const provider = url.searchParams.get("provider") ?? "github";
  const scope = url.searchParams.get("scope") ?? "repo";
  const code = url.searchParams.get("code");

  if (provider !== "github") {
    return new NextResponse(
      buildFinalizeHtml({
        provider,
        origin,
        payload: {},
        error: `Unsupported provider: ${provider}`,
      }),
      {
        status: 400,
        headers: { "Content-Type": "text/html" },
      },
    );
  }

  const redirectUri = buildRedirectUri(request);

  if (!code) {
    try {
      const { clientId } = getClientCredentials();
  const state = generateState();
      const authorizeUrl = new URL(GITHUB_AUTHORIZE_URL);
      authorizeUrl.searchParams.set("client_id", clientId);
      authorizeUrl.searchParams.set("redirect_uri", redirectUri);
      authorizeUrl.searchParams.set("scope", scope);
      authorizeUrl.searchParams.set("state", state);

      const response = new NextResponse(
        buildHandshakeHtml({ provider, authorizeUrl: authorizeUrl.toString(), origin }),
        {
          status: 200,
          headers: { "Content-Type": "text/html" },
        },
      );

      createStateCookie(response, JSON.stringify({ state, scope }), url);
      return response;
    } catch (error) {
      console.error("Failed to initiate GitHub OAuth flow", error);
      return new NextResponse(
        buildFinalizeHtml({ provider, origin, payload: {}, error: "Server misconfiguration" }),
        { status: 500, headers: { "Content-Type": "text/html" } },
      );
    }
  }

  const storedState = request.cookies.get(STATE_COOKIE_NAME)?.value;
  if (!storedState) {
    return new NextResponse(
      buildFinalizeHtml({ provider, origin, payload: {}, error: "Missing OAuth session" }),
      { status: 400, headers: { "Content-Type": "text/html" } },
    );
  }

  let parsedState: { state: string };
  try {
    parsedState = JSON.parse(storedState);
  } catch {
    return new NextResponse(
      buildFinalizeHtml({ provider, origin, payload: {}, error: "Invalid OAuth session" }),
      { status: 400, headers: { "Content-Type": "text/html" } },
    );
  }

  const incomingState = url.searchParams.get("state");
  if (!incomingState || incomingState !== parsedState.state) {
    return new NextResponse(
      buildFinalizeHtml({ provider, origin, payload: {}, error: "State mismatch" }),
      { status: 400, headers: { "Content-Type": "text/html" } },
    );
  }

  try {
    const { clientId, clientSecret } = getClientCredentials();
    const tokenResponse = await fetch(GITHUB_TOKEN_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        state: incomingState,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(`GitHub token exchange failed with status ${tokenResponse.status}`);
    }

    const tokenJson: { access_token?: string; token_type?: string; scope?: string; error?: string; error_description?: string } =
      await tokenResponse.json();

    if (!tokenJson.access_token) {
      const message = tokenJson.error_description || tokenJson.error || "Unknown error";
      throw new Error(`GitHub token exchange failed: ${message}`);
    }

    const response = new NextResponse(
      buildFinalizeHtml({
        provider,
        origin,
        payload: {
          token: tokenJson.access_token,
          token_type: tokenJson.token_type ?? "Bearer",
          scope: tokenJson.scope ?? scope,
        },
      }),
      { status: 200, headers: { "Content-Type": "text/html" } },
    );

    clearStateCookie(response);
    return response;
  } catch (error) {
    console.error("GitHub OAuth callback failed", error);
    const response = new NextResponse(
      buildFinalizeHtml({ provider, origin, payload: {}, error: "Authentication failed" }),
      { status: 500, headers: { "Content-Type": "text/html" } },
    );
    clearStateCookie(response);
    return response;
  }
}
