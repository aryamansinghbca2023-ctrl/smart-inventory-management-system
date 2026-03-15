const isDev = import.meta.env.MODE === 'development';
const BASE_URL = isDev ? 'http://localhost:5000/api' : '/api';

export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('invora_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API Error');
    }

    return data;
  } catch (error) {
    throw error;
  }
};
