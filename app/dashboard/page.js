'use client';
import './dashboard.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
    const [name, setName] = useState('');
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [showCard, setShowCard] = useState(false);
    const [cardInfo, setCardInfo] = useState(null);
    const [showTransfer, setShowTransfer] = useState(false);
    const [toUser, setToUser] = useState('');
    const [amount, setAmount] = useState('');
    const [transferMsg, setTransferMsg] = useState('');
    const [showChart, setShowChart] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [newFirstName, setNewFirstName] = useState('');
    const [newLastName, setNewLastName] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [settingsMsg, setSettingsMsg] = useState('');
    const [showStatement, setShowStatement] = useState(false);
    const [filterType, setFilterType] = useState('all');
    const [filterDate, setFilterDate] = useState('');
    const [dailyBudget, setDailyBudget] = useState(1000);
    const [todaySpending, setTodaySpending] = useState(0);
    const [overBudget, setOverBudget] = useState(false);
    const [dailyLimitAmount, setDailyLimitAmount] = useState('');
    const [dailyLimitCount, setDailyLimitCount] = useState('');
    const [limitWarning, setLimitWarning] = useState('');
    const [showTransferLimit, setShowTransferLimit] = useState(false);



    const router = useRouter();

    const fetchDashboard = async () => {
        const res = await fetch('/api/dashboard', {
            credentials: 'include',
        });

        if (!res.ok) {
            router.push('/login');
            return;
        }

        const data = await res.json();
        setName(data.name);
        setBalance(data.balance);
        setTransactions(data.transactions);
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    useEffect(() => {
        if (showSettings) {
            fetch('/api/user', { credentials: 'include' })
                .then(res => res.json())
                .then(data => {
                    setNewFirstName(data.first_name);
                    setNewLastName(data.last_name);
                    setNewUsername(data.username);
                });
        }
    }, [showSettings]);

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const spentToday = transactions
            .filter(t => t.amount < 0 && t.created_at.startsWith(today))
            .reduce((acc, t) => acc + Math.abs(t.amount), 0);

        setTodaySpending(spentToday);
        setOverBudget(spentToday > dailyBudget);
    }, [transactions, dailyBudget]);

    const handleSaveSettings = async () => {
        const res = await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                firstName: newFirstName,
                lastName: newLastName,
                username: newUsername,
            }),
        });

        const data = await res.json();
        setSettingsMsg(data.message);

        if (res.ok) {
            await fetchDashboard();
            setShowSettings(false);
        }
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/';
    };

    const loadCard = async () => {
        const res = await fetch('/api/card', { credentials: 'include' });
        if (res.ok) {
            const data = await res.json();
            setCardInfo(data);
            setShowCard(true);
        }
    };

    const handleTransfer = async () => {
        const today = new Date().toISOString().split('T')[0];
        const todayTransfers = transactions.filter(
            t => t.type === 'transfer' && t.amount < 0 && new Date(t.created_at).toISOString().split('T')[0] === today
        );

        const todayAmount = todayTransfers.reduce((acc, t) => acc + Math.abs(t.amount), 0);
        const todayCount = todayTransfers.length;

        if (dailyLimitAmount && todayAmount + Number(amount) > Number(dailyLimitAmount)) {
            setLimitWarning(`📉 วันนี้คุณใช้ไปแล้ว ฿${todayAmount} / ลิมิต ฿${dailyLimitAmount}`);
            return;
        }

        if (dailyLimitCount && todayCount >= Number(dailyLimitCount)) {
            setLimitWarning(`📣 วันนี้คุณโอนครบ ${dailyLimitCount} ครั้งแล้ว รอพรุ่งนี้นะ 💸`);
            return;
        }

        const res = await fetch('/api/transfer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username: toUser, amount }),
        });

        const data = await res.json();
        setTransferMsg(data.message);
        if (res.ok) {
            await fetchDashboard();
            setToUser('');
            setAmount('');
            setLimitWarning('');
        }
    };
    const incomeTotal = transactions
        .filter(t => t.amount > 0)
        .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

    const expenseTotal = transactions
        .filter(t => t.amount < 0)
        .reduce((acc, t) => acc + Math.abs(Number(t.amount) || 0), 0);

    const chartData = [
        {
            name: 'รายงาน',
            income: incomeTotal,
            expense: expenseTotal
        }
    ];





    return (
        <div className="dashboard">
            <aside className="sidebar">
                <h2>🏦 Hell Bank</h2>
                <nav>
                    <ul>
                        <li onClick={() => router.push('/dashboard')} style={{ cursor: 'pointer', color: '#ff0' }}>🏠 Home</li>
                        <li onClick={loadCard} style={{ cursor: 'pointer' }}>💳 Cards</li>
                        <li onClick={() => setShowTransfer(true)} style={{ cursor: 'pointer' }}>🔁 Transfers</li>
                        <li onClick={() => setShowChart(true)} style={{ cursor: 'pointer' }}>📊 Chart</li>
                        <li onClick={() => setShowSettings(true)} style={{ cursor: 'pointer' }}>⚙️ Settings</li>
                        <li>
                            <button onClick={handleLogout} style={{ color: 'yellow', background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit', padding: 0 }}>
                                🔓 Logout
                            </button>
                        </li>
                    </ul>
                </nav>
            </aside>

            <main className="main">
                <h1>Hello, {name}!</h1>

                <div className="cards">
                    <div className="card">
                        <h3>Available Balance</h3>
                        <p className="amount">฿{Number(balance).toLocaleString()}</p>
                        <button onClick={() => setShowStatement(true)}>View Statement</button>
                    </div>
                    <div className="card">
                        <h3>Daily Budget</h3>
                        <p className="amount">
                            Spended: ฿{todaySpending.toFixed(2)} / ฿{dailyBudget.toFixed(2)}
                        </p>
                        {overBudget && (
                            <p style={{ color: '#f87171', fontWeight: 'bold' }}>
                                📉 Over Budget! {(((todaySpending - dailyBudget) / dailyBudget) * 100).toFixed(1)}%
                            </p>
                        )}
                        <div style={{ marginTop: '10px' }}>
                            <input
                                type="number"
                                value={dailyBudget}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/^0+(?=\d)/, '');
                                    setDailyBudget(Number(value));
                                }}
                                placeholder="ตั้งงบ (บาท)"
                                style={{ padding: '8px', borderRadius: '8px', border: 'none' }}
                            />
                        </div>
                    </div>
                    <div className="card">
                        <h3>Transfer Limit</h3>
                        <p className="amount">Limit daily</p>

                        <div className="limit-section-1">
                            <div className="limit-input-group-1">
                                <input type="number" value={dailyLimitAmount} readOnly />
                                <span className="unit">฿</span>
                            </div>

                            <div className="limit-input-group-1">
                                <input type="number" value={dailyLimitCount} readOnly />
                                <span className="unit">ครั้ง</span>
                            </div>
                        </div>

                        <button onClick={() => setShowTransferLimit(true)}>Edit</button>
                    </div>
                </div>

                <div className="transactions">
                    <h2>Recent Transactions</h2>
                    <ul>
                        {transactions.length === 0 ? (
                            <li style={{ opacity: 0.5 }}>ยังไม่มีรายการ</li>
                        ) : (
                            transactions.map((t, i) => (
                                <li key={i}>
                                  <span>
                                    {t.direction === 'out'
                                      ? `โอนไป → ${t.counterparty}`
                                      : `รับเงินจาก ← ${t.counterparty}`}
                                  </span>
                                  <span>
                                    {Number(t.amount) > 0
                                      ? `+฿${Number(t.amount).toFixed(2)}`
                                      : `-฿${Math.abs(Number(t.amount)).toFixed(2)}`}
                                  </span>
                                </li>
                              ))
                        )}
                    </ul>
                </div>
            </main>



            {showCard && cardInfo && (
                <div className="modal-overlay" onClick={() => setShowCard(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>💳 {cardInfo.cardName || 'MyBank Virtual Card'}</h2>
                        <div className="card-number">{cardInfo.cardNumber}</div>
                        <p><strong>ชื่อ:</strong> {cardInfo.name}</p>
                        <p><strong>ยอดเงิน:</strong> ฿{Number(cardInfo.balance).toLocaleString()}</p>
                        <p><strong>สร้างเมื่อ:</strong> {new Date(cardInfo.created_at).toLocaleDateString('th-TH')}</p>
                        <button className="close-button" onClick={() => setShowCard(false)}>ปิด</button>
                    </div>
                </div>
            )}

            {showTransferLimit && (
                <div className="modal-overlay" onClick={() => setShowTransferLimit(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>📉 ตั้งค่าลิมิตการโอน</h2>
                        <div className="limit-section">
                            <input
                                type="number"
                                placeholder="ลิมิตยอดโอนต่อวัน (฿)"
                                value={dailyLimitAmount}
                                onChange={(e) => setDailyLimitAmount(e.target.value)}
                            />
                            <input
                                type="number"
                                placeholder="ลิมิตจำนวนครั้งต่อวัน"
                                value={dailyLimitCount}
                                onChange={(e) => setDailyLimitCount(e.target.value)}
                            />
                        </div>
                        <button className="save-limit-button" onClick={() => setShowTransferLimit(false)}>💾 บันทึก</button>
                    </div>
                </div>
            )}

            {showTransfer && (
                <div className="modal-overlay" onClick={() => setShowTransfer(false)}>
                    <div className="modal-content transfer-form" onClick={(e) => e.stopPropagation()}>
                        <h2>🔁 โอนเงิน</h2>

                        <input
                            type="text"
                            placeholder="Username ผู้รับ"
                            value={toUser}
                            onChange={(e) => setToUser(e.target.value)}
                        />
                        <input
                            type="number"
                            placeholder="จำนวนเงิน"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />


                        <div className="limit-section">
                            <input
                                type="number"
                                placeholder="ลิมิตยอดโอนต่อวัน (฿)"
                                value={dailyLimitAmount}
                                readOnly
                            />
                            <input
                                type="number"
                                placeholder="ลิมิตจำนวนครั้งต่อวัน"
                                value={dailyLimitCount}
                                readOnly
                            />
                        </div>

                        {/* ปุ่มโอนเงิน */}
                        <div>
                            <button className="confirm-button" onClick={handleTransfer}>✅ ยืนยันโอน</button>
                            <button className="cancel-button" onClick={() => setShowTransfer(false)}>ปิด</button>
                        </div>


                        {limitWarning && <p className="transfer-message">{limitWarning}</p>}


                        {transferMsg && <p className="transfer-message">{transferMsg}</p>}
                    </div>
                </div>
            )}

            {showChart && (
                <div className="modal-overlay" onClick={() => setShowChart(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>📊 รายงานรายรับ/รายจ่าย</h2>

                        <div style={{ marginBottom: '15px' }}>
                            <p style={{ color: '#22c55e' }}>รวมรายรับ : ฿{incomeTotal.toLocaleString()}</p>
                            <p style={{ color: '#ef4444' }}>รวมรายจ่าย : ฿{expenseTotal.toLocaleString()}</p>
                        </div>

                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={chartData}>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value) => `฿${Number(value).toLocaleString()}`} />
                                <Legend />
                                <Bar dataKey="income" fill="#22c55e" name="รวมรายรับ" />
                                <Bar dataKey="expense" fill="#ef4444" name="รวมรายจ่าย" />
                            </BarChart>
                        </ResponsiveContainer>

                        <button className="close-button" onClick={() => setShowChart(false)}>ปิด</button>
                    </div>
                </div>
            )}

            {showSettings && (
                <div className="modal-overlay" onClick={() => setShowSettings(false)}>
                    <div className="modal-content settings" onClick={e => e.stopPropagation()}>
                        <h2>⚙️ แก้ไขข้อมูลส่วนตัว</h2>
                        <div className="settings-form">
                            <input type="text" value={newFirstName} onChange={e => setNewFirstName(e.target.value)} placeholder="ชื่อใหม่" />
                            <input type="text" value={newLastName} onChange={e => setNewLastName(e.target.value)} placeholder="นามสกุลใหม่" />
                            <input type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)} placeholder="Username ใหม่" />
                            <div>
                                <button className="save-button" onClick={handleSaveSettings}>💾 บันทึก</button>
                                <button className="cancel-button" onClick={() => setShowSettings(false)}>ปิด</button>
                            </div>
                            {settingsMsg && <p className="settings-message">{settingsMsg}</p>}
                        </div>
                    </div>
                </div>
            )}

            {showStatement && (
                <div className="modal-overlay" onClick={() => setShowStatement(false)}>
                    <div className="modal-content statement" onClick={(e) => e.stopPropagation()}>
                        <h2>📄 รายการทั้งหมด</h2>

                        <div className="statement-filters">
                            <input
                                type="date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                placeholder="กรอกวันที่"
                            />
                            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                                <option value="all">ทั้งหมด</option>
                                <option value="income">รายรับ</option>
                                <option value="expense">รายจ่าย</option>
                            </select>
                        </div>

                        <ul className="statement-list">
                            {transactions
                                .filter(t => {
                                    if (filterType === 'income') return t.amount > 0;
                                    if (filterType === 'expense') return t.amount < 0;
                                    return true;
                                })
                                .filter(t => {
                                    if (!filterDate) return true;
                                    const date = new Date(t.created_at).toISOString().split('T')[0];
                                    return date === filterDate;
                                })
                                .map((t, i) => (
                                    <li key={i}>
                                        <span>{t.type} {t.to_username && `→ ${t.to_username}`}</span>
                                        <span className={t.amount > 0 ? 'positive' : 'negative'}>
                                            {t.amount > 0
                                                ? `+฿${Number(t.amount).toFixed(2)}`
                                                : `-฿${Math.abs(t.amount).toFixed(2)}`}
                                        </span>
                                    </li>
                                ))}
                        </ul>

                        <button className="close-button" onClick={() => setShowStatement(false)}>ปิด</button>
                    </div>
                </div>
            )}
        </div>
    );
}
