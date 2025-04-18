import { connectDB } from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

export async function POST(req) {
  const { firstName, lastName, username, password, confirmPassword } = await req.json();

  if (!firstName || !lastName || !username || !password || !confirmPassword) {
    return NextResponse.json({ message: 'กรอกข้อมูลให้ครบ' }, { status: 400 });
  }

  if (password !== confirmPassword) {
    return NextResponse.json({ message: 'รหัสผ่านไม่ตรงกัน' }, { status: 400 });
  }

  const db = await connectDB();


  const [exist] = await db.execute('SELECT id FROM users WHERE username = ?', [username]);
  if (exist.length > 0) {
    return NextResponse.json({ message: 'Username นี้ถูกใช้แล้ว' }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 10);

  const [result] = await db.execute(
    'INSERT INTO users (username, password, balance, first_name, last_name) VALUES (?, ?, ?, ?, ?)',
    [username, hashed, 1000.00, firstName, lastName]
  );

  //เซ็ต session cookie
  const response = NextResponse.json({
    message: 'สมัครสำเร็จ',
    userId: result.insertId,
  });

  response.cookies.set('user_id', String(result.insertId), {
    path: '/',
    maxAge: 60 * 60 * 24,
    httpOnly: false,
    sameSite: 'lax',
  });

  return response;
}
