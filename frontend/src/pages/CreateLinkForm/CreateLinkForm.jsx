import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { Link2, Clock, Lock, Copy } from 'lucide-react';

const CreateLinkForm = () => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successLink, setSuccessLink] = useState(null);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessLink(null);

    try {
      const payload = { original_url: originalUrl };
      if (customAlias) payload.custom_alias = customAlias;
      if (expiresAt) payload.expires_at = new Date(expiresAt).toISOString();
      if (password) payload.password = password;

      const response = await api.post('/link/create', payload);
      setSuccessLink(response.data);
      // Reset form optionally, or let them copy and go to dash
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create link.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (successLink) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL 
        ? import.meta.env.VITE_API_BASE_URL.replace('/api', '') 
        : 'http://localhost:8000';
      const url = `${baseUrl}/${successLink.short_code}`;
      
      try {
        await navigator.clipboard.writeText(url);
        alert('Copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy', err);
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
    }
  };

  return (
    <div className="container page-wrapper animate-fade-in" style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '600px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Create New Link</h2>
          <p style={{ color: 'var(--text-muted)' }}>Generate a short, trackable link for your content.</p>
        </div>

        {successLink ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <div style={{ display: 'inline-flex', background: 'var(--accent-gradient)', padding: '16px', borderRadius: '50%', marginBottom: '1.5rem' }}>
               <Link2 size={40} color="white" />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Your Link is Ready!</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '1rem', marginBottom: '2rem' }}>
              <span style={{ flex: 1, fontSize: '1.1rem', color: 'var(--text-main)', textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000'}/{successLink.short_code}
              </span>
              <button className="btn-secondary" onClick={copyToClipboard} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
                <Copy size={16} /> Copy
              </button>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn-primary" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </button>
              <button className="btn-secondary" onClick={() => {
                setSuccessLink(null);
                setOriginalUrl('');
                setCustomAlias('');
              }}>
                Create Another
              </button>
            </div>
          </div>
        ) : (
          <form className="glass-panel" onSubmit={handleSubmit}>
            {error && (
              <div style={{ color: 'var(--error)', background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                {error}
              </div>
            )}
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Destination URL *
              </label>
              <div style={{ position: 'relative' }}>
                <Link2 size={18} style={{ position: 'absolute', top: '14px', left: '16px', color: 'var(--text-muted)' }} />
                <input
                  className="input-glass"
                  type="url"
                  style={{ paddingLeft: '3rem' }}
                  placeholder="https://example.com/very/long/url"
                  value={originalUrl}
                  onChange={(e) => setOriginalUrl(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Custom Alias (Optional)
                </label>
                <input
                  className="input-glass"
                  type="text"
                  placeholder="e.g. my-campaign"
                  value={customAlias}
                  onChange={(e) => setCustomAlias(e.target.value)}
                  pattern="[a-zA-Z0-9-]+"
                  title="Only letters, numbers, and hyphens"
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Expiration Date (Optional)
                </label>
                <div style={{ position: 'relative' }}>
                  <Clock size={16} style={{ position: 'absolute', top: '15px', left: '12px', color: 'var(--text-muted)' }} />
                  <input
                    className="input-glass"
                    type="datetime-local"
                    style={{ paddingLeft: '2.5rem' }}
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Password Protection (Optional)
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', top: '15px', left: '12px', color: 'var(--text-muted)' }} />
                <input
                  className="input-glass"
                  type="password"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Enter a secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Generating...' : 'Enhance Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateLinkForm;
