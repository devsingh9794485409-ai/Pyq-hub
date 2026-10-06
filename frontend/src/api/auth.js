// src/api/auth.js
import client from './client.js';

export const loginRequest = (data) =>
  client.post('/auth/login', data).then((r) => r.data);

export const signupRequest = (data) =>
  client.post('/auth/signup', data).then((r) => r.data);

export const meRequest = () =>
  client.get('/auth/me').then((r) => r.data);

export const firebaseAuthRequest = (data) =>
  client.post('/auth/firebase', data).then((r) => r.data);

export const forgotPasswordRequest = (email) =>
  client.post('/auth/forgot-password', { email }).then((r) => r.data);

export const resetPasswordRequest = (data) =>
  client.post('/auth/reset-password', data).then((r) => r.data);