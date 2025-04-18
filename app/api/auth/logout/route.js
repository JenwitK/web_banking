import { NextResponse } from 'next/server';

export async function POST() {
    const res = NextResponse.json({ message: 'Logged out' });
  
    res.cookies.set('user_id', '', {
      path: '/',
      maxAge: 0, // ลบ cookie ทิ้ง
      httpOnly: false, //หรือ true ก็ได้ถ้าไม่ใช้จาก client
      sameSite: 'lax',
    });
  
    return res;
  }
