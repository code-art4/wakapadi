// import axios from 'axios';

// export const api = axios.create({
//   baseURL: 'http://localhost:3001',
//   // process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
//   withCredentials: true, // or your backend base URL

// });

// // api.interceptors.request.use((config) => {
// //   const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
// //   if (token) {
// //     config.headers.Authorization = `Bearer ${token}`;
// //   }
// //   return config;
// // });


// if (typeof window !== 'undefined') {
//   const token = localStorage.getItem('token');
//   if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
// }


// lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL:  'http://localhost:3001',
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


export default async function cityHandler(req: { query: { lat: any; lon: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error?: string; city?: any; }): any; new(): any; }; }; }) {
  const { lat, lon } = req.query;

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      {
        headers: {
          'User-Agent': 'your-app-name (your-email@example.com)'
        }
      }
    );
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch city' });
    }

    const data = await response.json();
    const city = data.address?.city || data.address?.town || data.address?.village;
    return res.status(200).json({ city });
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
}

export { api, cityHandler };