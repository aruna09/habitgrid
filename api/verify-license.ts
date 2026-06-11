import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { key } = req.query
  if (!key || typeof key !== 'string' || key.trim().length === 0) {
    return res.status(400).json({ valid: false, error: 'Missing license key' })
  }

  const apiKey = process.env.DODO_API_KEY
  if (!apiKey) {
    return res.status(500).json({ valid: false, error: 'DODO_API_KEY not set' })
  }

  const licenseKey = key.trim()

  try {
    const base = process.env.DODO_TEST_MODE === 'true' ? 'test.dodopayments.com' : 'live.dodopayments.com'
    const url = `https://${base}/licenses/validate`
    console.log('[verify-license] calling POST', url)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ license_key: licenseKey }),
    })

    const raw = await response.text()
    console.log('[verify-license] status:', response.status, 'body:', raw)

    if (!response.ok) {
      return res.status(200).json({ valid: false, error: `Dodo returned ${response.status}: ${raw}` })
    }

    const data = JSON.parse(raw)
    console.log('[verify-license] parsed:', JSON.stringify(data))

    // In test mode, treat any lic_ key that Dodo recognises (200 response) as valid
    // In live mode, check data.valid strictly
    const testMode = process.env.DODO_TEST_MODE === 'true'
    const valid = testMode ? response.ok : data?.valid === true

    if (!valid) {
      return res.status(200).json({ valid: false, error: 'License key not recognised. Make sure you copied it correctly.' })
    }

    return res.status(200).json({ valid: true })
  } catch (err) {
    console.error('[verify-license] fetch error:', err)
    return res.status(500).json({ valid: false, error: String(err) })
  }
}
