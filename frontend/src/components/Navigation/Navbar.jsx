import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Logo from '../common/Logo';

const Navbar = ({ title, showBackButton = false, onBack }) => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map((word) => word[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-sand-200/80 bg-sand-50/80 backdrop-blur-lg dark:border-night-700/80 dark:bg-night-900/80">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-400/30 to-transparent" aria-hidden="true" />
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          {showBackButton ? (
            <button
              onClick={onBack}
              aria-label="Go back"
              className="-ml-1 rounded-lg p-2 text-ink-soft transition-colors hover:bg-sand-100 hover:text-ink dark:text-sand-200 dark:hover:bg-night-700"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          ) : (
            <Logo showText={false} />
          )}
          <h1 className="truncate font-display text-lg font-bold text-ink dark:text-sand-50">
            {title || 'Attune'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-ink-soft transition-colors hover:bg-sand-100 hover:text-ink dark:text-sand-200 dark:hover:bg-night-700"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu((open) => !open)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-700 text-sm font-bold text-white transition-transform hover:scale-105"
              id="user-menu"
              aria-haspopup="true"
              aria-expanded={showProfileMenu}
            >
              <span className="sr-only">Open user menu</span>
              {getInitials(user?.name)}
            </button>

            {showProfileMenu && (
              <div
                className="absolute right-0 mt-2 w-56 origin-top-right animate-scale-in overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-lift dark:border-night-700 dark:bg-night-800"
                role="menu"
                aria-labelledby="user-menu"
              >
                <div className="h-1 bg-gradient-to-r from-brand-400 to-brand-600" aria-hidden="true" />
                <div className="border-b border-sand-200 px-4 py-3 dark:border-night-700">
                  <p className="truncate text-sm font-semibold text-ink dark:text-sand-50">{user?.name || 'User'}</p>
                  <p className="truncate text-xs text-ink-muted">{user?.email || ''}</p>
                  <span className="mt-2 inline-block rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold capitalize text-brand-800 dark:bg-night-700 dark:text-brand-200">
                    {user?.role || ''}
                  </span>
                </div>
                <Link
                  to="/profile"
                  className="block px-4 py-2.5 text-sm text-ink-soft transition-colors hover:bg-sand-100 dark:text-sand-200 dark:hover:bg-night-700"
                  role="menuitem"
                  onClick={() => setShowProfileMenu(false)}
                >
                  Profile &amp; settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full px-4 py-2.5 text-left text-sm font-medium text-stress-softText transition-colors hover:bg-stress-soft"
                  role="menuitem"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
