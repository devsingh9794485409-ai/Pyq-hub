// src/api/admin.js
import client from './client.js';

export const fetchAdminDashboard = () =>
  client.get('/admin/dashboard').then((r) => r.data);

export const fetchAdminUsers = (params) =>
  client.get('/admin/users', { params }).then((r) => r.data);

export const setAdminRole = (id, isAdmin) =>
  client.patch(`/admin/users/${id}`, { isAdmin }).then((r) => r.data);

export const deleteAdminUser = (id) =>
  client.delete(`/admin/users/${id}`).then((r) => r.data);

export const fetchAdminResources = (params) =>
  client.get('/admin/resources', { params }).then((r) => r.data);

export const deleteAdminResource = (id) =>
  client.delete(`/admin/resources/${id}`).then((r) => r.data);
