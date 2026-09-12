export type ChromeChat = {
  id: string;
  clientId: string;
  tabId: number;
  documentId: string;
  revision: number;
  observedAt: number;
  url: string;
  title: string;
  messages: { role: "user" | "assistant"; text: string }[];
  coverage: string;
  responseState: "responding" | "unknown";
  canDraft: boolean;
};
export type ChromeState = {
  enabled: boolean;
  registered: boolean;
  extensionId: string;
  chats: ChromeChat[];
  error?: string;
};
export type AmbiguousTask = {
  id: string;
  title: string;
  status: string;
  description?: string | null;
};
export type AmbiguousDraft = {
  requestId: string;
  title: string;
  description: string;
};
