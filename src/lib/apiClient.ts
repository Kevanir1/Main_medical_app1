const API_BASE_URL = 'http://localhost:5000';

const getUrl = (path: string) => `${API_BASE_URL}${path}`

async function request(path: string, options: RequestInit = {}) {
  const url = getUrl(path);

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
    console.error('Failed to parse JSON response');
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
  return request(getUrl(path), { method: 'GET' });
}

export async function post(path: string, body?: any) {
  return request(getUrl(path), {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function patch(path: string, body?: any) {
  return request(getUrl(path), {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function del(path: string) {
  return request(getUrl(path), { method: 'DELETE' });
}

export default {
  get,
  post,
  patch,
  del,
  API_BASE_URL,
};
