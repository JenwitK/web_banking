'use client';
import { useState } from 'react';
import Link from 'next/link';
import './register.css';

export default function RegisterPage() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!firstName || !lastName || !username || !password || !confirmPassword) {
            setMessage('กรอกข้อมูลให้ครบ');
            return;
        }

        if (password !== confirmPassword) {
            setMessage('รหัสผ่านไม่ตรงกัน');
            return;
        }

        console.log({
            firstName,
            lastName,
            username,
            password,
            confirmPassword
        });

        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                username: username.trim(),
                password,
                confirmPassword
            }),
        });

        const data = await res.json();
        setMessage(data.message);

        if (res.ok) {
            setFirstName('');
            setLastName('');
            setUsername('');
            setPassword('');
            setConfirmPassword('');
            window.location.href = '/dashboard';
        }
    };

    return (
        <div className="register-container">
            <h2>สมัครสมาชิก</h2>
            <form onSubmit={handleRegister}>
                <label>ชื่อ</label>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                <label>นามสกุล</label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                <label>Username</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                <label>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <label>Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                <button type="submit">สมัครสมาชิก</button>
            </form>

            <button
                className="back-button"
                onClick={() => {
                    window.location.assign('/');
                }}
            >
                ← กลับหน้าแรก
            </button>

            {message && <p className="register-message">{message}</p>}
        </div>
    );
}