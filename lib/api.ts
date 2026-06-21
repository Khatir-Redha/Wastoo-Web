// lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  withCredentials: true, // <--- THIS IS THE CRITICAL LINE
});

// Since your backend ignores the Authorization header, 
// you technically don't even need the interceptor anymore! 
// You can delete api.interceptors.request.use(...) entirely if you want.

export default api;