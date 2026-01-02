
import React, { useState } from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-auto lg:pl-[var(--sidebar-width)] transition-[padding] duration-300">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
