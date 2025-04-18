'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './login.css';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
      
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
      
        const data = await res.json();
        setMessage(data.message);
      
        if (res.status === 200) {
            router.push('/dashboard');
            setTimeout(() => {
              window.location.href = '/dashboard'; //force reload จาก URL เดิม
            }, 150);
          }
      };

    return (
        <div className="login-container">
            <h2>เข้าสู่ระบบ</h2>
            <form onSubmit={handleLogin}>
                <label>Username</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                <label>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="submit">เข้าสู่ระบบ</button>
            </form>

            <button
                className="back-button"
                onClick={() => {
                    window.location.assign('/'); //ไปหน้าแรกแบบ reload จริง
                }}
            >
                ← กลับหน้าแรก
            </button>

            {message && <p className="login-message">{message}</p>}
        </div>
    );
}
