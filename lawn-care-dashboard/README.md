# Lawn Care Profit &amp; Capacity Benchmark Calculator

A web-based **lead-magnet calculator** for **Local Service Pro**. Australian lawn care
operators answer a short 3-step wizard and get an instant, screenshot-friendly benchmark
report — how they compare on revenue, pricing, leads, capacity and systems, plus what it
would take to grow. Every submission is captured as a structured, database-ready payload to
build an industry benchmark and an email marketing list.

`lawn-care-dashboard/index.html` — single file, zero dependencies, dark-mode, mobile-first.

![type: lead-magnet](https://img.shields.io/badge/type-lead--magnet-34d67c) ![stack: vanilla HTML/CSS/JS](https://img.shields.io/badge/stack-vanilla%20HTML%2FCSS%2FJS-21b865)

## Positioning

> Fix lead flow first. Build systems second. Add capacity third. Then buy equipment or hire with confidence.

For operators doing roughly **$60k–$250k/year** — solo, part-time, shift-worker or small team.

## What it does

1. **Business type** — Solo / Part-Time / Shift Worker / Planning to hire / Already has staff / Team. Drives a **Solo Operator** vs **Team Business** report.
2. **Contact capture** — name, email, phone, business, website, state, service area.
3. **Your numbers** — revenue, enquiries, lead source, pricing, close/recurring/churn sliders, recurring clients, jobs/week, owner & admin hours, staff, VA — with editable advanced assumptions.
4. **Instant report**, including:
   - **Current snapshot** (revenue/hour, capacity used, close & recurring rates…)
   - **Growth potential** — revenue gap, recurring clients needed at $100 *and* $120/job, extra weekly enquiries, marketing (3%) & systems (2%) budgets, invest-readiness.
   - **Profit-first allocation** — solo vs team target buckets, with **Staff Wages as its own bucket** and "Operating Expenses" renamed **Equipment &amp; Running Costs**.
   - **Capacity stack** — Owner only → + Part-time employee → + VA/admin → lead-flow-filled potential, with net $ after wages/VA.
   - **Recommendation** — one of Foundation / Lead Flow / Systems / Capacity / Team Growth stage, with focus actions.
   - **Offers** (recommended one highlighted) + **book-a-call CTA**.
5. **Structured submission** POSTed to your endpoint (lead + numbers + calculated results + internal notification + email segments).

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

## Benchmark categories &amp; recommended offers

| Category | Trigger (simplified) | Lead offer |
|---|---|---|
| Foundation Stage | No website / weak digital + low leads | Website + GBP |
| Lead Flow Stage | Has site, inconsistent enquiries | GBP optimisation + website |
| Systems Stage | Getting leads, losing time in admin | $197/mo Systems &amp; Automations |
| Capacity Stage | Demand &gt; production capacity | Systems + part-time/VA |
| Team Growth Stage | Staff/planning + higher revenue | Team dashboard + hiring pathway |

## Wiring it up

Edit the `CONFIG` block at the top of the `<script>` in `index.html`:

```js
const CONFIG = {
  SUBMIT_ENDPOINT: "",   // JSON POST destination (Formspree / Apps Script / Zapier / your API)
  BOOKING_URL: "https://localservicepro.com.au/book",  // strategy-call link
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
                  "benchmarkCategory": "Systems Stage", "recommendedOffer": "Systems & Automations", "reportType": "solo" },
  "internalNotification": { "business": "...", "revenue": "$80,000", "revenueGap": "$40,000",
                            "category": "Systems Stage", "recommendedOffer": "...", "bestFollowUpAngle": "..." },
  "emailSegments": ["Solo Operator", "Systems Stage"]
}
```

Use `business` + `calculated` to build the benchmark (aggregate `reportType: "solo"` and
`"team"` separately), `internalNotification` for your Slack/email alert, and `emailSegments`
to tag the contact in your email tool.

## Deploying

One static file — host anywhere: GitHub Pages, Netlify, Vercel, Cloudflare Pages, or embed
via `<iframe>` on the Local Service Pro site. No build step. Open `index.html` to preview.

## Editing benchmarks &amp; offers

The `MODELS`, `CATEGORIES` and `OFFERS` objects in `index.html` hold the target numbers,
stage logic and pricing — update them when you publish a new benchmark edition or change an
offer.
