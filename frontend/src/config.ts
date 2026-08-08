const isProd = import.meta.env.PROD;

export const API_URL = isProd 
  ? (import.meta.env.VITE_API_URL || 'https://eloquent-backend.onrender.com') 
  : '';

export const WS_URL = isProd 
  ? (import.meta.env.VITE_WS_URL || 'wss://eloquent-backend.onrender.com') 
  : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`;
