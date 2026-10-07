import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const loginEtudiant = (data) => API.post('/auth/etudiant/login', data);
export const registerEtudiant = (data) => API.post('/auth/etudiant/register', data);
export const loginEnseignant = (data) => API.post('/auth/enseignant/login', data);
export const registerEnseignant = (data) => API.post('/auth/enseignant/register', data);

// Cours
export const getCours = () => API.get('/cours');
export const getMesCours = () => API.get('/cours/mes-cours');
export const addCours = (data) => API.post('/cours', data);
export const updateCours = (id, data) => API.put(`/cours/${id}`, data);
export const deleteCours = (id) => API.delete(`/cours/${id}`);
export const addEmploi = (coursId, data) => API.post(`/cours/${coursId}/emploi`, data);
export const getEmploi = (coursId) => API.get(`/cours/${coursId}/emploi`);

// Notes
export const getMesNotes = () => API.get('/notes/mes-notes');
export const getEtudiants = () => API.get('/notes/etudiants');
export const getNotesCours = (coursId) => API.get(`/notes/cours/${coursId}`);
export const addNote = (data) => API.post('/notes', data);
export const deleteNote = (id) => API.delete(`/notes/${id}`);

export default API;
