export const runtime = 'nodejs';

import { connectDB } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const cookie = req.cookies.get('user_id');
    const userId = cookie?.value;

    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const db = await connectDB();
    const [rows] = await db.execute(
      'SELECT first_name, last_name, username FROM users WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: 'ไม่พบผู้ใช้' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
    
  } catch (err) {
    console.error('❌ GET USER ERROR:', err);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดที่ server' }, { status: 500 });
  }
}
