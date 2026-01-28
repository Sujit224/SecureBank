// src/api/axios.js
import axios from 'axios';

// Ensure this matches your FastAPI backend URL
const API = axios.create({ baseURL: 'http://127.0.0.1:8000' });

// Automatically add the Token to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;