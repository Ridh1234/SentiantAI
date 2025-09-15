import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FaChartLine, FaUser, FaMoon, FaSun, FaCreditCard, FaSignInAlt } from 'react-icons/fa';
import './Home.css';
import { creditService, type CreditInfo } from '../services/creditService';

function Home() {
  const [darkMode, setDarkMode] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{top: number, right: number}>({top: 0, right: 0});
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const profileRef = useRef<HTMLDivElement>(null);
  
  // Credit system state
  const [isTrialMode, setIsTrialMode] = useState(false);
  const [creditInfo, setCreditInfo] = useState<CreditInfo | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Optionally, persist dark mode preference in localStorage for future reloads
  useEffect(() => {
    const stored = localStorage.getItem('sentientai-darkmode');
    if (stored === null) {
      setDarkMode(true);
    } else {
      setDarkMode(stored === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sentientai-darkmode', String(darkMode));
  }, [darkMode]);

  // Initialize session and check trial mode
  useEffect(() => {
    const initializeApp = async () => {
      const isTrial = searchParams.get('trial') === 'true';
      setIsTrialMode(isTrial);
      
      // Check if user is authenticated (you might have a token or user info)
      const token = localStorage.getItem('auth_token');
      setIsAuthenticated(!!token);
      
      if (isTrial && !isAuthenticated) {
        try {
          const sessionInfo = await creditService.initializeSession();
          if (sessionInfo) {
            setCreditInfo({
              credits_remaining: sessionInfo.credits_remaining,
              session_valid: true
            });
          }
        } catch (error) {
          console.error('Failed to initialize session:', error);
        }
      }
    };

    initializeApp();
  }, [searchParams, isAuthenticated]);

  // Close dropdown on outside click
  useEffect(() => {
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
    // Clear auth data
    localStorage.removeItem('auth_token');
    // Clear session for trial users
    creditService.clearSession();
    setDropdownOpen(false);
    navigate('/', { replace: true }); // redirect to Landing page
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // For trial users, check and use credits
    if (isTrialMode && !isAuthenticated) {
      try {
        await creditService.useCredit();
        // Update credit info after using credit
        const updatedCredits = await creditService.getCredits();
        setCreditInfo(updatedCredits);
      } catch (error) {
        alert(`${error instanceof Error ? error.message : 'Failed to use credit'}. Please sign up to continue.`);
        return;
      }
    }

    navigate(`/reports/${encodeURIComponent(query.trim())}`);
  };

  const renderCreditDisplay = () => {
    if (!isTrialMode || isAuthenticated || !creditInfo) return null;

    return (
      <div className="credit-display">
        <FaCreditCard style={{ marginRight: 8 }} />
        <span>Free Reports: {creditInfo.credits_remaining}/6</span>
        {creditInfo.credits_remaining <= 2 && (
          <Link to="/signup" className="upgrade-link">
            <FaSignInAlt style={{ marginRight: 4 }} />
            Sign Up for Unlimited
          </Link>
        )}
      </div>
    );
  };

  return (
    <div className={`home-root${darkMode ? ' dark' : ''}`}>
      <header className="home-navbar">
        <div className="home-logo">
          <FaChartLine style={{ marginRight: 8 }} />
          <span>SentientAI</span>
        </div>
        <div className="home-nav-right">
          {renderCreditDisplay()}
          <button
            className="home-dark-toggle"
            aria-label="Toggle dark mode"
            onClick={() => setDarkMode((d) => !d)}
          >
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
          {isAuthenticated ? (
            <div className="home-profile-wrapper" ref={profileRef}>
              <button
                className="home-profile-btn"
                onClick={handleProfileClick}
                aria-label="User menu"
              >
                <FaUser />
              </button>
            </div>
          ) : (
            <Link to="/login" className="login-link">
              <FaSignInAlt style={{ marginRight: 4 }} />
              Sign In
            </Link>
          )}
        </div>
      </header>
      {dropdownOpen && isAuthenticated && (
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
          <p className="home-hero-quote">"Transforming data into actionable intelligence, one sentiment at a time."</p>
          {isTrialMode && !isAuthenticated && creditInfo && (
            <p className="trial-notice">
              🎉 You're in trial mode! {creditInfo.credits_remaining} free reports remaining.
            </p>
          )}
        </div>
        <form className="home-search-form" onSubmit={handleSubmit}>
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
        {isTrialMode && !isAuthenticated && creditInfo && creditInfo.credits_remaining === 0 && (
          <div className="credits-exhausted">
            <h3>Free reports exhausted!</h3>
            <p>Sign up now to get unlimited access to sentiment analysis reports.</p>
            <Link to="/signup" className="signup-cta">
              Sign Up for Free
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

export default Home;
