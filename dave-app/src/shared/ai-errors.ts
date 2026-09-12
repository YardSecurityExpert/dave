// Only fixed messages reach the UI; provider errors can include request content.
export function aiErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (/quota|credit|balance|payment|billing|402/i.test(message))
    return "Your AI provider has no available credits. Check its billing page.";
  if (/401|unauthorized|api.?key|authentication|rejected the key/i.test(message))
    return "The AI provider rejected the key. Check it in Settings.";
  if (/429|rate.?limit|concurrency/i.test(message))
    return "The AI provider is busy or rate limited. Try again shortly.";
  if (/model.*(not found|not available|unavailable|access)|404/i.test(message))
    return "The selected model is unavailable for this account. Check Settings.";
  if (/403|access denied|forbidden|refused access/i.test(message))
    return "The AI provider refused access. Check the account and model permissions.";
  return "Ask Dave could not get a response. Check your connection, provider, and model in Settings, then try again.";
}
