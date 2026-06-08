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
    return res.status(500).json({ error: 'Server misconfigured' })
  }

  const licenseKey = key.trim()

  try {
    const response = await fetch(
      `https://api.dodopayments.com/v1/licenses/${encodeURIComponent(licenseKey)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      return res.status(200).json({ valid: false, error: 'Invalid license key. Check and try again.' })
    }

    const data = await response.json()
    const valid = data?.status === 'active'

    if (!valid) {
      return res.status(200).json({ valid: false, error: `License status: ${data?.status ?? 'unknown'}` })
    }

    return res.status(200).json({ valid: true })
  } catch {
    return res.status(500).json({ valid: false, error: 'Could not reach verification server' })
  }
}
