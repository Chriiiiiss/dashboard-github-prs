import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@auth/ProtectedRoute';
import { LoginPage } from '@pages/LoginPage/LoginPage';
import { CallbackPage } from '@pages/CallbackPage/CallbackPage';
import { DashboardPage } from '@pages/DashboardPage/DashboardPage';
import styles from './App.module.scss';

export const App = () => (
  <div className={styles.app}>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<CallbackPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </div>
);
