// Backend API base URL. Set VITE_API_URL at build time for a deployed environment
// (e.g. https://api.example.com); falls back to the local dev server otherwise.
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
