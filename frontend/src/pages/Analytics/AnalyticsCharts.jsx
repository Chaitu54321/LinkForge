import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { ArrowLeft, Clock } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AnalyticsCharts = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get(`/analytics/${id}`);
        setData(response.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [id]);

  if (loading) return <div className="page-wrapper container"><div style={{textAlign: 'center', color: 'var(--text-muted)'}}>Loading analytics...</div></div>;
  if (error) return <div className="page-wrapper container"><div style={{color: 'var(--error)'}}>{error}</div></div>;
  if (!data) return null;

  // Prepare chart data
  const browserData = {
    labels: Object.keys(data.browsers),
    datasets: [{
      data: Object.values(data.browsers),
      backgroundColor: ['rgba(99, 102, 241, 0.8)', 'rgba(14, 165, 233, 0.8)', 'rgba(139, 92, 246, 0.8)', 'rgba(16, 185, 129, 0.8)'],
      borderColor: ['var(--glass-border)'],
      borderWidth: 1,
    }]
  };

  const deviceData = {
    labels: Object.keys(data.devices),
    datasets: [{
      label: 'Clicks',
      data: Object.values(data.devices),
      backgroundColor: 'rgba(99, 102, 241, 0.8)',
      borderRadius: 4,
    }]
  };

  const countryData = {
    labels: Object.keys(data.countries),
    datasets: [{
      label: 'Clicks',
      data: Object.values(data.countries),
      backgroundColor: 'rgba(14, 165, 233, 0.8)',
      borderRadius: 4,
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: '#94a3b8' }
      }
    },
    scales: {
      y: { ticks: { color: '#94a3b8', stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.05)' } },
      x: { ticks: { color: '#94a3b8' }, grid: { display: false } }
    }
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#94a3b8' } }
    }
  };

  return (
    <div className="container page-wrapper animate-fade-in">
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link to="/dashboard" className="btn-secondary" style={{ display: 'inline-flex', padding: '0.5rem', borderRadius: '50%' }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 style={{ fontSize: '2rem', margin: 0 }}>Analytics Detail</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {data.overview.original_url}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ color: 'var(--text-muted)' }}>Total Clicks</p>
            <h1 className="text-gradient" style={{ fontSize: '3rem', margin: 0 }}>{data.overview.click_count}</h1>
          </div>
          <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: '16px' }}>
             <Clock size={40} color="var(--accent-primary)" />
          </div>
        </div>
        
        <div className="glass-panel" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center' }}>
            <Pie data={browserData} options={pieOptions} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="glass-panel">
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>Device Breakdown</h3>
          <Bar data={deviceData} options={chartOptions} height={200} />
        </div>
        
        <div className="glass-panel">
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>Top Countries</h3>
          <Bar data={countryData} options={chartOptions} height={200} />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
