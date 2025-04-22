import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ message: 'กรอกข้อมูลให้ครบ' }, { status: 400 });
    }

    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !users) {
      return NextResponse.json({ message: 'ไม่พบผู้ใช้' }, { status: 404 });
    }

    const match = await bcrypt.compare(password, users.password);
    if (!match) {
      return NextResponse.json({ message: 'รหัสผ่านไม่ถูกต้อง' }, { status: 401 });
    }

    const response = new NextResponse(JSON.stringify({
      message: 'เข้าสู่ระบบสำเร็จ',
      user: {
        id: users.id,
        name: users.first_name,
      },
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

    response.cookies.set('user_id', String(users.id), {
      path: '/',
      maxAge: 60 * 60 * 24,
      httpOnly: true,
      sameSite: 'lax',
    });

    return response;

  } catch (err) {
    console.error('❌ LOGIN ERROR:', err);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดที่ server' }, { status: 500 });
  }
}
