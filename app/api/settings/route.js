export const runtime = 'nodejs';

import { connectDB } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const cookie = req.cookies.get('user_id');
    const userId = cookie?.value;

    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { firstName, lastName, username } = await req.json();

    if (!firstName || !lastName || !username) {
      return NextResponse.json({ message: 'กรอกข้อมูลให้ครบ' }, { status: 400 });
    }

    const db = await connectDB();

    const [existing] = await db.execute(
      'SELECT id FROM users WHERE username = ? AND id != ?',
      [username, userId]
    );

    if (existing.length > 0) {
      return NextResponse.json({ message: 'Username นี้มีผู้ใช้งานแล้ว' }, { status: 409 });
    }

    await db.execute(
      'UPDATE users SET first_name = ?, last_name = ?, username = ? WHERE id = ?',
      [firstName, lastName, username, userId]
    );

    return NextResponse.json({ message: 'อัปเดตข้อมูลเรียบร้อยแล้ว ✅' });

  } catch (err) {
    console.error('❌ SETTINGS ERROR:', err);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' }, { status: 500 });
  }
}
