export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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

    // 🔎 ตรวจสอบ username ซ้ำ (ยกเว้นตัวเอง)
    const { data: existing, error: existError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .neq('id', userId)
      .maybeSingle();

    if (existError) {
      console.error('⚠️ Username check error:', existError);
      return NextResponse.json({ message: 'ตรวจสอบ username ไม่สำเร็จ' }, { status: 500 });
    }

    if (existing) {
      return NextResponse.json({ message: 'Username นี้มีผู้ใช้งานแล้ว' }, { status: 409 });
    }

    // 🛠️ อัปเดตข้อมูล
    const { error: updateError } = await supabase
      .from('users')
      .update({
        first_name: firstName,
        last_name: lastName,
        username: username,
      })
      .eq('id', userId);

    if (updateError) {
      console.error('❌ UPDATE ERROR:', updateError);
      return NextResponse.json({ message: 'เกิดข้อผิดพลาดขณะอัปเดตข้อมูล' }, { status: 500 });
    }

    return NextResponse.json({ message: 'อัปเดตข้อมูลเรียบร้อยแล้ว ✅' });

  } catch (err) {
    console.error('❌ SETTINGS ERROR:', err);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' }, { status: 500 });
  }
}
