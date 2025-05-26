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

export { api };