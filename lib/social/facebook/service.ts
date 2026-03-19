import "server-only";

import { getFacebookServerConfig } from "@/lib/social/facebook/config";
import type { FacebookPageOption } from "@/lib/social/facebook/types";

type FacebookApiErrorPayload = {
  error?: {
    message?: string;
    type?: string;
    code?: number;
    error_subcode?: number;
    fbtrace_id?: string;
  };
  [key: string]: unknown;
};

type TokenValidationResult = {
  isValid: boolean;
  scopes: string[];
  expiresAt: string | null;
};

type FacebookUserProfile = {
  id: string;
  name: string;
};

type FacebookTokenExchangeResult = {
  accessToken: string;
  tokenType: string | null;
  expiresAt: string | null;
};

type CreateFacebookPostInput = {
  pageId: string;
  pageAccessToken: string;
  caption: string;
  image?: {
    data: Blob;
    mimeType?: string | null;
    filename?: string;
  } | null;
};

export class FacebookServiceError extends Error {
  readonly code?: number;
  readonly subcode?: number;
  readonly type?: string;

  constructor(message: string, options?: { code?: number; subcode?: number; type?: string }) {
    super(message);
    this.name = "FacebookServiceError";
    this.code = options?.code;
    this.subcode = options?.subcode;
    this.type = options?.type;
  }

  get isAuthError() {
    return this.code === 190 || this.subcode === 458 || this.subcode === 460 || this.subcode === 463 || this.subcode === 467;
  }
}

function buildGraphUrl(path: string, searchParams?: URLSearchParams) {
  const { graphVersion } = getFacebookServerConfig();
  const url = new URL(`https://graph.facebook.com/${graphVersion}${path}`);

  if (searchParams) {
    url.search = searchParams.toString();
  }

  return url;
}

async function parseFacebookResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => ({}))) as FacebookApiErrorPayload;

  if (!response.ok || payload.error) {
    const error = payload.error;

    throw new FacebookServiceError(error?.message ?? "Facebook API request failed.", {
      code: error?.code,
      subcode: error?.error_subcode,
      type: error?.type
    });
  }

  return payload as T;
}

export async function exchangeUserToken(shortLivedUserToken: string): Promise<FacebookTokenExchangeResult> {
  const { appId, appSecret } = getFacebookServerConfig();
  const params = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: appId,
    client_secret: appSecret,
    fb_exchange_token: shortLivedUserToken
  });
  const response = await fetch(buildGraphUrl("/oauth/access_token", params), { method: "GET", cache: "no-store" });
  const payload = await parseFacebookResponse<{ access_token: string; token_type?: string; expires_in?: number }>(response);

  return {
    accessToken: payload.access_token,
    tokenType: payload.token_type ?? null,
    expiresAt: payload.expires_in ? new Date(Date.now() + payload.expires_in * 1000).toISOString() : null
  };
}

export async function fetchFacebookUser(userAccessToken: string): Promise<FacebookUserProfile> {
  const params = new URLSearchParams({
    fields: "id,name",
    access_token: userAccessToken
  });
  const response = await fetch(buildGraphUrl("/me", params), { method: "GET", cache: "no-store" });

  return parseFacebookResponse<FacebookUserProfile>(response);
}

export async function fetchUserPages(userAccessToken: string): Promise<FacebookPageOption[]> {
  const params = new URLSearchParams({
    fields: "id,name,access_token,category,tasks",
    access_token: userAccessToken
  });
  const response = await fetch(buildGraphUrl("/me/accounts", params), { method: "GET", cache: "no-store" });
  const payload = await parseFacebookResponse<{ data?: Array<{ id: string; name: string; access_token: string; tasks?: string[]; category?: string }> }>(
    response
  );

  return (payload.data ?? []).map((page) => ({
    id: page.id,
    name: page.name,
    accessToken: page.access_token,
    tasks: page.tasks ?? [],
    category: page.category ?? null
  }));
}

export async function validateStoredToken(token: string): Promise<TokenValidationResult> {
  const { appId, appSecret } = getFacebookServerConfig();
  const params = new URLSearchParams({
    input_token: token,
    access_token: `${appId}|${appSecret}`
  });
  const response = await fetch(buildGraphUrl("/debug_token", params), { method: "GET", cache: "no-store" });
  const payload = await parseFacebookResponse<{ data?: { is_valid?: boolean; scopes?: string[]; expires_at?: number } }>(response);
  const data = payload.data;

  return {
    isValid: Boolean(data?.is_valid),
    scopes: data?.scopes ?? [],
    expiresAt: data?.expires_at ? new Date(data.expires_at * 1000).toISOString() : null
  };
}

export async function createFacebookPost(input: CreateFacebookPostInput): Promise<{ post_id?: string; id?: string }> {
  if (input.image) {
    const formData = new FormData();
    formData.append("access_token", input.pageAccessToken);
    formData.append("message", input.caption);
    formData.append("source", input.image.data, input.image.filename ?? "social-image.jpg");

    const response = await fetch(buildGraphUrl(`/${input.pageId}/photos`), {
      method: "POST",
      body: formData,
      cache: "no-store"
    });

    return parseFacebookResponse<{ post_id?: string; id?: string }>(response);
  }

  const body = new URLSearchParams({
    access_token: input.pageAccessToken,
    message: input.caption
  });
  const response = await fetch(buildGraphUrl(`/${input.pageId}/feed`), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body,
    cache: "no-store"
  });

  return parseFacebookResponse<{ post_id?: string; id?: string }>(response);
}
