import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaChartLine, FaUser, FaMoon, FaSun } from 'react-icons/fa';
import './Home.css';

function Home() {
  const [darkMode, setDarkMode] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{top: number, right: number}>({top: 0, right: 0});
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const profileRef = useRef<HTMLDivElement>(null);

  // Optionally, persist dark mode preference in localStorage for future reloads
  React.useEffect(() => {
    const stored = localStorage.getItem('sentientai-darkmode');
    if (stored === null) {
      setDarkMode(true);
    } else {
      setDarkMode(stored === 'true');
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem('sentientai-darkmode', String(darkMode));
  }, [darkMode]);

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleProfileClick = () => {
    if (!dropdownOpen && profileRef.current) {
      const rect = profileRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 8, // 8px below the icon
        right: window.innerWidth - rect.right
      });
    }
    setDropdownOpen((open) => !open);
  };

  const handleLogout = () => {
    // Clear any auth/session here if needed
    setDropdownOpen(false);
    navigate('/', { replace: true }); // redirect to Landing page
  };

  return (
    <div className={`home-root${darkMode ? ' dark' : ''}`}> {/* root for dark mode */}
      <header className="home-navbar">
        <div className="home-logo">
          <FaChartLine style={{ marginRight: 8 }} />
          <span>SentientAI</span>
        </div>
        <div className="home-nav-right">
          <button
            className="home-dark-toggle"
            aria-label="Toggle dark mode"
            onClick={() => setDarkMode((d) => !d)}
          >
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
          <div className="home-profile-wrapper" ref={profileRef}>
            <button
              className="home-profile-btn"
              onClick={handleProfileClick}
              aria-label="User menu"
            >
              <FaUser />
            </button>
          </div>
        </div>
      </header>
      {dropdownOpen && (
        <div
          className="home-profile-dropdown"
          style={{ position: 'fixed', top: dropdownPos.top, right: dropdownPos.right, zIndex: 2000 }}
        >
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
      <main className="home-main">
        <div className="home-hero-text">
          <h1 className="home-hero-title">Unlock Insights Instantly with AI-Powered Sentiment Analysis</h1>
          <p className="home-hero-quote">“Transforming data into actionable intelligence, one sentiment at a time.”</p>
        </div>
        <form
          className="home-search-form"
          onSubmit={e => {
            e.preventDefault();
            if (query.trim()) {
              navigate(`/reports/${encodeURIComponent(query.trim())}`);
            }
          }}
        >
          <input
            className="home-search-input"
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="eg.. Search Tesla or OpenAI...."
            autoFocus
          />
          <button className="home-search-btn" type="submit">
            Generate Report
          </button>
        </form>
      </main>
    </div>
  );
}

export default Home;
