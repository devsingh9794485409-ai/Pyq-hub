// src/api/resources.js
import client from './client.js';

export const fetchResources = (params) =>
  client.get('/resources', { params }).then((r) => r.data);

export const uploadResource = (formData, onProgress) =>
  client
    .post('/resources', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
      },
    })
    .then((r) => r.data);

export const toggleUpvote = (id) =>
  client.post(`/resources/${id}/upvote`).then((r) => r.data);

export const deleteResource = (id) =>
  client.delete(`/resources/${id}`).then((r) => r.data);