const required = [
  "TEST_BASE_URL",
  "TEST_SUPABASE_URL",
  "TEST_SUPABASE_PUBLISHABLE_KEY",
  "TEST_SUPABASE_SECRET_KEY",
];

const missing = required.filter((name) => !process.env[name]?.trim());
if (missing.length) {
  console.error(`Missing required test environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

const baseUrl = process.env.TEST_BASE_URL.replace(/\/$/, "");
const supabaseUrl = process.env.TEST_SUPABASE_URL.replace(/\/$/, "");
const publishableKey = process.env.TEST_SUPABASE_PUBLISHABLE_KEY;
const secretKey = process.env.TEST_SUPABASE_SECRET_KEY;

const expectedSupabaseHost = process.env.TEST_EXPECTED_SUPABASE_HOST?.trim();
const forbiddenBaseHost = process.env.TEST_FORBIDDEN_BASE_HOST?.trim();

const actualSupabaseHost = new URL(supabaseUrl).hostname;
const actualBaseHost = new URL(baseUrl).hostname;

if (!expectedSupabaseHost) {
  throw new Error("TEST_EXPECTED_SUPABASE_HOST is required as a non-secret safety guard.");
}

if (actualSupabaseHost !== expectedSupabaseHost) {
  throw new Error(
    `Refusing integration writes: expected Supabase test host ${expectedSupabaseHost}, got ${actualSupabaseHost}.`,
  );
}

if (forbiddenBaseHost && actualBaseHost === forbiddenBaseHost) {
  throw new Error(
    `Refusing integration writes against forbidden Vercel host ${forbiddenBaseHost}.`,
  );
}

const runId = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
const filmmakerEmail = `filminhere-filmmaker-${runId}@example.com`;
const hostEmail = `filminhere-host-${runId}@example.com`;
const filmmakerPassword = `F1h!${crypto.randomUUID()}Aa`;
const hostPassword = `H0s!${crypto.randomUUID()}Bb`;

let filmmakerUserId = null;
let hostUserId = null;
let hostListingId = null;
let requestId = null;

async function parseResponse(response, label) {
  const text = await response.text();
  let data = null;

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

async function adminAuth(path, options = {}) {
  return fetch(`${supabaseUrl}/auth/v1/admin${path}`, {
    ...options,
    headers: {
      apikey: secretKey,
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
}

async function rest(path, options = {}) {
  return fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: secretKey,
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
}

async function createTestUser(email, password, userRole, displayName) {
  const response = await adminAuth("/users", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        user_role: userRole,
        knowledge_level: "professional",
        display_name: displayName,
      },
    }),
  });

  const user = await parseResponse(response, `Create ${userRole} test user`);
  if (!user?.id) {
    throw new Error(`Create ${userRole} test user did not return an id.`);
  }
  return user.id;
}

async function signIn(email, password) {
  const response = await fetch(
    `${supabaseUrl}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: {
        apikey: publishableKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    },
  );

  const auth = await parseResponse(response, "Test filmmaker sign-in");
  if (!auth?.access_token || !auth?.user?.id) {
    throw new Error("Test filmmaker sign-in did not return a token and user id.");
  }
  return auth;
}

async function cleanup() {
  const failures = [];

  async function attempt(label, fn) {
    try {
      await fn();
    } catch (error) {
      failures.push(`${label}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (requestId) {
    await attempt("delete booking request", async () => {
      const response = await rest(
        `booking_requests?id=eq.${encodeURIComponent(requestId)}`,
        { method: "DELETE" },
      );
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
    });
  }

  if (hostListingId) {
    await attempt("delete host listing", async () => {
      const response = await rest(
        `host_listing_submissions?id=eq.${encodeURIComponent(hostListingId)}`,
        { method: "DELETE" },
      );
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
    });
  }

  if (filmmakerUserId) {
    await attempt("delete filmmaker test user", async () => {
      const response = await adminAuth(
        `/users/${encodeURIComponent(filmmakerUserId)}`,
        { method: "DELETE" },
      );
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
    });
  }

  if (hostUserId) {
    await attempt("delete host test user", async () => {
      const response = await adminAuth(
        `/users/${encodeURIComponent(hostUserId)}`,
        { method: "DELETE" },
      );
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
    });
  }

  if (failures.length) {
    console.warn("Cleanup warnings:");
    for (const failure of failures) console.warn(`- ${failure}`);
  }
}

try {
  filmmakerUserId = await createTestUser(
    filmmakerEmail,
    filmmakerPassword,
    "filmmaker",
    "Automated Test Filmmaker",
  );

  hostUserId = await createTestUser(
    hostEmail,
    hostPassword,
    "host",
    "Automated Test Host",
  );

  if (filmmakerUserId === hostUserId) {
    throw new Error("Role separation setup failed: generated user IDs are identical.");
  }

  const listingResponse = await rest(
    "host_listing_submissions?select=id,user_id,title,status",
    {
      method: "POST",
      headers: {
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        user_id: hostUserId,
        listing_type: "Location",
        title: `Automated Role Separation Test ${runId}`,
        description: "Temporary non-production integration-test listing.",
        address: "",
        city: "Test City",
        state: "VA",
        country: "USA",
        rate_per_hour: 100,
        rate_per_day: 800,
        min_hours: 1,
        capacity: 5,
        amenities: "",
        rules_notes: "Delete after automated test.",
        host_email: hostEmail,
        status: "APPROVED",
      }),
    },
  );

  const listings = await parseResponse(listingResponse, "Create approved host listing");
  if (!Array.isArray(listings) || listings.length !== 1 || !listings[0]?.id) {
    throw new Error(
      `Expected one created host listing, got ${JSON.stringify(listings)}`,
    );
  }

  hostListingId = listings[0].id;

  if (listings[0].user_id !== hostUserId) {
    throw new Error(
      `Host listing identity mismatch: expected ${hostUserId}, got ${listings[0].user_id}`,
    );
  }

  const auth = await signIn(filmmakerEmail, filmmakerPassword);

  if (auth.user.id !== filmmakerUserId) {
    throw new Error(
      `Filmmaker sign-in identity mismatch: expected ${filmmakerUserId}, got ${auth.user.id}`,
    );
  }

  const startISO = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const endISO = new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString();

  const createResponse = await fetch(`${baseUrl}/api/booking/create`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${auth.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      listingId: `host_${hostListingId}`,
      listingSlug: `host-${hostListingId}`,
      email: filmmakerEmail,
      message: "Automated role-separation integration test",
      startISO,
      endISO,
      impact: null,
    }),
  });

  const created = await parseResponse(createResponse, "Booking create");
  requestId = created?.id;

  if (!requestId) {
    throw new Error("Booking create response did not include an id.");
  }

  const rowResponse = await rest(
    `booking_requests?id=eq.${encodeURIComponent(requestId)}&select=id,user_id,host_user_id,listing_id,status,thread_status`,
    { method: "GET" },
  );

  const rows = await parseResponse(rowResponse, "Booking verification read");

  if (!Array.isArray(rows) || rows.length !== 1) {
    throw new Error(
      `Expected exactly one booking row, got ${JSON.stringify(rows)}`,
    );
  }

  const row = rows[0];

  if (row.user_id !== filmmakerUserId) {
    throw new Error(
      `Wrong filmmaker identity: expected ${filmmakerUserId}, got ${row.user_id}`,
    );
  }

  if (row.host_user_id !== hostUserId) {
    throw new Error(
      `Wrong host identity: expected ${hostUserId}, got ${row.host_user_id}`,
    );
  }

  if (row.user_id === row.host_user_id) {
    throw new Error("Role separation failed: filmmaker and host IDs are identical.");
  }

  if (row.listing_id !== `host_${hostListingId}`) {
    throw new Error(
      `Wrong listing id: expected host_${hostListingId}, got ${row.listing_id}`,
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
        hostUserId,
        hostListingId,
        status: row.status,
        threadStatus: row.thread_status,
      },
      null,
      2,
    ),
  );
} finally {
  await cleanup();
}
