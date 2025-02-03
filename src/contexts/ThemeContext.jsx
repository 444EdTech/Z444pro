import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

const lightTheme = {
  background: '#ffffff',
  text: '#333333',
  primary: '#007bff',
  secondary: '#6c757d',
  accent: '#e6f2ff',
};

const darkTheme = {
  background: '#1a1a1a',
  text: '#ffffff',
  primary: '#4da6ff',
  secondary: '#a0a0a0',
  accent: '#003366',
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? JSON.parse(savedTheme) : true;
  });

  const theme = isDarkMode ? darkTheme : lightTheme;

  useEffect(() => {
    localStorage.setItem('theme', JSON.stringify(isDarkMode));
    document.body.classList.toggle('light-mode', !isDarkMode);
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

