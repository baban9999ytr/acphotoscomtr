export type ContentConfig =
  | {
      mode: "local";
      requestedMode: "local" | "supabase" | "invalid";
      reason: string | null;
    }
  | {
      mode: "supabase";
      requestedMode: "supabase";
      url: string;
      key: string;
      reason: null;
    };
export function demoAdminEnabled(config: ContentConfig): boolean;
export function resolveContentConfig(input: {
  source?: string;
  legacyMode?: string;
  url?: string;
  key?: string;
}): ContentConfig;
export function runtimeContentConfig(): ContentConfig;
