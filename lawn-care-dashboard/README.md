# Lawn Care Profit Allocation Benchmark

An interactive, single-file web tool for **Local Service Pro**. Australian lawn care
operators enter their revenue and where it goes, see their allocation against the
industry benchmark, and submit their name/email to receive a personalised report —
doubling as a lead-generation funnel.

![type: lead-gen tool](https://img.shields.io/badge/type-lead--gen%20tool-1f8a3b) ![stack: zero-dependency HTML](https://img.shields.io/badge/stack-vanilla%20HTML%2FCSS%2FJS-13632a)

## What it does

1. **Solo vs Team toggle** — switches the benchmark model the operator is compared against.
2. **Dollar inputs per bucket** — operators enter $ amounts (monthly or yearly); the tool computes percentages.
3. **Live comparison** — a donut chart + per-bucket benchmark bars with on-target / high / low verdicts and plain-English tips.
4. **Lead capture** — name, email, business name, state. On submit, the lead + their numbers are POSTed to your endpoint and a personalised on-page report is generated (printable / save-as-PDF).
5. **Benchmark flywheel** — a counter shows progress toward the next benchmark edition ("for every 1,000 operators who submit, we publish a fresh report, split by solo & team").

## The benchmark buckets

| Bucket | Covers | Solo target | Team target |
|---|---|---|---|
| Owner Pay | Owner wage / drawings | 52% | 45% |
| Staff Wages | Part-time / casual help, super | ~0% | 15% |
| Equipment & Running Costs | Fuel, mowers & gear, repairs, insurance, rego, materials | 20% | 18% |
| Tax / GST Buffer | BAS, GST, income tax buffer | 15% | 12% |
| Profit | True business profit | 8% | 5% |
| Marketing | Website, GBP, local SEO, ads & testing | 3% | 3% |
| Systems & Tech | LSP, automations, CRM, VA tools | 2% | 2% |

> "Operating Expenses" is labelled **Equipment & Running Costs** in the UI — clearer for
> lawn care operators. Each bucket also has an acceptable target *band*, not just a single
> number, so realistic businesses still score well.

The **solo** model reflects a pre-staff owner doing everything (higher owner pay, ~$0 staff).
The **team** model uses the part-time growth-stage target where staff becomes a deliberate
growth bucket rather than being hidden inside running costs.

## Wiring up lead capture

Open `index.html` and edit the `CONFIG` block near the top of the `<script>`:

```js
const CONFIG = {
  SUBMIT_ENDPOINT: "",     // paste your endpoint URL (see below)
  REPORT_BATCH: 1000,      // new report issued every N submissions
  BASE_COUNT: 0            // optional starting number for the public counter
};
```

Set `SUBMIT_ENDPOINT` to any URL that accepts a JSON `POST`. No backend code required if you use one of:

- **Formspree** — `https://formspree.io/f/XXXXXXXX`
- **Google Apps Script** web app with a `doPost(e)` that appends to a Sheet
- **Make.com / Zapier** catch-hook URL (route to your CRM, Mailchimp, etc.)
- Your own `/api/lead` route

If left blank, the tool runs in **demo mode**: submissions are saved to the browser's
`localStorage` (key `lsp_lawn_subs`) so nothing is lost while you test.

### Payload shape

```json
{
  "source": "lawn-care-benchmark",
  "submittedAt": "2026-06-26T03:00:00.000Z",
  "lead":     { "name": "Jordan", "email": "you@biz.com.au", "business": "Jordan's Lawns", "state": "QLD" },
  "business": {
    "mode": "team", "period": "month",
    "revenue": 12000, "revenueAnnual": 144000,
    "amounts":     { "owner": 5400, "staff": 1800, "opex": 2160, "tax": 1440, "profit": 600, "marketing": 360, "systems": 240 },
    "percentages": { "owner": 45, "staff": 15, "opex": 18, "tax": 12, "profit": 5, "marketing": 3, "systems": 2 },
    "allocatedPct": 100
  }
}
```

Use the `percentages` to roll up the next benchmark edition (aggregate `mode: "solo"` and
`mode: "team"` separately), and the `lead` for follow-up.

## Deploying

It's one static file — host it anywhere:

- **GitHub Pages** — enable Pages on this repo; the tool is at `/lawn-care-dashboard/`.
- **Netlify / Vercel / Cloudflare Pages** — drag-and-drop the folder.
- **Embed** — drop the file on your site or `<iframe>` it into a landing page.

No build step, no dependencies. Open `index.html` directly in a browser to preview.

## Editing the benchmark

The target numbers and bands live in the `MODELS` object in `index.html`. When you publish
a new benchmark edition, update `targets` / `bands` there (and optionally `BASE_COUNT`).
