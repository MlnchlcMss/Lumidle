import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import GameBoard from './components/GameBoard';
import QuoteBoard from './components/QuoteBoard';
import SFXBoard from './components/SFXBoard';
import './App.css';

function App() {
  const [background, setBackground] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tooltipText, setTooltipText] = useState('Send your inquiries/feedback here');
  const timeoutRef = useRef(null);

  const getTodayDate = () => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Manila',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(now);
  };

  const getSidebarDate = () => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    let formattedDate = formatter.format(now);
    setCurrentDate(formattedDate);
  }

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const copyEmail = () => {
    const email = 'lumidlegame@protonmail.com';
    navigator.clipboard.writeText(email);
    setTooltipText('Address Copied!');
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setTooltipText('Send your inquiries/feedback here');
    }, 2000);
  };

  useEffect(() => {
    const todayStr = getTodayDate();
    getSidebarDate();
    const stored = localStorage.getItem('dailyBackground');
    let bgToUse;

    if (stored) {
      try {
        const { date, bg } = JSON.parse(stored);
        if (date === todayStr) {
          bgToUse = bg;
        }
      } catch (e) {
      }
    }

    if (!bgToUse) {
      const backgrounds = Array.from({ length: 22 }, (_, i) => `background${i + 1}.webp`);
      const randomIndex = Math.floor(Math.random() * backgrounds.length);
      bgToUse = backgrounds[randomIndex];
      localStorage.setItem('dailyBackground', JSON.stringify({ date: todayStr, bg: bgToUse }));
    }
    setBackground(bgToUse);
  }, []);


  useEffect(() => {
    if (background) {
      document.body.style.setProperty('--bg-image', `url('/backgrounds/${background}')`);
    } else {
      document.body.style.removeProperty('--bg-image');
    }
    return () => {
      document.body.style.removeProperty('--bg-image');
    };
  }, [background]);


  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <Router>
      <div className="app-container">
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="sidebar-logo">
              <img src="logo.png" alt="Lumidle" />
            </div>
            <button
              className={`burger-menu ${mobileMenuOpen ? 'active' : ''}`}
              onClick={toggleMobileMenu}
              aria-label="Toggle navigation"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
          <nav className={mobileMenuOpen ? 'open' : ''}>
            <NavLink to="/character" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <span className="nav-bullet"></span>
              <span className="nav-text-container">
                <span className="nav-text">Character</span>
              </span>
            </NavLink>
            <NavLink to="/quote" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <span className="nav-bullet"></span>
              <span className="nav-text-container">
                <span className="nav-text">Quote</span>
              </span>
            </NavLink>
            <NavLink to="/sfx" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <span className="nav-bullet"></span>
              <span className="nav-text-container">
                <span className="nav-text">SFX</span>
              </span>
            </NavLink>
            <div className={`sidebar-footer ${mobileMenuOpen ? 'open' : ''}`}>
              <div className="footer-socials">
                <div
                  className="copy-email"
                  data-tooltip={tooltipText}
                  onClick={copyEmail}>
                  <img src="/socials/email.svg" alt="Email" className="social-icon-img" />
                </div>
              
              </div>
              <div className="footer-trademark">
                Not affiliated with Nimble Neuron. Eternal Return is a trademark of Nimble Neuron, inc. or its affiliates.
                Inspired by Kisekidle.
              </div>
            </div>
            <div className={`sidebar-date ${mobileMenuOpen ? 'open' : ''}`}>{currentDate}</div>
          </nav>
        </aside>
        <main className="main-content">
          <Routes>
            <Route path="/character" element={<GameBoard />} />
            <Route path="/quote" element={<QuoteBoard />} />
            <Route path="/sfx" element={<SFXBoard />} />
            <Route path="/" element={<Navigate to="/character" replace />} />
            <Route path="*" element={<Navigate to="/character" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;