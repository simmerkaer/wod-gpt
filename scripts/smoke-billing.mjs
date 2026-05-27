#!/usr/bin/env node
/**
 * Post-deploy smoke test for the billing endpoints.
 *
 * Usage:
 *   node scripts/smoke-billing.mjs https://your-prod-domain
 *   BASE_URL=https://your-prod-domain node scripts/smoke-billing.mjs
 *
 * Exits 0 if everything looks healthy, non-zero otherwise. Safe to run in CI
 * or a deploy hook — it only does an anonymous GET, never charges anything.
 */

const baseUrl = (process.argv[2] || process.env.BASE_URL || "").replace(
  /\/$/,
  "",
);

if (!baseUrl) {
  console.error(
    "Usage: node scripts/smoke-billing.mjs <base-url>\n" +
      "   or: BASE_URL=<base-url> node scripts/smoke-billing.mjs",
  );
  process.exit(2);
}

const statusUrl = `${baseUrl}/api/billing/status`;
const failures = [];
const warnings = [];

function fail(msg) {
  failures.push(msg);
}
function warn(msg) {
  warnings.push(msg);
}

async function main() {
  console.log(`→ GET ${statusUrl}`);

  let res;
  try {
    res = await fetch(statusUrl, { headers: { accept: "application/json" } });
  } catch (e) {
    fail(`Request failed entirely: ${e instanceof Error ? e.message : e}`);
    return;
  }

  if (res.status !== 200) {
    fail(`Expected HTTP 200, got ${res.status}`);
    const text = await res.text().catch(() => "");
    if (text) console.error(`   body: ${text.slice(0, 500)}`);
    return;
  }

  let body;
  try {
    body = await res.json();
  } catch {
    fail("Response was not valid JSON");
    return;
  }

  // Anonymous request: authenticated should be false but the endpoint must
  // still answer with the free-tier shape and (crucially) the plan price.
  if (body.authenticated !== false) {
    warn(
      `Expected authenticated=false for an anonymous request, got ${JSON.stringify(
        body.authenticated,
      )}`,
    );
  }

  if (typeof body.dailyLimit !== "number") {
    warn(`dailyLimit is not a number (got ${JSON.stringify(body.dailyLimit)})`);
  }

  // The plan block is the part most likely to be misconfigured: a test/sandbox
  // STRIPE_PRICE_ID in a live deployment makes Stripe return "no such price"
  // and getPlanInfo() falls back to null.
  const plan = body.plan;
  if (!plan) {
    fail(
      "plan is null — STRIPE_PRICE_ID is missing, wrong, or from a different " +
        "Stripe mode (test vs live) than STRIPE_SECRET_KEY.",
    );
  } else {
    if (typeof plan.unitAmount !== "number" || plan.unitAmount <= 0) {
      fail(`plan.unitAmount looks wrong: ${JSON.stringify(plan.unitAmount)}`);
    }
    if (!plan.currency) {
      fail("plan.currency is missing");
    }
    if (!plan.interval) {
      fail("plan.interval is missing");
    }
    if (failures.length === 0) {
      const amount =
        plan.unitAmount % 100 === 0 && plan.currency.toLowerCase() === "jpy"
          ? plan.unitAmount
          : plan.unitAmount / 100;
      console.log(
        `   plan: ${amount} ${plan.currency.toUpperCase()} / ${plan.interval}`,
      );
    }
  }
}

await main();

for (const w of warnings) console.warn(`⚠️  ${w}`);
for (const f of failures) console.error(`❌ ${f}`);

if (failures.length > 0) {
  console.error(`\nSmoke test FAILED with ${failures.length} error(s).`);
  process.exit(1);
}
console.log("\n✅ Billing smoke test passed.");
process.exit(0);
