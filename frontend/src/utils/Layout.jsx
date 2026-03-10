import { Outlet, Link, useNavigate, Navigate } from 'react-router-dom';
import { LogOut, Home, Link2, BarChart2 } from 'lucide-react';

const Layout = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!token) {
    // Basic redirect if not logged in
    // This is simple protection, a full app would use a ProtectedRoute wrapper
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <nav style={{ 
        position: 'fixed', 
        top: 0, 
        width: '100%', 
        background: 'rgba(10, 15, 28, 0.8)', 
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--glass-border)',
        zIndex: 50
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'var(--accent-gradient)', padding: '6px', borderRadius: '8px', color: 'white' }}>
              <Link2 size={24} />
            </div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }} className="text-gradient">LinkForge</h1>
          </div>

          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
              <Home size={18} /> Dashboard
            </Link>
            <Link to="/create-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
              <Link2 size={18} /> New Link
            </Link>
            
            <button onClick={handleLogout} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </nav>

      <main>
        <Outlet />
      </main>
      
      <footer style={{
        textAlign: 'center',
        padding: '1.5rem',
        color: 'var(--text-muted)',
        fontSize: '0.8rem',
        opacity: 0.7,
        borderTop: '1px solid var(--glass-border)',
        marginTop: 'auto'
      }}>
        Made by Sri Chaitanya
      </footer>
    </>
  );
};

export default Layout;
