import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const getAuthToken = () => {
  const cookieStore = cookies();
  
  // Get all cookies for debugging
  const allCookies = cookieStore.getAll();
  console.log('All cookies:', allCookies.map(c => ({ name: c.name, value: !!c.value })));
  
  // Get specific cookies
  const authToken = cookieStore.get('auth_token')?.value;
  const sessionCookie = cookieStore.get('session')?.value;
  
  // Log the cookies for debugging
  console.log('Auth cookies:', {
    hasAuthToken: !!authToken,
    authTokenLength: authToken?.length,
    hasSessionCookie: !!sessionCookie,
    sessionCookieLength: sessionCookie?.length,
    allCookies: allCookies.map(c => c.name)
  });
  
  return {
    authToken,
    sessionCookie,
    headers: {
      'Authorization': authToken ? `Bearer ${authToken}` : '',
      'Cookie': sessionCookie ? `session=${sessionCookie}` : '',
      'Content-Type': 'application/json'
    }
  };
};

export function setAuthCookies(response: Response, sessionCookie: string, authToken: string) {
  const nextResponse = new NextResponse(response.body, {
    status: response.status,
    headers: response.headers
  });

  nextResponse.cookies.set('session', sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  nextResponse.cookies.set('auth_token', authToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  return nextResponse;
} 