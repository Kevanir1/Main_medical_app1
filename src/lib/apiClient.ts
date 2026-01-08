const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL is not defined');
}

async function request(path: string, options: RequestInit = {}) {
  const url = path.startsWith('http')
    ? path
    : `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;

  const token = typeof window !== 'undefined'
    ? localStorage.getItem('token')
    : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    credentials: 'include',
    ...options,
    headers,
  });

  let payload: any = null;
  try {
    payload = await res.json();
  } catch {
    // response is not JSON
  }

  if (!res.ok) {
    const message =
      payload && payload.message
        ? payload.message
        : res.statusText || 'Request failed';

    const error: any = new Error(message);
    error.status = res.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export async function get(path: string) {
  return request(path, { method: 'GET' });
}

export async function post(path: string, body?: any) {
  return request(path, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function patch(path: string, body?: any) {
  return request(path, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function del(path: string) {
  return request(path, { method: 'DELETE' });
}

export default {
  get,
  post,
  patch,
  del,
  API_BASE_URL,
};
