// src/lib/api.js
import axios from 'axios';

export const API_BASE = 'http://10.0.2.2:4000'; // change to PC LAN IP for real device

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

export const authHeader = (token) => {
  if (!token) return {};
  return { headers: { Authorization: `Bearer ${token}` } };
};
