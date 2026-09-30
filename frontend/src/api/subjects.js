// src/api/subjects.js
import client from './client.js';

export const fetchSubjects = (branch, semester) =>
  client.get('/subjects', { params: { branch, semester } }).then((r) => r.data);

export const fetchSubject = (id) =>
  client.get(`/subjects/${id}`).then((r) => r.data);