import { connectDB } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req) {
  const cookie = req.cookies.get('user_id');
  const userId = cookie?.value;

  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const db = await connectDB();
  const [rows] = await db.execute(
    'SELECT first_name, last_name, balance, id, created_at FROM users WHERE id = ?',
    [userId]
  );

  if (rows.length === 0) {
    return NextResponse.json({ message: 'ไม่พบผู้ใช้' }, { status: 404 });
  }

  const user = rows[0];

  return NextResponse.json({
    cardName: 'MyBank Virtual Card',
    name: `${user.first_name} ${user.last_name}`,
    balance: user.balance,
    created_at: user.created_at,
    cardNumber: `**** **** **** ${String(user.id).padStart(4, '0')}`,
  });
}
