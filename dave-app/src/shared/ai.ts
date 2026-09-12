export type AIProvider = "openai" | "featherless";
export const providerNames: Record<AIProvider, string> = {
  openai: "OpenAI",
  featherless: "Featherless",
};
export const defaultModels: Record<AIProvider, string> = {
  openai: "gpt-5.4-mini",
  featherless: "Qwen/Qwen3-30B-A3B-Instruct-2507",
};
export type AIConfiguration = { provider: AIProvider; model: string; apiKey?: string };
