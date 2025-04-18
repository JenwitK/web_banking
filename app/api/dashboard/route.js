import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';

export async function GET(req) {
  const cookie = req.cookies.get('user_id');
  const userId = cookie?.value;

  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const db = await connectDB();

  const [users] = await db.execute(
    'SELECT first_name, balance FROM users WHERE id = ?',
    [userId]
  );

  if (users.length === 0) {
    return NextResponse.json({ message: 'ไม่พบผู้ใช้' }, { status: 404 });
  }

  const user = users[0];

  const [transactions] = await db.execute(
    `SELECT t.type, t.amount, t.created_at, u.username AS to_username
     FROM transactions t
     LEFT JOIN users u ON t.to_user_id = u.id
     WHERE t.user_id = ?
     ORDER BY t.created_at DESC
     LIMIT 100`,
    [userId]
  );

  return NextResponse.json({
    name: user.first_name,
    balance: user.balance,
    transactions,
  });
}
