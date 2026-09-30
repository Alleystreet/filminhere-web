const required = [
  "TEST_BASE_URL",
  "TEST_SUPABASE_URL",
  "TEST_SUPABASE_ANON_KEY",
  "TEST_FILMMAKER_EMAIL",
  "TEST_FILMMAKER_PASSWORD",
  "TEST_HOST_USER_ID",
  "TEST_HOST_LISTING_ID",
];

const missing = required.filter((name) => !process.env[name]?.trim());
if (missing.length) {
  console.error(`Missing required test environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

if (process.env.TEST_ALLOW_WRITE !== "true") {
  console.error(
    "Refusing to create a test booking. Set TEST_ALLOW_WRITE=true only for a dedicated test environment.",
  );
  process.exit(1);
}

const baseUrl = process.env.TEST_BASE_URL.replace(/\/$/, "");
const supabaseUrl = process.env.TEST_SUPABASE_URL.replace(/\/$/, "");
const anonKey = process.env.TEST_SUPABASE_ANON_KEY;
const filmmakerEmail = process.env.TEST_FILMMAKER_EMAIL;
const filmmakerPassword = process.env.TEST_FILMMAKER_PASSWORD;
const expectedHostUserId = process.env.TEST_HOST_USER_ID;
const rawHostListingId = process.env.TEST_HOST_LISTING_ID;

const hostUuid = rawHostListingId
  .replace(/^host_/, "")
  .replace(/^host-/, "");

const listingId = `host_${hostUuid}`;
const listingSlug = `host-${hostUuid}`;

async function jsonOrThrow(response, label) {
  const text = await response.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`${label} returned non-JSON: ${text.slice(0, 500)}`);
    }
  }

  if (!response.ok) {
    throw new Error(
      `${label} failed (${response.status}): ${JSON.stringify(data)}`,
    );
  }

  return data;
}

const auth = await fetch(
  `${supabaseUrl}/auth/v1/token?grant_type=password`,
  {
    method: "POST",
    headers: {
      apikey: anonKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: filmmakerEmail,
      password: filmmakerPassword,
    }),
  },
);

const authData = await jsonOrThrow(auth, "Supabase sign-in");
const accessToken = authData.access_token;
const filmmakerUserId = authData.user?.id;

if (!accessToken || !filmmakerUserId) {
  throw new Error("Supabase sign-in did not return an access token and user id.");
}

if (filmmakerUserId === expectedHostUserId) {
  throw new Error(
    "Test setup is invalid: filmmaker and host user IDs are the same.",
  );
}

const now = Date.now();
const startISO = new Date(now + 24 * 60 * 60 * 1000).toISOString();
const endISO = new Date(now + 26 * 60 * 60 * 1000).toISOString();

const createResponse = await fetch(`${baseUrl}/api/booking/create`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    listingId,
    listingSlug,
    email: filmmakerEmail,
    message: "Automated role-separation integration test",
    startISO,
    endISO,
    impact: null,
  }),
});

const created = await jsonOrThrow(createResponse, "Booking create");
const requestId = created.id;

if (!requestId) {
  throw new Error("Booking create response did not include an id.");
}

const rowResponse = await fetch(
  `${supabaseUrl}/rest/v1/booking_requests?id=eq.${encodeURIComponent(requestId)}&select=id,user_id,host_user_id,listing_id,status,thread_status`,
  {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  },
);

const rows = await jsonOrThrow(rowResponse, "Booking verification read");

if (!Array.isArray(rows) || rows.length !== 1) {
  throw new Error(
    `Expected exactly one readable booking row, got ${JSON.stringify(rows)}`,
  );
}

const row = rows[0];

if (row.user_id !== filmmakerUserId) {
  throw new Error(
    `Wrong filmmaker identity: expected ${filmmakerUserId}, got ${row.user_id}`,
  );
}

if (row.host_user_id !== expectedHostUserId) {
  throw new Error(
    `Wrong host identity: expected ${expectedHostUserId}, got ${row.host_user_id}`,
  );
}

if (row.user_id === row.host_user_id) {
  throw new Error("Role separation failed: filmmaker and host IDs are identical.");
}

if (row.listing_id !== listingId) {
  throw new Error(
    `Wrong listing id: expected ${listingId}, got ${row.listing_id}`,
  );
}

if (row.status !== "PENDING" || row.thread_status !== "draft") {
  throw new Error(
    `Unexpected server-controlled status fields: ${JSON.stringify(row)}`,
  );
}

console.log(
  JSON.stringify(
    {
      result: "PASS",
      requestId,
      filmmakerUserId,
      hostUserId: row.host_user_id,
      listingId: row.listing_id,
      status: row.status,
      threadStatus: row.thread_status,
    },
    null,
    2,
  ),
);
