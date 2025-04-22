import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const cookie = req.cookies.get('user_id');
    const userId = cookie?.value;

    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }


    const { data, error } = await supabase
      .from('users')
      .select('first_name, last_name, username')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('❌ Supabase error:', error);
      return NextResponse.json({ message: 'ไม่พบผู้ใช้' }, { status: 404 });
    }

    return NextResponse.json(data);
    
  } catch (err) {
    console.error('❌ GET USER ERROR:', err);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดที่ server' }, { status: 500 });
  }
}
