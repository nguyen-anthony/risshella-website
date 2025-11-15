// app/lib/twitch.ts
export const TWITCH_AUTH = 'https://id.twitch.tv/oauth2';
export const TWITCH_API = 'https://api.twitch.tv/helix';

export const TWITCH_SCOPES = [
  'user:read:moderated_channels',
  // Optional but handy for contact
  'user:read:email',
].join(' ');

export function getAuthorizeUrl(state: string) {
  const clientId = process.env.TWITCH_CLIENT_ID!;
  const redirectUri = process.env.TWITCH_REDIRECT_URI!;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: TWITCH_SCOPES,
    state,
    force_verify: 'true',
  });
  return `${TWITCH_AUTH}/authorize?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string) {
  const body = new URLSearchParams({
    client_id: process.env.TWITCH_CLIENT_ID!,
    client_secret: process.env.TWITCH_CLIENT_SECRET!,
    code,
    grant_type: 'authorization_code',
    redirect_uri: process.env.TWITCH_REDIRECT_URI!,
  });

  const res = await fetch(`${TWITCH_AUTH}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    cache: 'no-store',
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Failed to exchange token: ${res.status} ${txt}`);
  }
  return res.json() as Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
    scope: string[];
    token_type: 'bearer';
  }>;
}

export async function getTwitchUser(accessToken: string) {
  const res = await fetch(`${TWITCH_API}/users`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Client-Id': process.env.TWITCH_CLIENT_ID!,
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Failed to fetch user: ${res.status} ${txt}`);
  }
  const data = await res.json();
  return (data?.data?.[0] ?? null) as
    | { id: string; login: string; display_name: string; email?: string }
    | null;
}

export async function getModeratedChannels(accessToken: string, userId: string) {
  const url = new URL(`${TWITCH_API}/moderation/channels`);
  url.searchParams.set('user_id', userId);
  url.searchParams.set('first', '100')
  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Client-Id': process.env.TWITCH_CLIENT_ID!,
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Failed to fetch moderated channels: ${res.status} ${txt}`);
  }
  const data = await res.json();
  return (data?.data ?? []) as Array<{
    broadcaster_id: string;
    broadcaster_login: string;
    broadcaster_name: string;
  }>;
}
