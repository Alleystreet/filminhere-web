import type {
  BookingRequest,
  BookingStatus,
  Message,
  RequestMessage,
  RequestThreadStatus,
} from "../types";

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
    const ta = new Date(a.createdAtISO ?? a.createdISO).getTime();
    const tb = new Date(b.createdAtISO ?? b.createdISO).getTime();
    return ta - tb;
  });
}

export function addMessage(msg: RequestMessage) {
  const all = readJSON<RequestMessage[]>(KEY_MESSAGES, []);
  const next = Array.isArray(all) ? [...all, msg] : [msg];
  writeJSON(KEY_MESSAGES, next);
}

function normalizeThreadStatus(req: BookingRequest): RequestThreadStatus {
  if (req.threadStatus) return req.threadStatus;
  if (req.status === "DECLINED") return "declined";
  if (req.status === "ACCEPTED") return "locked";
  if ((req.lockedHourly ?? 0) > 0) return "locked";
  if ((req.proposedHourly ?? 0) > 0) return "negotiating";
  return "draft";
}

function toThreadMessage(msg: RequestMessage): Message {
  return {
    id: msg.id,
    createdAtISO: msg.createdAtISO ?? msg.createdISO,
    sender: msg.sender === "HOST" ? "host" : msg.sender === "SYSTEM" ? "system" : "producer",
    text: msg.text ?? msg.body,
    kind: msg.kind ?? "message",
  };
}

function toStoredMessage(requestId: string, msg: Message): RequestMessage {
  return {
    id: msg.id,
    requestId,
    sender: msg.sender === "host" ? "HOST" : msg.sender === "system" ? "SYSTEM" : "FILMMAKER",
    body: msg.text,
    createdISO: msg.createdAtISO,
    createdAtISO: msg.createdAtISO,
    text: msg.text,
    kind: msg.kind ?? "message",
  };
}

function withThreadData(req: BookingRequest | undefined): BookingRequest | undefined {
  if (!req) return undefined;

  const thread = getMessagesForRequest(req.id).map(toThreadMessage);
  const mergedById = new Map<string, Message>();
  for (const msg of req.messages ?? []) {
    mergedById.set(msg.id, msg);
  }
  for (const msg of thread) {
    mergedById.set(msg.id, msg);
  }

  const merged = Array.from(mergedById.values()).sort((a, b) => {
    const ta = new Date(a.createdAtISO).getTime() || 0;
    const tb = new Date(b.createdAtISO).getTime() || 0;
    return ta - tb;
  });

  return {
    ...req,
    threadStatus: normalizeThreadStatus(req),
    messages: merged,
  };
}

export function getRequest(id: string): BookingRequest | undefined {
  return withThreadData(getRequestById(id));
}

export function appendMessage(requestId: string, message: Message): BookingRequest | undefined {
  const req = getRequestById(requestId);
  if (!req) return undefined;

  addMessage(toStoredMessage(requestId, message));

  if (normalizeThreadStatus(req) === "draft") {
    updateRequest(requestId, { threadStatus: "sent" });
  }

  return getRequest(requestId);
}

export function updateOffer(requestId: string, proposedHourly: number): BookingRequest | undefined {
  const req = getRequestById(requestId);
  if (!req) return undefined;
  if (!Number.isFinite(proposedHourly) || proposedHourly <= 0) return withThreadData(req);
  if (normalizeThreadStatus(req) === "locked") return withThreadData(req);

  const prev = normalizeThreadStatus(req);
  const nextStatus: RequestThreadStatus =
    prev === "draft" || prev === "declined" ? "sent" : "negotiating";

  updateRequest(requestId, {
    proposedHourly,
    threadStatus: nextStatus,
  });

  appendMessage(requestId, {
    id: `sys_offer_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    createdAtISO: new Date().toISOString(),
    sender: "system",
    text: `Offer proposed at $${proposedHourly}/hr`,
    kind: "offer",
  });

  return getRequest(requestId);
}

export function lockOffer(requestId: string): BookingRequest | undefined {
  const req = getRequestById(requestId);
  if (!req) return undefined;
  if (normalizeThreadStatus(req) === "locked") return withThreadData(req);
  if (!Number.isFinite(req.proposedHourly) || (req.proposedHourly ?? 0) <= 0) return withThreadData(req);

  const lockedHourly = Number(req.proposedHourly);

  updateRequest(requestId, {
    lockedHourly,
    threadStatus: "locked",
  });

  appendMessage(requestId, {
    id: `sys_lock_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    createdAtISO: new Date().toISOString(),
    sender: "system",
    text: `Offer locked at $${lockedHourly}/hr`,
    kind: "system",
  });

  return getRequest(requestId);
}

export function clearAllMvpData() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY_EMAIL);
  window.localStorage.removeItem(KEY_REQUESTS);
  window.localStorage.removeItem(KEY_MESSAGES);
}
