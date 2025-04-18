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

    const { username, amount } = await req.json();

    console.log('userId:', userId);
    console.log(' username ปลายทาง:', username);
    console.log('amount ที่โอน:', amount);

    const amountNum = Number(amount);

    if (!username || isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json({ message: 'ข้อมูลไม่ครบหรือจำนวนเงินไม่ถูกต้อง' }, { status: 400 });
    }

    const db = await connectDB();


    const [users] = await db.execute('SELECT id FROM users WHERE username = ?', [username]);
    if (users.length === 0) {
      return NextResponse.json({ message: 'ไม่พบผู้ใช้ปลายทาง' }, { status: 404 });
    }

    const toUserId = users[0].id;


    const [senderRows] = await db.execute('SELECT balance FROM users WHERE id = ?', [userId]);
    const senderBalance = Number(senderRows[0].balance);

    if (senderBalance < amountNum) {
      return NextResponse.json({ message: 'ยอดเงินไม่เพียงพอ' }, { status: 400 });
    }


    await db.execute('UPDATE users SET balance = balance - ? WHERE id = ?', [amountNum, userId]);
    await db.execute('UPDATE users SET balance = balance + ? WHERE id = ?', [amountNum, toUserId]);


    await db.execute(
      'INSERT INTO transactions (user_id, type, amount, to_user_id, created_at) VALUES (?, ?, ?, ?, NOW())',
      [userId, 'transfer', -Math.abs(amountNum), toUserId]
    );

    await db.execute(
      'INSERT INTO transactions (user_id, type, amount, to_user_id, created_at) VALUES (?, ?, ?, ?, NOW())',
      [toUserId, 'receive', Math.abs(amountNum), userId]
    );

    return NextResponse.json({ message: 'โอนเงินสำเร็จ' });

  } catch (err) {
    console.error('❌ Transfer error:', err);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}
