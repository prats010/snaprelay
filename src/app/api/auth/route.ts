import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { passphrase } = await request.json();
    const correctPassphrase = process.env.DASHBOARD_PASSPHRASE;
    console.log(`[AUTH] Checking passphrase. Received: "${passphrase}" | Expected: "${correctPassphrase}"`);

    if (!correctPassphrase) {
        return NextResponse.json({ error: 'Server misconfigured: Passphrase missing' }, { status: 500 });
    }

    if (passphrase === correctPassphrase || passphrase === (correctPassphrase as string).replace(/"/g, '')) {
      const response = NextResponse.json({ success: true });
      // Set an HTTP-only cookie to keep the session
      response.cookies.set('snaprelay_auth', passphrase, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });
      return response;
    }

    return NextResponse.json({ error: 'Invalid passphrase' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}
