import type { VercelRequest, VercelResponse } from '@vercel/node'

// Validate license key is a safe string — alphanumeric plus common separators, 8–128 chars
const LICENSE_KEY_RE = /^[A-Za-z0-9_\-]{8,128}$/

// Simple in-process rate limiter — resets per cold start (good enough for serverless)
const attempts = new Map<string, { count: number; resetAt: number }>()
const WINDOW_MS = 60_000   // 1 minute
const MAX_ATTEMPTS = 10    // per IP per window

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = attempts.get(ip)
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }
  entry.count++
  return entry.count > MAX_ATTEMPTS
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // CORS — only allow requests from the app's own origin
  const origin = req.headers.origin
  const allowedOrigins = [
    'https://habitgrid.vercel.app',
    'http://localhost:5173',
    'http://localhost:4173',
  ]
  if (origin && !allowedOrigins.includes(origin)) {
    return res.status(403).json({ valid: false, error: 'Forbidden' })
  }
  if (origin) res.setHeader('Access-Control-Allow-Origin', origin)

  // Rate limiting by IP
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? 'unknown'
  if (isRateLimited(ip)) {
    return res.status(429).json({ valid: false, error: 'Too many attempts. Try again in a minute.' })
  }

  // Validate key presence and format
  const { key } = req.query
  if (!key || typeof key !== 'string' || key.trim().length === 0) {
    return res.status(400).json({ valid: false, error: 'Missing license key' })
  }
  const licenseKey = key.trim()
  if (!LICENSE_KEY_RE.test(licenseKey)) {
    return res.status(400).json({ valid: false, error: 'Invalid license key format' })
  }

  const apiKey = process.env.DODO_API_KEY
  if (!apiKey) {
    return res.status(500).json({ valid: false, error: 'Server misconfigured' })
  }

  try {
    const base = process.env.DODO_TEST_MODE === 'true'
      ? 'test.dodopayments.com'
      : 'live.dodopayments.com'

    const response = await fetch(`https://${base}/licenses/validate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ license_key: licenseKey }),
    })

    if (!response.ok) {
      // Don't expose Dodo's internal error to the client
      console.error('[verify-license] Dodo error:', response.status)
      return res.status(200).json({ valid: false, error: 'License key not recognised.' })
    }

    const data = await response.json()

    // Live mode: trust data.valid strictly
    // Test mode: accept any 200 (Dodo returns valid:false for test keys by design)
    const testMode = process.env.DODO_TEST_MODE === 'true'
    const valid = testMode ? true : data?.valid === true

    if (!valid) {
      return res.status(200).json({ valid: false, error: 'License key not recognised. Make sure you copied it correctly.' })
    }

    return res.status(200).json({ valid: true })
  } catch (err) {
    console.error('[verify-license] fetch error:', err instanceof Error ? err.message : 'unknown')
    return res.status(500).json({ valid: false, error: 'Could not reach verification server.' })
  }
}
