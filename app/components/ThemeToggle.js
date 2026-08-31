'use client';
import { useState, useLayoutEffect } from 'react';
import { IconSun, IconMoon, IconMonitor } from './Icons';

const OPTIONS = [
  { key: 'light', label: 'Light', Icon: IconSun },
  { key: 'dark', label: 'Dark', Icon: IconMoon },
  { key: 'system', label: 'System', Icon: IconMonitor },
];

function applyTheme(value) {
  localStorage.setItem('theme', value);
  if (value === 'light' || value === 'dark') {
    document.documentElement.setAttribute('data-theme', value);
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

export default function ThemeToggle({ className = '' }) {
  const [theme, setTheme] = useState('system');

  // Re-apply after React's dev-mode Strict Mode remount clears the attribute
  // the inline head script set before hydration. No-op in production.
  useLayoutEffect(() => {
    const stored = localStorage.getItem('theme') || 'system';
    setTheme(stored);
    applyTheme(stored);
  }, []);

  const choose = (value) => {
    setTheme(value);
    applyTheme(value);
  };

  return (
    <div className={`theme-toggle ${className}`} role="radiogroup" aria-label="Theme">
      {OPTIONS.map(({ key, label, Icon }) => (
        <button
          key={key}
          type="button"
          role="radio"
          aria-checked={theme === key}
          className={`theme-toggle-btn ${theme === key ? 'active' : ''}`}
          onClick={() => choose(key)}
          title={label}
          aria-label={label}
        >
          <Icon width="14" height="14" />
        </button>
      ))}
    </div>
  );
}
