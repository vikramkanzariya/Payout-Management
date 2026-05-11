import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import LoginPage from './pages/LoginPage';
import VendorsPage from './pages/VendorsPage';
import PayoutsPage from './pages/PayoutsPage';
import CreatePayoutPage from './pages/CreatePayoutPage';
import PayoutDetailPage from './pages/PayoutDetailPage';

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e2433',
            color: '#e2e8f0',
            border: '1px solid #2d3748',
            borderRadius: '10px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/payouts" replace />} />

        <Route path="/vendors" element={
          <PrivateRoute><VendorsPage /></PrivateRoute>
        } />

        <Route path="/payouts" element={
          <PrivateRoute><PayoutsPage /></PrivateRoute>
        } />

        <Route path="/payouts/new" element={
          <PrivateRoute roles={['OPS']}><CreatePayoutPage /></PrivateRoute>
        } />

        <Route path="/payouts/:id" element={
          <PrivateRoute><PayoutDetailPage /></PrivateRoute>
        } />

        <Route path="*" element={<Navigate to="/payouts" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
