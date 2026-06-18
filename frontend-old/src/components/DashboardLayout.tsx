import React from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="app-container">

      <main className="main-content">
        {children}
      </main>

      <footer className="footer">
        <p className="footer-text">
          © {new Date().getFullYear()} Roselle Tabuena. All rights reserved.
        </p>
        <p className="footer-text" style={{ opacity: 0.6, fontSize: '0.75rem' }}>
          Gen-AI Lab • Curated documentation of AI & LLM explorations.
        </p>
      </footer>
    </div>
  );
}
