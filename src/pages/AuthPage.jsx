import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../utils/api';
import './AuthPage.css';

const AuthPage = ({ login, signup, loginWithGoogle }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Google Auth Client ID State
  const defaultClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '655065657609-4p51158vudfvmdq2vki69vurkoqj457q.apps.googleusercontent.com';
  const [googleClientId, setGoogleClientId] = useState(defaultClientId);
  const [isGoogleScriptLoaded, setIsGoogleScriptLoaded] = useState(false);
  const googleBtnContainerRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  // Fetch Google Client ID and initialize Google script
  useEffect(() => {
    const fetchClientIdAndSetup = async () => {
      let activeClientId = googleClientId;
      try {
        if (!activeClientId) {
          const res = await api.getGoogleClientId();
          if (res?.clientId) {
            activeClientId = res.clientId;
            setGoogleClientId(activeClientId);
          }
        }
      } catch (err) {
        console.warn("Could not fetch Google Client ID from backend, using fallback:", err);
      }

      if (activeClientId) {
        // Check if Google GSI client is already loaded, otherwise check periodically
        if (window.google?.accounts?.id) {
          setIsGoogleScriptLoaded(true);
        } else {
          const checkInterval = setInterval(() => {
            if (window.google?.accounts?.id) {
              setIsGoogleScriptLoaded(true);
              clearInterval(checkInterval);
            }
          }, 100);

          setTimeout(() => clearInterval(checkInterval), 4000);
        }
      }
    };
    fetchClientIdAndSetup();
  }, [googleClientId]);

  // Initialize and render Google Sign-In Button on both tabs
  useEffect(() => {
    if (isGoogleScriptLoaded && googleClientId && googleBtnContainerRef.current) {
      try {
        /* global google */
        if (window.google?.accounts?.id) {
          googleBtnContainerRef.current.innerHTML = '';
          google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true
          });

          google.accounts.id.renderButton(
            googleBtnContainerRef.current,
            {
              type: 'standard',
              theme: 'filled_dark',
              size: 'large',
              text: 'continue_with', // Render "Continue with Google"
              shape: 'rectangular',
              logo_alignment: 'left',
              width: googleBtnContainerRef.current.offsetWidth || 354
            }
          );
        }
      } catch (err) {
        console.error("Google Sign-In button render failed:", err);
      }
    }
  }, [isLogin, isGoogleScriptLoaded, googleClientId]); // Re-render conditionally when switching tabs

  const handleGoogleCredentialResponse = async (response) => {
    setError('');
    setIsSubmitting(true);
    try {
      const user = await loginWithGoogle(response.credential);
      if (user) {
        if (user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        setError('Google Authentication was rejected by the server.');
      }
    } catch (err) {
      setError(err.message || 'Google Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      if (isLogin) {
        const user = await login(formData.username, formData.password);
        if (user) {
          if (user.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/');
          }
        } else {
          setError('Invalid username or password.');
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match.');
          setIsSubmitting(false);
          return;
        }
        if (formData.username.length < 3) {
          setError('Username must be at least 3 characters.');
          setIsSubmitting(false);
          return;
        }
        
        const result = await signup(formData.username, formData.password);
        if (result.success) {
          navigate('/');
        } else {
          setError(result.message);
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlaceholderClick = () => {
    alert("Google Authentication is in sandbox/setup mode. Please specify GOOGLE_CLIENT_ID in server/.env to activate live Google login!");
  };

  return (
    <div className="auth-page-container page-fade-in">
      <div className="auth-card glass">
        <div className="auth-tabs">
          <button 
            className={`auth-tab ${isLogin ? 'active' : ''}`} 
            onClick={() => { setIsLogin(true); setError(''); }}
            disabled={isSubmitting}
          >
            Login
          </button>
          <button 
            className={`auth-tab ${!isLogin ? 'active' : ''}`} 
            onClick={() => { setIsLogin(false); setError(''); }}
            disabled={isSubmitting}
          >
            Sign Up
          </button>
        </div>

        <h2 className="serif auth-title">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="auth-subtitle">
          {isLogin 
            ? 'Access your dashboard and manage your orders.' 
            : 'Join our community of art lovers and get your custom sketch.'}
        </p>

        <form key={isLogin ? 'login' : 'signup'} onSubmit={handleSubmit} className="auth-form module-fade-in">
          <div className="form-group">
            <label>Username / Email</label>
            <input 
              type="text" 
              name="username"
              value={formData.username} 
              onChange={handleChange} 
              placeholder="Enter username or email"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              name="password"
              value={formData.password} 
              onChange={handleChange} 
              placeholder="••••••••"
              required
              disabled={isSubmitting}
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label>Confirm Password</label>
              <input 
                type="password" 
                name="confirmPassword"
                value={formData.confirmPassword} 
                onChange={handleChange} 
                placeholder="••••••••"
                required
                disabled={isSubmitting}
              />
            </div>
          )}

          {error && <p className="auth-error">{error}</p>}
          
          <button type="submit" className="btn-primary w-full mt-1" disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : (isLogin ? 'Login' : 'Create Account')}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <div className="google-auth-section">
          {googleClientId ? (
            <div 
              ref={googleBtnContainerRef} 
              id="google-signin-button" 
              className="google-signin-btn-container"
              style={{ display: 'flex', justifyContent: 'center', minHeight: '44px' }}
            ></div>
          ) : (
            <button 
              type="button" 
              className="btn-google-fallback"
              onClick={handlePlaceholderClick}
            >
              <svg className="google-logo-svg" viewBox="0 0 24 24" width="18" height="18">
                <path fill="#EA4335" d="M12 5.04c1.67 0 3.2.58 4.4 1.7l3.28-3.28C17.7 1.58 15 .75 12 .75 7.3.75 3.33 3.4 1.34 7.28l3.96 3.06C6.27 7.26 8.9 5.04 12 5.04z" />
                <path fill="#4285F4" d="M23.45 12.3c0-.82-.07-1.6-.22-2.3H12v4.4h6.42c-.27 1.45-1.1 2.68-2.3 3.47l3.6 2.8c2.1-1.93 3.32-4.78 3.32-8.37z" />
                <path fill="#FBBC05" d="M5.3 14.78c-.24-.72-.37-1.5-.37-2.3s.13-1.58.37-2.3L1.34 7.28C.48 9 0 10.95 0 13s.48 4 1.34 5.72l3.96-2.94z" />
                <path fill="#34A853" d="M12 23.25c3.24 0 5.95-1.07 7.93-2.9l-3.6-2.8c-1.1.74-2.5 1.18-4.33 1.18-3.1 0-5.73-2.22-6.7-5.32L1.34 16.5C3.33 20.35 7.3 23.25 12 23.25z" />
              </svg>
              <span>Continue with Google</span>
            </button>
          )}
        </div>

        <div className="auth-footer">
          <p className="text-dim">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span 
              className="auth-link" 
              onClick={() => { if (!isSubmitting) { setIsLogin(!isLogin); setError(''); } }}
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
