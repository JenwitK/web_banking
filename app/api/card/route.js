import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = cookies();
  const userId = cookieStore.get('user_id')?.value;

  console.log('🍪 userId from cookie:', userId);

  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('first_name, last_name, balance, id, created_at')
    .eq('id', Number(userId)) 
    .single();

  if (error || !user) {
    console.error('❌ ไม่พบผู้ใช้ หรือเกิด error:', error);
    return NextResponse.json({ message: 'ไม่พบผู้ใช้' }, { status: 404 });
  }

  return NextResponse.json({
    cardName: 'MyBank Virtual Card',
    name: `${user.first_name} ${user.last_name}`,
    balance: user.balance,
    created_at: user.created_at,
    cardNumber: `**** **** **** ${String(user.id).padStart(4, '0')}`,
  });
}
