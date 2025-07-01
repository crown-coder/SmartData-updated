import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ModalProvider } from './components/ModalContext';
import ProtectedRoute from './components/ProtectedRoute';
import Loader from './components/Dashboard/small-components/Loader';
import Cookies from 'js-cookie';

const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const SignUp = lazy(() => import('./pages/SignUp'));
const Login = lazy(() => import('./pages/Login'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));

const AuthRedirect = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = Cookies.get('XSRF-TOKEN') || Cookies.get('topify_session');

  useEffect(() => {
    // If user is logged in and tries to access auth pages or home page, redirect to dashboard
    if (token && (location.pathname === '/' || location.pathname === '/login' ||
      location.pathname === '/signup' || location.pathname === '/forgot-password')) {
      navigate('/dashboard/');
    }
  }, [token, location.pathname, navigate]);

  return children;
};

const App = () => {
  return (
    <React.StrictMode>
      <ModalProvider>
        <Router>
          <Suspense fallback={<Loader global="true" />}>
            <AuthRedirect>
              <Routes>
                <Route path='/' element={<Home />} />
                <Route
                  path='/dashboard/*'
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/admin/*'
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path='/signup' element={<SignUp />} />
                <Route path='/login' element={<Login />} />
                <Route path='/forgot-password' element={<ForgotPassword />} />
              </Routes>
            </AuthRedirect>
          </Suspense>
        </Router>
      </ModalProvider>
    </React.StrictMode>
  );
};

export default App;
