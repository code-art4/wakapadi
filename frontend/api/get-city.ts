// pages/api/get-city.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }

  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;

    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'WakapadiApp/1.0 (wakapadi@example.com)' // Customize to your app info
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch city from Nominatim' });
    }

    const data = await response.json();
    const city =
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      data.address?.county;

    if (!city) {
      return res.status(404).json({ error: 'City not found in response' });
    }

    res.status(200).json({ city });
  } catch (err) {
    console.error('Error fetching city:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
