import { NextResponse } from "next/server";
import { api } from '@/lib/api';
import { setAuthCookies } from '@/lib/auth';

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "https://api.riftbattle.com";

interface UserData {
    id: number;
    email: string;
    username: string;
    role: string;
    balance?: number;
    banned?: boolean;
    reg_date?: number;
    ip_reg?: string;
    ip_auth?: string;
    user_agent?: string;
    seller_name?: string | null;
    seller_avatar?: string | null;
}

interface LoginResponse {
    authorization: string;
}

export async function POST(request: Request) {
    try {
        const { email, code } = await request.json();

        // Validate inputs
        if (!email || !code) {
            return NextResponse.json(
                { error: "Email and verification code are required" },
                { status: 400 }
            );
        }

        // Convert code to number
        const numericCode = Number(code);
        if (isNaN(numericCode)) {
            return NextResponse.json(
                { error: "Invalid verification code format" },
                { status: 400 }
            );
        }

        try {
            console.log("Sending login request to:", `${API_BASE_URL}/login`);
            console.log("Request payload:", { email, code: numericCode });

            // Call the backend API
            const response = await api.post('/login', { 
                email, 
                code: numericCode 
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            console.log("Login response:", {
                status: response.status,
                data: response.data,
                headers: response.headers
            });

            // Extract session from set-cookie header
            const setCookieHeader = response.headers['set-cookie'];
            let session = '';
            
            if (setCookieHeader && Array.isArray(setCookieHeader)) {
                const sessionCookie = setCookieHeader.find(cookie => cookie.includes('riftbattle_session='));
                if (sessionCookie) {
                    session = sessionCookie.split('riftbattle_session=')[1].split(';')[0];
                }
            }

            if (!session || !response.data?.authorization) {
                console.error("Missing authentication data in response:", {
                    hasSession: !!session,
                    hasAuthorization: !!response.data?.authorization,
                    responseData: response.data,
                    headers: response.headers
                });
                return NextResponse.json(
                    { error: 'Invalid response from server' },
                    { status: 500 }
                );
            }

            // Fetch user role using the authorization token
            const roleResponse = await api.get('/get_role', {
                headers: {
                    'Authorization': `Bearer ${response.data.authorization}`,
                    'Cookie': `riftbattle_session=${session}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            console.log("Role response:", {
                status: roleResponse.status,
                data: roleResponse.data
            });

            if (!roleResponse.data) {
                console.error("Failed to fetch user role:", roleResponse);
                return NextResponse.json(
                    { error: 'Failed to fetch user role' },
                    { status: 500 }
                );
            }

            // Create response with success message
            const nextResponse = NextResponse.json({ 
                message: 'Login successful',
                user: {
                    id: roleResponse.data.id?.toString() || '',
                    email: roleResponse.data.email || '',
                    username: roleResponse.data.username || '',
                    role: roleResponse.data.role || '',
                    balance: roleResponse.data.balance || 0,
                    banned: roleResponse.data.banned || false,
                    reg_date: roleResponse.data.reg_date || 0,
                    ip_reg: roleResponse.data.ip_reg || '',
                    ip_auth: roleResponse.data.ip_auth || '',
                    user_agent: roleResponse.data.user_agent || '',
                    seller_name: roleResponse.data.seller_name || null,
                    seller_avatar: roleResponse.data.seller_avatar || null
                }
            });

            // Set authentication cookies
            return setAuthCookies(
                nextResponse,
                session,
                response.data.authorization
            );
        } catch (apiError: any) {
            console.error("Error calling backend API:", {
                message: apiError.message,
                status: apiError.response?.status,
                data: apiError.response?.data,
                headers: apiError.response?.headers,
                config: {
                    url: apiError.config?.url,
                    method: apiError.config?.method,
                    headers: apiError.config?.headers,
                },
            });

            if (apiError.response?.status === 400) {
                return NextResponse.json(
                    { error: apiError.response.data?.error || "Invalid OTP" },
                    { status: 400 }
                );
            }

            if (apiError.response?.status === 401) {
                return NextResponse.json(
                    { error: "Invalid email or code" },
                    { status: 401 }
                );
            }

            return NextResponse.json(
                { error: "Login failed" },
                { status: apiError.response?.status || 500 }
            );
        }
    } catch (error: any) {
        console.error("Login error:", {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });

        return NextResponse.json(
            { error: "Login failed" },
            { status: error.response?.status || 500 }
        );
    }
}
