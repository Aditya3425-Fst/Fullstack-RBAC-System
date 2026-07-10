import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="main-content">
        <Navbar onMenuToggle={() => setSidebarOpen((prev) => !prev)} />
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
