import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Message schema validation
const messageSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(5),
  category: z.string().min(1),
  message: z.string().min(10),
});

export async function POST(request: NextRequest) {
  if (request.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    // Parse the request body
    const body = await request.json();

    // Validate the request body
    const validatedData = messageSchema.parse(body);

    // Here you would typically:
    // 1. Save the message to your database
    // 2. Send notification emails
    // 3. Create support tickets
    // For now, we'll just log it
    console.log('Received message:', validatedData);

    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: 'Message received successfully' 
    });

  } catch (error) {
    console.error('Error processing message:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to process message',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 400 }
    );
  }
}
