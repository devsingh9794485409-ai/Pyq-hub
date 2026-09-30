// src/api/auth.js
import client from './client.js';

export const signupRequest = (payload) =>
  client.post('/auth/signup', payload).then((r) => r.data);

export const loginRequest = (payload) =>
  client.post('/auth/login', payload).then((r) => r.data);

export const meRequest = () =>
  client.get('/auth/me').then((r) => r.data);