import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    if (action === 'clean') {
      // Clean all data
      database.cleanDatabase();
      return NextResponse.json({ message: 'Database cleaned successfully' });
    } else if (action === 'seed') {
      // Seed with sample data
      database.seedDatabase();
      return NextResponse.json({ message: 'Database seeded successfully' });
    } else if (action === 'reset') {
      // Clean and then seed
      database.cleanDatabase();
      database.seedDatabase();
      return NextResponse.json({ message: 'Database reset successfully' });
    } else {
      return NextResponse.json({ error: 'Invalid action. Use "clean", "seed", or "reset"' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to perform database operation' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const stats = database.getDatabaseStats();
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get database stats' }, { status: 500 });
  }
}
