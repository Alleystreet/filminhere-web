export function normalizeNegotiationText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[​‌‍⁠﻿­]/g, "")          // zero-width / invisible chars
    .replace(/\(at\)|\[at\]/gi, " at ")  // (at) / [at] → at
    .replace(/\(dot\)|\[dot\]/gi, " dot ") // (dot) / [dot] → dot
    .replace(/\s+/g, " ")
    .trim();
}

// 7+ number words consecutive, separated only by spaces, dashes, or "and"
const _NW = "(?:zero|one|two|three|four|five|six|seven|eight|nine)";
const _NS = "[\\s\\-]+(?:and[\\s\\-]+)?";
const CONSECUTIVE_NUM_WORD_RE = new RegExp(`\\b${_NW}(?:${_NS}${_NW}){6,}\\b`, "i");

const BLOCKED_PATTERNS: RegExp[] = [
  // Email addresses
  /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/,
  // 7+ consecutive digits (comma-separated numbers like 1,200,000 are safe)
  /\d{7,}/,
  // Phone-formatted digit groups: spaces/dashes/dots/parens only (commas excluded)
  /\d(?:[\s\-.()+]\d){6,}/,
  // URLs
  /https?:\/\//i,
  /\bwww\./i,
  // @handles
  /@\w+/,
  // Payment platforms
  /\bcash\s*app\b/i,
  /\bvenmo\b/i,
  /\bzelle\b/i,
  /\bpaypal\b/i,
  /\bwire\s+transfer\b/i,
  /\bbank\s+transfer\b/i,
  // Domain obfuscation
  /\bdot\s+com\b/i,
  /\bdot\s+net\b/i,
  /\bdot\s+org\b/i,
  // Email address in word form: "at" followed by "dot" within 50 chars
  /\bat\b.{1,50}\bdot\b/i,
  // Off-platform bypass
  /\boff\b.{0,25}\bplatform\b/i,
  /\boutside\b.{0,15}\bplatform\b/i,
  // Fee avoidance
  /\bavoid\s+fee\b/i,
];

export function containsBlockedNegotiationContent(value: string): boolean {
  const n = normalizeNegotiationText(value);
  if (BLOCKED_PATTERNS.some((re) => re.test(n))) return true;
  if (CONSECUTIVE_NUM_WORD_RE.test(n)) return true;
  return false;
}
