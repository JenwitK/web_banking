import { supabase } from '@/lib/supabase';
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

  const { data: existUser, error: existError } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .single();

  if (existUser) {
    return NextResponse.json({ message: 'Username นี้ถูกใช้แล้ว' }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const { data, error } = await supabase.from('users').insert([
    {
      username,
      password: hashedPassword,
      first_name: firstName,
      last_name: lastName,
      balance: 1000.00
    }
  ]).select().single();
  if (error) {
    console.error('❌ Supabase insert error:', error);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดระหว่างสมัคร' }, { status: 500 });
  }

  const response = NextResponse.json({
    message: 'สมัครสำเร็จ',
    userId: data.id,
  });

  response.cookies.set('user_id', String(data.id), {
    path: '/',
    maxAge: 60 * 60 * 24, // 1 วัน
    httpOnly: false,
    sameSite: 'lax',
  });

  return response;
}
