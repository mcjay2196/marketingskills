# Swift Dispatch — Cold Outreach Lead List

Prospect list build for **Swift Dispatch** cold outreach. Target profile (modelled
on [Surrey Hills Garden Supplies](https://surreyhillsgardensupplies.com.au/)):

- Independent landscape / garden / sand-and-soil supply yard
- Sells bulk materials (soil, mulch, sand, gravel, sleepers) to trade + DIY
- Runs its own delivery trucks — same-day or next-day bulk delivery is a core
  selling point, which means scheduling/dispatch is a daily pain
- Customer-service-led local businesses (phone orders, delivery windows)

## Files

| File | What it is |
|------|------------|
| `seed-leads.csv` | 107 hand-verified businesses across all 8 states/territories, found and enriched via live web research (June 2026). Columns: name, location, state, region, phone, email, address, website, notes. 103 have phone numbers, 55 have published emails. One entry (Bayside Garden Supplies) is flagged closed — do not contact. |
| `localities-au.txt` | 540 Australian suburbs/towns tiling every metro and major regional area, used to drive the Places API sweep. |

**Enrichment notes**: contacts were collected from each business's own website
and major directories via search. Emails marked here were publicly published;
where no email is listed the business publishes only a phone number or web
form (common for small yards — phone-first businesses). Validate all emails
(see `tools/REGISTRY.md`, Email Validation) before any send.

## Scaling to 1,000 leads

Hand research tops out around 100 verifiable businesses. To reach 1,000, run the
Google Places sweep (official API — no scraping):

```bash
# 1. Get a Google Maps Platform API key with "Places API (New)" enabled
export GOOGLE_PLACES_API_KEY=...

# 2. Preview what will run (no requests sent)
node tools/clis/google-places.js sweep \
  --localities projects/swift-dispatch/localities-au.txt --dry-run

# 3. Run the sweep (~1,600 searches, roughly 1-2 hours with default delay)
node tools/clis/google-places.js sweep \
  --localities projects/swift-dispatch/localities-au.txt \
  --out projects/swift-dispatch/places-leads.csv
```

Output is deduped by Google place ID and includes suburb, state, postcode,
phone, website, rating, and review count per business. Expect 1,500–3,000
unique businesses nationally; sort/filter to your best 1,000 (e.g. has a
website, 10+ reviews, operational status).

**Cost note**: Text Search with contact fields bills at the Places API
Enterprise SKU (~US$35 per 1,000 requests, small monthly free tier). The full
sweep is roughly 1,600–2,500 billable requests ≈ **US$55–90**. Trim
`localities-au.txt` to fewer regions to reduce cost.

## After the sweep — outreach prep

1. **Dedupe against `seed-leads.csv`** (match on website domain or name+suburb).
2. **Find contact emails**: most yards list a generic email on their site; for
   the rest use `tools/clis/hunter.js` or `tools/clis/snov.js` against the
   website domain.
3. **Validate before sending** — keep sender reputation healthy (see
   `tools/REGISTRY.md`, Email Validation section).
4. **Segment by region** so send volume per area stays low and messaging can
   reference local suburbs ("deliveries from your Braeside yard").
5. Strongest openers are the same-day-delivery operators (see `notes` column) —
   they feel dispatch pain most acutely.
