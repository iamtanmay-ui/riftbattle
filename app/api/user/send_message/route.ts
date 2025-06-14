import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Message schema validation according to swagger spec
const messageSchema = z.object({
  message: z.string().min(1, "Message is required"),
  receiver_id: z.number().int().positive("Receiver ID is required")
});

// Configure route segment config
export const dynamic = 'force-dynamic'; // Opt out of static generation
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  if (request.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    // Parse the request body
    const body = await request.json();

    // Validate the request body against the schema
    const validatedData = messageSchema.parse(body);

    // Here you would typically:
    // 1. Verify user authentication
    // 2. Save the message to your database
    // 3. Create notification for the receiver
    console.log('Received message:', validatedData);

    // Return success response according to swagger spec
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error processing message:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'invalid message' }, // Match swagger error response
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 400 }
    );
  }
} 