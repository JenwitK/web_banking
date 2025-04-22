import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req) {
  const cookie = req.cookies.get('user_id');
  const userId = cookie?.value;

  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // ดึงชื่อกับยอดเงิน + username เพื่อใช้ตรวจเทียบจากธุรกรรม
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('first_name, balance, username')
    .eq('id', userId)
    .single();

  if (userError || !user) {
    return NextResponse.json({ message: 'ไม่พบผู้ใช้' }, { status: 404 });
  }

  // ดึงธุรกรรมที่เกี่ยวข้อง พร้อมข้อมูลผู้เกี่ยวข้อง
  const { data: transactions, error: txError } = await supabase
    .from('transactions')
    .select(`
      type,
      amount,
      created_at,
      to_user ( username ),
      from_user ( username )
    `)
    .or(`from_user.eq.${userId},to_user.eq.${userId}`)
    .order('created_at', { ascending: false })
    .limit(100);

  if (txError) {
    console.error('⚠️ Transaction fetch error:', txError);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดในการดึงธุรกรรม' }, { status: 500 });
  }

  // แปลงข้อมูลธุรกรรมให้เข้าใจง่าย
  const cleanedTransactions = transactions.map(t => {
    const isSender = t.from_user?.username === user.username;
  
    return {
      type: t.type,
      amount: isSender ? -Math.abs(t.amount) : Math.abs(t.amount),
      created_at: t.created_at,
      direction: isSender ? 'out' : 'in',
      counterparty: isSender
        ? t.to_user?.username || 'ไม่พบผู้รับ'
        : t.from_user?.username || 'ไม่พบผู้ส่ง',
    };
  });
  
  return NextResponse.json({
    name: user.first_name,
    balance: user.balance,
    transactions: cleanedTransactions,
  });
  
}