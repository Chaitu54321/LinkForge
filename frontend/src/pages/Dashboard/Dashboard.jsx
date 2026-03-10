import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { MousePointerClick, Link as LinkIcon, BarChart3, Copy, Trash2, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({ total_links: 0, total_clicks: 0, recent_links: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/analytics/dashboard');
      setStats(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (shortCode) => {
    // If running backend on 8000 natively in dev, hardcode local URL or use a proper VITE_FRONTEND_URL.
    // Assuming backend handles redirect directly at port 8000 for local dev
    const baseUrl = import.meta.env.VITE_API_BASE_URL 
      ? import.meta.env.VITE_API_BASE_URL.replace('/api', '') 
      : 'http://localhost:8000';
    
    const url = `${baseUrl}/${shortCode}`;
    
    try {
      await navigator.clipboard.writeText(url);
      alert('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy', err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        alert('Copied to clipboard!');
      } catch (err) {
        alert('Failed to copy');
      }
      document.body.removeChild(textArea);
    }
  };

  const deleteLink = async (id) => {
    if (confirm('Are you sure you want to delete this link?')) {
      try {
        await api.delete(`/link/${id}`);
        fetchDashboard();
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading) return <div className="page-wrapper container"><div style={{textAlign: 'center', color: 'var(--text-muted)'}}>Loading dashboard...</div></div>;

  return (
    <div className="container page-wrapper animate-fade-in">
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Overview</h2>
        <p style={{ color: 'var(--text-muted)' }}>Welcome back. Here is what is happening with your links.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', padding: '1rem', borderRadius: '12px' }}>
            <LinkIcon size={32} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Total Links</p>
            <h3 style={{ fontSize: '2rem', margin: 0 }}>{stats.total_links}</h3>
          </div>
        </div>

        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '1rem', borderRadius: '12px' }}>
            <MousePointerClick size={32} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Total Clicks</p>
            <h3 style={{ fontSize: '2rem', margin: 0 }}>{stats.total_clicks}</h3>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '0' }}>
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Recent Links</h3>
          <Link to="/create-link" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            + Create New
          </Link>
        </div>
        
        {stats.recent_links.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No links created yet. Start by generating your first short link!
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <th style={{ padding: '1rem 2rem' }}>Short Link</th>
                  <th style={{ padding: '1rem 2rem' }}>Original URL</th>
                  <th style={{ padding: '1rem 2rem' }}>Clicks</th>
                  <th style={{ padding: '1rem 2rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_links.map((link) => (
                  <tr key={link.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '1.25rem 2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <a href={`${import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace('/api', '') : 'http://localhost:8000'}/${link.short_code}`} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600 }}>
                          /{link.short_code}
                        </a>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 2rem', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{link.original_url}</span>
                    </td>
                    <td style={{ padding: '1.25rem 2rem' }}>
                      <span style={{ background: 'rgba(255,255,255,0.05)', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.85rem' }}>
                        {link.click_count} 
                      </span>
                    </td>
                    <td style={{ padding: '1.25rem 2rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button onClick={() => copyToClipboard(link.short_code)} style={{ background: 'transparent', color: 'var(--text-muted)', padding: '0.5rem' }} title="Copy">
                          <Copy size={16} />
                        </button>
                        <Link to={`/analytics/${link.id}`} style={{ display: 'inline-flex', padding: '0.5rem', color: 'var(--accent-secondary)' }} title="Analytics">
                          <BarChart3 size={16} />
                        </Link>
                        <button onClick={() => deleteLink(link.id)} style={{ background: 'transparent', color: 'var(--error)', padding: '0.5rem' }} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
