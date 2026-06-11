#!/usr/bin/env node

// Google Places API (New) CLI for local-business lead generation.
// Sweeps Text Search across a list of localities to build prospect lists
// (name, address, suburb, phone, website, rating) deduped by place ID.

const API_KEY = process.env.GOOGLE_PLACES_API_KEY
const BASE_URL = 'https://places.googleapis.com/v1'

const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.addressComponents',
  'places.nationalPhoneNumber',
  'places.websiteUri',
  'places.rating',
  'places.userRatingCount',
  'places.googleMapsUri',
  'places.businessStatus',
  'nextPageToken',
].join(',')

function parseArgs(args) {
  const result = { _: [] }
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg.startsWith('--')) {
      const key = arg.slice(2)
      const next = args[i + 1]
      if (next && !next.startsWith('--')) {
        result[key] = next
        i++
      } else {
        result[key] = true
      }
    } else {
      result._.push(arg)
    }
  }
  return result
}

const args = parseArgs(process.argv.slice(2))
const [cmd] = args._

async function searchText(textQuery, pageToken) {
  const body = {
    textQuery,
    pageSize: 20,
    regionCode: args.region || 'AU',
  }
  if (pageToken) body.pageToken = pageToken
  if (args['dry-run']) {
    return {
      _dry_run: true,
      method: 'POST',
      url: `${BASE_URL}/places:searchText`,
      headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': '***', 'X-Goog-FieldMask': FIELD_MASK },
      body,
    }
  }
  const res = await fetch(`${BASE_URL}/places:searchText`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': FIELD_MASK,
    },
    body: JSON.stringify(body),
  })
  const text = await res.text()
  try {
    const json = JSON.parse(text)
    if (!res.ok) return { error: json.error?.message || `HTTP ${res.status}`, status: res.status }
    return json
  } catch {
    return { error: `HTTP ${res.status}`, body: text }
  }
}

function component(place, type) {
  const c = (place.addressComponents || []).find((c) => (c.types || []).includes(type))
  return c ? c.shortText || c.longText : ''
}

function toRow(place, matchedLocality) {
  return {
    name: place.displayName?.text || '',
    address: place.formattedAddress || '',
    suburb: component(place, 'locality'),
    state: component(place, 'administrative_area_level_1'),
    postcode: component(place, 'postal_code'),
    phone: place.nationalPhoneNumber || '',
    website: place.websiteUri || '',
    rating: place.rating ?? '',
    reviews: place.userRatingCount ?? '',
    maps_url: place.googleMapsUri || '',
    status: place.businessStatus || '',
    matched_locality: matchedLocality,
    place_id: place.id,
  }
}

function csvEscape(value) {
  const s = String(value ?? '')
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function toCsv(rows) {
  const headers = Object.keys(rows[0] || { name: '' })
  const lines = [headers.join(',')]
  for (const row of rows) lines.push(headers.map((h) => csvEscape(row[h])).join(','))
  return lines.join('\n') + '\n'
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function searchAll(textQuery, maxResults) {
  const places = []
  let pageToken
  do {
    const result = await searchText(textQuery, pageToken)
    if (result._dry_run) return { dryRun: result, places: [] }
    if (result.error) return { error: result.error, places }
    places.push(...(result.places || []))
    pageToken = result.nextPageToken
    if (pageToken) await sleep(Number(args.delay || 200))
  } while (pageToken && places.length < maxResults)
  return { places: places.slice(0, maxResults) }
}

async function main() {
  let result

  switch (cmd) {
    case 'search': {
      if (!args.query) { result = { error: '--query required' }; break }
      const { places, error, dryRun } = await searchAll(args.query, Number(args.limit || 20))
      if (dryRun) { result = dryRun; break }
      if (error) { result = { error }; break }
      result = { count: places.length, places: places.map((p) => toRow(p, args.query)) }
      break
    }

    case 'sweep': {
      if (!args.localities) { result = { error: '--localities <file> required (one locality per line, e.g. "Frankston VIC")' }; break }
      const fs = require('fs')
      const localities = fs.readFileSync(args.localities, 'utf8')
        .split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'))
      const queries = (args.queries || 'landscape supplies,garden supplies,sand and soil supplies')
        .split(',').map((q) => q.trim()).filter(Boolean)
      const maxPerSearch = Number(args['max-per-search'] || 20)
      const delay = Number(args.delay || 200)

      if (args['dry-run']) {
        const sample = await searchText(`${queries[0]} in ${localities[0]}, Australia`)
        result = {
          _dry_run: true,
          localities: localities.length,
          queries,
          planned_searches: localities.length * queries.length,
          note: 'Each search makes 1-3 paginated requests. Text Search with contact fields bills at the Enterprise SKU.',
          sample_request: sample,
        }
        break
      }

      const seen = new Map()
      let searches = 0
      const total = localities.length * queries.length
      for (const locality of localities) {
        for (const query of queries) {
          searches++
          const { places, error } = await searchAll(`${query} in ${locality}, Australia`, maxPerSearch)
          if (error) {
            process.stderr.write(`\n[${searches}/${total}] ${locality} / "${query}": ${error}\n`)
            if (/quota|rate|RESOURCE_EXHAUSTED/i.test(error)) await sleep(5000)
            continue
          }
          let added = 0
          for (const place of places) {
            if (place.businessStatus && place.businessStatus !== 'OPERATIONAL') continue
            if (!seen.has(place.id)) { seen.set(place.id, toRow(place, locality)); added++ }
          }
          process.stderr.write(`\r[${searches}/${total}] ${locality} / "${query}": +${added} (total ${seen.size})   `)
          await sleep(delay)
        }
      }
      process.stderr.write('\n')

      const rows = [...seen.values()]
      if (args.out) {
        const out = args.format === 'json' ? JSON.stringify(rows, null, 2) : toCsv(rows)
        fs.writeFileSync(args.out, out)
        result = { searches, unique_businesses: rows.length, written: args.out }
      } else {
        result = { searches, unique_businesses: rows.length, businesses: rows }
      }
      break
    }

    default:
      result = {
        usage: 'google-places.js <command> [options]',
        env: 'GOOGLE_PLACES_API_KEY required',
        commands: {
          search: 'Single text search. --query "landscape supplies in Frankston VIC" [--limit 20] [--region AU] [--dry-run]',
          sweep: 'Bulk lead sweep across localities. --localities <file> [--queries "a,b,c"] [--out leads.csv] [--format csv|json] [--max-per-search 20] [--delay 200] [--dry-run]',
        },
        examples: [
          'google-places.js search --query "garden supplies in Surrey Hills VIC"',
          'google-places.js sweep --localities projects/swift-dispatch/localities-au.txt --out leads.csv',
        ],
        notes: [
          'Localities file: one per line ("Suburb STATE"), # lines ignored.',
          'Results dedupe by Google place ID; non-operational businesses are dropped.',
          'Pricing: Text Search with phone/website fields bills as Places API Enterprise (~US$35/1000 requests, small monthly free tier). A 440-locality x 3-query sweep is ~1,500-2,500 requests.',
        ],
      }
  }

  console.log(JSON.stringify(result, null, 2))
}

if (cmd && cmd !== '--help' && !API_KEY) {
  console.error(JSON.stringify({ error: 'GOOGLE_PLACES_API_KEY environment variable required' }))
  process.exit(1)
}

main().catch((err) => {
  console.error(JSON.stringify({ error: err.message }))
  process.exit(1)
})
