# Lawn Care Profit &amp; Capacity Benchmark Calculator

A web-based **benchmark tool** for **Local Service Pro**. Australian lawn care operators
answer a short 3-step wizard and get an instant, screenshot-friendly report — how they
compare on revenue, pricing, **average $/job**, **$/hour on the tools**, leads and capacity.
There is **no sales pitch**: the value to the user is seeing their own numbers clearly, while
contributing (anonymously) to an industry benchmark that helps every operator price with
confidence.

`lawn-care-dashboard/index.html` — single file, zero dependencies, dark-mode, mobile-first.

![type: benchmark tool](https://img.shields.io/badge/type-benchmark%20tool-34d67c) ![stack: vanilla HTML/CSS/JS](https://img.shields.io/badge/stack-vanilla%20HTML%2FCSS%2FJS-21b865)

## Positioning

> A rising tide lifts all boats. When enough operators share real numbers, we can publish an honest benchmark — and stop the race to the bottom where people undercharge until no one makes a profit.

For operators doing roughly **$60k–$250k/year** — solo, part-time, shift-worker or small team.

## What it does

1. **Business type** — Solo / Part-Time / Shift Worker / Planning to hire / Already has staff / Team. Drives a **Solo Operator** vs **Team Business** report.
2. **Your numbers** — revenue, enquiries, lead source, pricing, close/recurring/churn sliders, recurring clients, jobs/week, owner & admin hours, staff, VA — with editable advanced assumptions.
3. **Contact details (last)** — name, email, phone, business, website, state, service area — collected only after the operator has entered their numbers, so the report can be emailed once the benchmark reaches 1,000 submissions.
4. **Instant report**, including:
   - **Current snapshot** (revenue/hour, capacity used, close & recurring rates…)
   - **Rates spotlight** — headline **average $/job** and **$/hour on the tools** (the core industry-benchmark numbers), framed around not undercharging.
   - **Growth potential** — revenue gap, recurring clients needed at $100 *and* $120/job, extra weekly enquiries, marketing (3%) & systems (2%) guide-rail budgets.
   - **Profit-first allocation** — solo vs team target buckets, with **Staff Wages as its own bucket** and "Operating Expenses" renamed **Equipment &amp; Running Costs**.
   - **Capacity stack** — Owner only → + Part-time employee → + VA/admin → lead-flow-filled potential, with net $ after wages/VA.
   - **What your numbers suggest** — a neutral focus stage (Foundation / Lead Flow / Systems / Capacity / Team Growth) with best-practice guidance, **not** product pitches.
   - **Rising-tide closing** — confirms their numbers are now in the benchmark and invites them to share the tool.
5. **Structured submission** POSTed to your endpoint (lead + numbers + calculated results + benchmark summary + email segments).

## Profit-first target models

| Bucket | Solo / owner-only | Team / growth |
|---|---|---|
| Owner Pay | 50% | 45% |
| Staff Wages | 0% | 15% |
| Equipment &amp; Running Costs | 20% | 18% |
| Tax / GST Buffer | 15% | 12% |
| Profit | 10% | 5% |
| Marketing | 3% | 3% |
| Systems &amp; Tech | 2% | 2% |

**Equipment &amp; Running Costs** = mower maintenance, fuel, insurance, rego, tools, repairs, trailer, equipment replacement, materials.
**Staff Wages** = employee wages, casual labour, super, payroll costs (kept separate so labour profitability is visible).

## Default assumptions (all editable in the form)

| Assumption | Default |
|---|---|
| Average job value | $120 |
| Visits per recurring client / yr | 20 |
| Close rate | 40% |
| Recurring conversion | 40% |
| Annual churn | 40% |
| Part-time capacity | 25 hrs/wk |
| Part-time efficiency | 75% of owner |
| VA / admin support | 10 hrs/wk |
| VA cost | $20/hr |
| Super guarantee | 12% |
| Working weeks / year | 48 |
| Marketing target | 3% of revenue |
| Systems target | 2% of revenue |

## Benchmark categories (insight only — no offers attached)

| Category | Trigger (simplified) | Neutral guidance focus |
|---|---|---|
| Foundation Stage | No website / weak digital + low leads | Be findable & trusted; capture every enquiry |
| Lead Flow Stage | Has site, inconsistent enquiries | Attract higher-intent leads; grow reviews |
| Systems Stage | Getting leads, losing time in admin | Respond fast; follow up quotes; know your numbers |
| Capacity Stage | Demand &gt; production capacity | Lift pricing; add help; tighten routing |
| Team Growth Stage | Staff/planning + higher revenue | Check labour profitability; strengthen lead flow first |

## Wiring it up

Edit the `CONFIG` block at the top of the `<script>` in `index.html`:

```js
const CONFIG = {
  SUBMIT_ENDPOINT: "",   // JSON POST destination (Formspree / Apps Script / Zapier / your API)
  REPORT_BATCH: 1000,    // new benchmark published every N submissions
  BASE_COUNT: 0          // optional starting number for the public counter
};
```

Leave `SUBMIT_ENDPOINT` blank to run in **demo mode** (submissions saved to `localStorage`
key `lsp_lcb_subs`). Set it to any URL accepting a JSON `POST` to go live.

### Submission payload (database-ready)

```json
{
  "submissionId": "lcb_xxx",
  "timestamp": "2026-06-26T03:00:00.000Z",
  "source": "lawn-care-profit-capacity-benchmark",
  "consent": true,
  "lead":     { "firstName": "...", "email": "...", "phone": "...", "business": "...", "website": "...", "state": "...", "serviceArea": "..." },
  "business": { "businessType": "...", "annualRevenue": 80000, "weeklyEnquiries": 3, "mainLeadSource": "...",
                "averageJobValue": 120, "closeRate": 0.4, "recurringConversionRate": 0.4, "churnRate": 0.4,
                "activeRecurringClients": 25, "ownerToolHours": 35, "adminHours": 8, "staffCount": 0,
                "staffHours": 0, "staffWage": 35, "vaHours": 0, "vaCost": 20, "systemsUsed": "None", "...": "..." },
  "calculated": { "revenuePerHour": 47, "capacityUtilisation": 0.75, "revenueGoal": 100000, "revenueGap": 40000,
                  "recurringClientsNeeded": 17, "extraWeeklyEnquiriesNeeded": 1.2,
                  "currentAnnualCapacity": 151200, "capacityWithPartTime": 178200, "capacityWithVA": 185000,
                  "marketingBudgetTarget": 2400, "systemsBudgetTarget": 1600,
                  "averageJobValue": 120, "revenuePerHourOnTools": 47,
                  "benchmarkCategory": "Systems Stage", "reportType": "solo" },
  "benchmarkSummary": { "business": "...", "revenue": "$80,000",
                        "dollarsPerJob": "$120", "dollarsPerHourOnTools": "$47",
                        "category": "Systems Stage", "reportType": "solo" },
  "emailSegments": ["Solo Operator", "Systems Stage"]
}
```

Use `business` + `calculated` to build the benchmark (aggregate `reportType: "solo"` and
`"team"` separately, and roll up `averageJobValue` / `revenuePerHourOnTools` for the headline
industry numbers). `benchmarkSummary` is a compact at-a-glance object, and `emailSegments`
tags the contact in your email tool so you can send the right benchmark edition.

## Deploying

One static file — host anywhere: GitHub Pages, Netlify, Vercel, Cloudflare Pages, or embed
via `<iframe>` on the Local Service Pro site. No build step. Open `index.html` to preview.

## Editing benchmarks

The `MODELS` and `CATEGORIES` objects in `index.html` hold the target bucket numbers and the
stage logic / guidance — update them when you publish a new benchmark edition.
