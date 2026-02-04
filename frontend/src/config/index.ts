// dev & e2e tests: VITE_API_URL='http://localhost:4000'
// prod: VITE_API_URL=''

const API_URL = import.meta.env.VITE_API_URL || '';

export const config = {
  apiUrl: API_URL,
};
