// src/api/users.js
import client from './client.js';

export const fetchUserProfile = (id) =>
  client.get(`/users/${id}`).then((r) => r.data);