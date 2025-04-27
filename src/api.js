import axios from 'axios';

const API = axios.create({
  baseURL: 'https://frontendtask-ten-virid.vercel.app/api',
});

// Automatically add token
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default API;
