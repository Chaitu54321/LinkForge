import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './utils/Layout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import CreateLinkForm from './pages/CreateLinkForm/CreateLinkForm';
import AnalyticsCharts from './pages/Analytics/AnalyticsCharts';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes inside Layout */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-link" element={<CreateLinkForm />} />
          <Route path="/analytics/:id" element={<AnalyticsCharts />} />
        </Route>
        
        {/* Catch all redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
