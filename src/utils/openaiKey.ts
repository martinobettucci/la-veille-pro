const LOCALSTORAGE_KEY = "openai_api_key";

export function getApiKey(): string | null {
  return localStorage.getItem(LOCALSTORAGE_KEY);
}

export function setApiKey(key: string) {
  localStorage.setItem(LOCALSTORAGE_KEY, key);
}
