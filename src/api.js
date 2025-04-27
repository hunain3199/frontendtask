import axios from 'axios';

const API = axios.create({
  baseURL: 'https://backendtask-e7aj.onrender.com/api',
});

// Automatically add token
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default API;
