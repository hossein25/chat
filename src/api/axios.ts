import axios from 'axios';

export const API = axios.create({
  baseURL: 'https://api.openai.com/v1',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${import.meta.env.VITE_OPEN_AI_API_KEY}`,
  },
});
