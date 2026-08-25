/**
 * Environment-Aware API Configuration
 * In local dev (Vite proxy): VITE_API_BASE_URL is empty, fetch calls relative '/api'
 * In production (Vercel/Netlify -> Render/Railway): VITE_API_BASE_URL points to deployed backend URL
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
