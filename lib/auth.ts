import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { AxiosHeaders } from 'axios';

export type AuthHeaders = {
  [key: string]: string;
  Cookie: string;
  Authorization: string;
  'Content-Type': string;
  Accept: string;
};

export function getAuthHeaders(): AuthHeaders | null {
  try {
    const cookieStore = cookies();
    const allCookies = cookieStore.getAll();
    console.log('Available cookies:', allCookies.map(c => ({ name: c.name, value: !!c.value })));
    
    const sessionCookie = cookieStore.get('session')?.value;
    const authToken = cookieStore.get('auth_token')?.value;

    if (!sessionCookie || !authToken) {
      console.error('Missing authentication cookies:', {
        hasSessionCookie: !!sessionCookie,
        hasAuthToken: !!authToken,
        allCookies: allCookies.map(c => c.name)
      });
      return null;
    }

    const headers = {
      'Cookie': `session=${sessionCookie}`,
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    console.log('Generated auth headers:', {
      hasCookie: !!headers.Cookie,
      hasAuth: !!headers.Authorization
    });

    return headers;
  } catch (error) {
    console.error('Error getting auth headers:', error);
    return null;
  }
}

export function setAuthCookies(response: NextResponse, session: string, token: string) {
  console.log('Setting auth cookies:', {
    hasSession: !!session,
    hasToken: !!token
  });

  // Set session cookie
  response.cookies.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7 // 1 week
  });

  // Set auth token cookie
  response.cookies.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7 // 1 week
  });

  // Log the cookies that were set
  console.log('Cookies set:', {
    session: response.cookies.get('session')?.value ? 'set' : 'not set',
    auth_token: response.cookies.get('auth_token')?.value ? 'set' : 'not set'
  });

  return response;
} 