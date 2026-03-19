export type AutomationEnginePlatform = "instagram" | "facebook" | "tiktok" | "x" | "multi-platform";
export type AutoPostStatus = "draft" | "scheduled" | "posted" | "simulated";
export type AutoPostKind = "educational" | "sales" | "video_script";

export type AutoPostRecord = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  content_type: AutoPostKind;
  platform: AutomationEnginePlatform;
  status: AutoPostStatus;
  scheduled_at: string | null;
  performance_score: number | null;
  metadata: {
    platforms?: AutomationEnginePlatform[];
    clicks?: number;
    leads?: number;
    engagement?: number;
    source?: "openai" | "fallback";
    demoState?: "generating" | "scheduled" | "engaging";
  } | null;
  created_at: string;
  updated_at: string;
};

export type AutomationEngineSettingsRecord = {
  id: string;
  provider: "automation_engine";
  user_id: string;
  enabled: boolean;
  timezone: string;
  auto_post_enabled: boolean;
  auto_dm_enabled: boolean;
  auto_reply_enabled: boolean;
  preferred_platforms: AutomationEnginePlatform[];
  preferred_schedule_times: string[];
  auto_reply_message: string;
  auto_dm_message: string;
  simulate_posting: boolean;
  created_at: string;
  updated_at: string;
};

export type GeneratedAutomationPost = {
  title: string;
  content: string;
  contentType: AutoPostKind;
  platform: AutomationEnginePlatform;
  performanceScore: number;
  metrics: {
    engagement: number;
    clicks: number;
    leads: number;
  };
};
