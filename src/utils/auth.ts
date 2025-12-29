import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { jwtDecode } from 'jwt-decode';

const JWT_SECRET = process.env.JWT_SECRET;

export function isTokenExpired(token: string): boolean {
  try {
    const payload: any = jwtDecode(token);
    if (!payload.exp) return false;
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function getUserFromRequest(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth) return null;
  const token = auth.replace('Bearer ', '');
  
  try {
    if (!JWT_SECRET) throw new Error('JWT_SECRET is not defined');
    const decoded: any = jwt.verify(token, JWT_SECRET);
    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
    };
  } catch {
    return null;
  }
}

export function requireRole(user: any, roles: string[]) {
  if (!user || !roles.includes(user.role)) {
    throw new Error('Insufficient rights');
  }
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  if (token && isTokenExpired(token)) {
    localStorage.removeItem('token');
    window.location.reload();
    return Promise.reject(new Error('Token expired'));
  }

  let headers: any = { ...(options.headers || {}) };
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    return Promise.reject(new Error('Unauthorized'));
  }
  if (response.status === 403) {
    return Promise.reject(new Error('Forbidden'));
  }

  return response;
}