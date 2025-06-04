// lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SOCKET_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default async function cityHandler(
  req: { query: { lat: any; lon: any } },
  res: {
    status: (arg0: number) => {
      (): any;
      new (): any;
      json: { (arg0: { error?: string; city?: any }): any; new (): any };
    };
  }
) {
  const { lat, lon } = req.query;

  try {
    const res = await api.get(`/geolocation/reverse?lat=${lat}&lon=${lon}`);

    const geocode = res.data;
    const city = (geocode.address.city || geocode.address.town || '')
      .trim()
      .toLowerCase();

    return res.status(200).json({ city });
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
}

export { api, cityHandler };
