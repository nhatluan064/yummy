export const dynamic = "force-static";

import { NextResponse } from 'next/server';
import seedSampleData from '@/lib/menuSeed';

export async function GET() {
  // NOTE: development helper — call this endpoint to populate sample data
  try {
    seedSampleData();
    return NextResponse.json({ ok: true, message: 'Seeded sample data' });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
