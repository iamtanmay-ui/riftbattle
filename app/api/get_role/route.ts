import { NextResponse } from "next/server";
import { getAuthHeaders } from '@/lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.riftbattle.com";

export async function GET(request: Request) {
    try {
        // Get auth headers
        const headers = getAuthHeaders();
        if (!headers) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Call the backend API with auth headers
        const response = await fetch(`${API_BASE_URL}/user/get_role`, {
            headers: {
                ...headers,
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Error fetching role:", error);
        return NextResponse.json(
            { error: "Failed to fetch role" },
            { status: error.response?.status || 500 }
        );
    }
}

const checkAuth = async (deviceCode: string) => {
    const response = await fetch(`/api/seller/get-skins?device_code=${deviceCode}`);
    if (response.status === 200) {
        // Authentication successful, got skins data
        const data = await response.json();
        return {
            success: true,
            account: {
                id: deviceCode,
                displayName: data.suggested_name,
                cosmeticCounts: {
                    skins: data.skins_count,
                    backblings: data.backpacks_count,
                    emotes: data.emotes_count,
                    pickaxes: data.pickaxes_count,
                    gliders: data.glider_count
                }
            }
        };
    } else if (response.status === 400) {
        // Still waiting for user to complete auth
        return { success: false, error: 'pending' };
    } else {
        // Other error
        return { success: false, error: 'failed' };
    }
}; 