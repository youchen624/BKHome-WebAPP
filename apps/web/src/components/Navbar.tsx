import { useState } from 'react';
import './Navbar.css';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  // 點擊連結後自動收起選單（提升手機端操作體驗）
  const closeMenu = () => setIsOpen(false);

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* logo */}
        <a href="/" className="navbar-logo" onClick={closeMenu}></a>

        <div className="clock-container">
          <a href="time">
            <p>2026 11/24</p>
            <p>12:00</p>
          </a>
          <a href="wether">
            <div>我是</div>
            <div>天氣</div>
          </a>
        </div>

        {/* Mobile Burger Button|||*/}
        <button
          className="burger-btn"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Navigation Menu"
          aria-expanded={isOpen}
        >
          <span className={`bar ${isOpen ? 'open' : ''}`}></span>
          <span className={`bar ${isOpen ? 'open' : ''}`}></span>
          <span className={`bar ${isOpen ? 'open' : ''}`}></span>
        </button>

        {/* Links */}
        <nav className={`nav-menu ${isOpen ? 'active' : ''}`}>
          <a href="/" className="nav-item" onClick={closeMenu}>Home</a>
          <a href="/profile" className="nav-item" onClick={closeMenu}>Profile</a>
          <a href="/login" className="nav-item" onClick={closeMenu}>login</a>
          <a href="/logout" className="nav-item" onClick={closeMenu}>Logout</a>
        </nav>
      </div>
    </header>
  );
}
