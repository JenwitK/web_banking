import { connectDB } from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ message: 'กรอกข้อมูลให้ครบ' }, { status: 400 });
    }

    const db = await connectDB();
    const [users] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);

    if (users.length === 0) {
      return NextResponse.json({ message: 'ไม่พบผู้ใช้' }, { status: 404 });
    }

    const user = users[0];

    if (!user.password) {
      return NextResponse.json({ message: 'ข้อมูลรหัสผ่านไม่ถูกต้อง' }, { status: 500 });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return NextResponse.json({ message: 'รหัสผ่านไม่ถูกต้อง' }, { status: 401 });
    }

    //สร้าง response แล้วค่อย set cookie
    const response = new NextResponse(JSON.stringify({
      message: 'เข้าสู่ระบบสำเร็จ',
      user: {
        id: user.id,
        name: user.first_name,
      },
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

    response.cookies.set('user_id', String(user.id), {
      path: '/',
      maxAge: 60 * 60 * 24,
      httpOnly: false,
      sameSite: 'lax',
    });

    return response;

  } catch (err) {
    console.error('❌ LOGIN ERROR:', err);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดที่ server' }, { status: 500 });
  }
}
