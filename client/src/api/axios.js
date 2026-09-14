// import axios from 'axios';

// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL,
//   withCredentials: true 
// });

// api.interceptors.response.use(
//   (res) => res,
//   (err) => Promise.reject(err)
// );

// export default api;

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true
});

let csrfToken = null;
let csrfRequest = null;

async function getCsrfToken() {
  if (csrfToken) return csrfToken;

  csrfRequest ??= api.get('/auth/csrf').then((res) => {
    csrfToken = res.data.csrfToken;
    return csrfToken;
  });

  return csrfRequest;
}

api.interceptors.request.use(async (config) => {
  const method = (config.method || 'get').toUpperCase();

  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    config.headers['X-CSRF-Token'] = await getCsrfToken();
  }

  return config;
});

export default api;