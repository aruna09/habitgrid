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
    const url = `https://live.dodopayments.com/v1/licenses/${encodeURIComponent(licenseKey)}`
    console.log('[verify-license] calling:', url)
    console.log('[verify-license] api key present:', !!apiKey, 'prefix:', apiKey.slice(0, 8))

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    const raw = await response.text()
    console.log('[verify-license] status:', response.status, 'body:', raw)

    if (!response.ok) {
      return res.status(200).json({ valid: false, error: `Dodo returned ${response.status}: ${raw}` })
    }

    const data = JSON.parse(raw)
    const valid = data?.status === 'active'

    return res.status(200).json({ valid, dodostatus: data?.status })
  } catch (err) {
    console.error('[verify-license] fetch error:', err)
    return res.status(500).json({ valid: false, error: String(err) })
  }
}
