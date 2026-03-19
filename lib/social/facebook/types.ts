export type ConnectionStatus = "disconnected" | "connected" | "reconnect_required" | "error";
export type PostStatus = "draft" | "scheduled" | "publishing" | "published" | "failed" | "paused" | "canceled";
export type LogStatus = "info" | "success" | "warning" | "error";

export type SocialAccountRecord = {
  id: string;
  provider: "facebook";
  admin_user_id: string;
  facebook_user_id: string | null;
  facebook_page_id: string | null;
  page_name: string | null;
  access_token_encrypted: string | null;
  token_type: string | null;
  scopes: string[];
  token_last_validated_at: string | null;
  token_expires_at: string | null;
  connection_status: ConnectionStatus;
  reconnect_required: boolean;
  last_error_message: string | null;
  created_at: string;
  updated_at: string;
};

export type SocialPageRecord = {
  id: string;
  social_account_id: string;
  provider: "facebook";
  facebook_page_id: string;
  page_name: string;
  access_token_encrypted: string;
  token_type: string | null;
  scopes: string[];
  tasks: string[];
  is_selected: boolean;
  connection_status: "connected" | "reconnect_required" | "error";
  reconnect_required: boolean;
  token_last_validated_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SocialTemplateRecord = {
  id: string;
  slug: string;
  title: string;
  category: string;
  hook: string;
  problem: string;
  solution: string;
  necessity: string;
  cta: string;
  short_copy: string;
  medium_copy: string;
  long_copy: string;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type MediaAssetRecord = {
  id: string;
  owner_id: string;
  bucket: string;
  path: string;
  mime_type: string | null;
  file_size: number | null;
  title: string | null;
  alt_text: string | null;
  width: number | null;
  height: number | null;
  created_at: string;
  updated_at: string;
};

export type SocialPostRecord = {
  id: string;
  provider: "facebook";
  social_account_id: string;
  social_page_id: string;
  template_id: string | null;
  media_asset_id: string | null;
  created_by: string | null;
  caption: string;
  status: PostStatus;
  scheduled_for: string | null;
  published_at: string | null;
  facebook_post_id: string | null;
  error_message: string | null;
  is_automated: boolean;
  cta_used: string | null;
  timezone: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  media_assets?: MediaAssetRecord | null;
  social_post_templates?: SocialTemplateRecord | null;
};

export type SocialPostLogRecord = {
  id: string;
  post_id: string | null;
  social_account_id: string | null;
  action: string;
  status: LogStatus;
  message: string;
  provider_response: Record<string, unknown>;
  retry_count: number;
  created_at: string;
};

export type AutomationSettingsRecord = {
  id: string;
  provider: "facebook";
  social_account_id: string;
  enabled: boolean;
  daily_posts_count: number;
  timezone: string;
  scheduled_times: string[];
  use_images: boolean;
  content_categories: string[];
  rotate_templates: boolean;
  avoid_repeat_template: boolean;
  aggressive_cta_enabled: boolean;
  cta_label: string;
  cta_url: string;
  tone: "premium" | "direct" | "aggressive" | "modern";
  offer: string | null;
  market: string | null;
  urgency_level: "low" | "medium" | "high";
  includes_demo: boolean;
  active_services: string[];
  last_automation_run_at: string | null;
  last_successful_post_at: string | null;
  pause_reason: string | null;
  created_at: string;
  updated_at: string;
};

export type FacebookPageOption = {
  id: string;
  name: string;
  accessToken: string;
  tasks: string[];
  category?: string | null;
};
