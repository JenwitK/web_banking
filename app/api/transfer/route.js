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

    const { username, amount } = await req.json();
    const amountNum = Number(amount);

    if (!username || isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json({ message: 'ข้อมูลไม่ครบหรือจำนวนเงินไม่ถูกต้อง' }, { status: 400 });
    }

    // 🔍 หา ID ของผู้รับ
    const { data: receiver, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (userError || !receiver) {
      return NextResponse.json({ message: 'ไม่พบผู้ใช้ปลายทาง' }, { status: 404 });
    }

    const toUserId = receiver.id;

    if (toUserId === userId) {
      return NextResponse.json({ message: 'ไม่สามารถโอนให้ตัวเองได้' }, { status: 400 });
    }

    // 💰 ตรวจสอบยอดเงินของผู้ส่ง
    const { data: senderData, error: senderError } = await supabase
      .from('users')
      .select('balance')
      .eq('id', userId)
      .single();

    if (senderError || !senderData) {
      return NextResponse.json({ message: 'ไม่พบข้อมูลผู้ใช้ต้นทาง' }, { status: 404 });
    }

    const senderBalance = Number(senderData.balance);

    if (senderBalance < amountNum) {
      return NextResponse.json({ message: 'ยอดเงินไม่เพียงพอ' }, { status: 400 });
    }

    // ✅ อัปเดตยอดเงิน
    const { error: senderUpdateError } = await supabase
      .from('users')
      .update({ balance: senderBalance - amountNum })
      .eq('id', userId);

    const { data: receiverData, error: receiverBalanceError } = await supabase
      .from('users')
      .select('balance')
      .eq('id', toUserId)
      .single();

    if (receiverBalanceError || !receiverData) {
      return NextResponse.json({ message: 'อัปเดตยอดผู้รับล้มเหลว' }, { status: 500 });
    }

    const { error: receiverUpdateError } = await supabase
      .from('users')
      .update({ balance: Number(receiverData.balance) + amountNum })
      .eq('id', toUserId);

    if (senderUpdateError || receiverUpdateError) {
      return NextResponse.json({ message: 'อัปเดตยอดเงินล้มเหลว' }, { status: 500 });
    }

    // 🧾 บันทึกธุรกรรม
    const { error: transferLogError } = await supabase.from('transactions').insert([
      {
        from_user: userId,
        to_user: toUserId,
        type: 'transfer',
        amount: amountNum,
      },
    ]);

    if (transferLogError) {
      return NextResponse.json({ message: 'บันทึกธุรกรรมล้มเหลว' }, { status: 500 });
    }

    return NextResponse.json({ message: 'โอนเงินสำเร็จ' });

  } catch (err) {
    console.error('❌ Transfer error:', err);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' }, { status: 500 });
  }
}
