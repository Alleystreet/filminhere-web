import type { BookingRequest, BookingStatus, RequestMessage } from "@/lib/types";

const KEY_EMAIL = "filminhere_email_v1";
const KEY_REQUESTS = "filminhere_requests_v1";
const KEY_MESSAGES = "filminhere_messages_v1";

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getSavedEmail(): string {
  return readJSON<string>(KEY_EMAIL, "");
}

export function saveEmail(email: string) {
  writeJSON(KEY_EMAIL, String(email ?? "").trim());
}

export function getRequests(): BookingRequest[] {
  const items = readJSON<BookingRequest[]>(KEY_REQUESTS, []);
  return Array.isArray(items) ? items : [];
}

export function getRequestById(id: string): BookingRequest | undefined {
  return getRequests().find((r) => r.id === id);
}

export function saveRequest(req: BookingRequest) {
  const items = getRequests();
  const idx = items.findIndex((r) => r.id === req.id);
  const next = [...items];

  if (idx >= 0) next[idx] = req;
  else next.unshift(req);

  writeJSON(KEY_REQUESTS, next);
}

export function updateRequest(id: string, patch: Partial<BookingRequest>) {
  const items = getRequests();
  const next = items.map((r) => (r.id === id ? { ...r, ...patch } : r));
  writeJSON(KEY_REQUESTS, next);
}

export function setRequestStatus(requestId: string, status: BookingStatus) {
  updateRequest(requestId, { status });
}

export function getMessagesForRequest(requestId: string): RequestMessage[] {
  const all = readJSON<RequestMessage[]>(KEY_MESSAGES, []);
  const list = (Array.isArray(all) ? all : []).filter((m) => m.requestId === requestId);

  return list.sort((a, b) => {
    const ta = new Date(a.createdISO).getTime();
    const tb = new Date(b.createdISO).getTime();
    return ta - tb;
  });
}

export function addMessage(msg: RequestMessage) {
  const all = readJSON<RequestMessage[]>(KEY_MESSAGES, []);
  const next = Array.isArray(all) ? [...all, msg] : [msg];
  writeJSON(KEY_MESSAGES, next);
}

export function clearAllMvpData() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY_EMAIL);
  window.localStorage.removeItem(KEY_REQUESTS);
  window.localStorage.removeItem(KEY_MESSAGES);
}
