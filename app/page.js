'use client';
import Link from 'next/link';
import './landing.css';
import { useState } from 'react';

export default function LandingPage() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={`landing ${darkMode ? 'dark' : ''}`}>
      <nav className="navbar">
        <div className="logo">🏦 Hell Bank</div>
        <div className="nav-links">
          <button onClick={() => setDarkMode(!darkMode)} className="toggle-dark">
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
          <Link href="/register">สมัครสมาชิก</Link>
          <Link href="/login">เข้าสู่ระบบ</Link>
        </div>
      </nav>

      <main className="hero">
        <h1>ยินดีต้อนรับสู่ Hell Bank</h1>
        <p>ระบบธนาคารออนไลน์ที่ปลอดภัย รวดเร็ว และทันสมัย</p>
        <div className="hero-buttons">
          <Link href="/register"><button>สมัครสมาชิก</button></Link>
          <Link href="/login"><button>เข้าสู่ระบบ</button></Link>
        </div>
      </main>
    </div>
  );
}
