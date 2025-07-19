"use client";

import { useTheme } from '@/app/context/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';

export default function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        width: '56px',
        height: '28px',
        borderRadius: '9999px',
        backgroundColor: theme === 'dark' ? '#374151' : '#e5e7eb',
        border: '1px solid #4b5563',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease'
      }}
    >
      <span
        style={{
          position: 'absolute',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: 'white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          transition: 'transform 0.3s ease',
          transform: theme === 'dark' ? 'translateX(28px)' : 'translateX(2px)'
        }}
      >
        {theme === 'dark' ? (
          <MoonIcon style={{ width: '16px', height: '16px', color: '#4f46e5' }} />
        ) : (
          <SunIcon style={{ width: '16px', height: '16px', color: '#f59e0b' }} />
        )}
      </span>
    </button>
  );
}