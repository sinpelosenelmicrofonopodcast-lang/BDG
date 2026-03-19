import "server-only";

export function getFacebookPublicConfig() {
  return {
    appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID ?? "",
    configured: Boolean(process.env.NEXT_PUBLIC_FACEBOOK_APP_ID)
  };
}

export function getFacebookServerConfig() {
  const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  const graphVersion = process.env.FACEBOOK_GRAPH_VERSION ?? "v22.0";

  if (!appId || !appSecret) {
    throw new Error("Missing Facebook configuration. Set NEXT_PUBLIC_FACEBOOK_APP_ID and FACEBOOK_APP_SECRET.");
  }

  return {
    appId,
    appSecret,
    graphVersion
  };
}

export function getSocialCronSecret() {
  return process.env.SOCIAL_CRON_SECRET ?? "";
}

export function hasSocialCronSecret() {
  return Boolean(process.env.SOCIAL_CRON_SECRET);
}
