import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { api } from '../utils/api';
import './AuthPage.css';

const AuthPage = ({ login, signup, loginWithGoogle, finalizeLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [consentPolicy, setConsentPolicy] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);



  // Forgot Password States (Available for both Users & Admin)
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1 = Request Code, 2 = Enter Code & New Password
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotTargetUsername, setForgotTargetUsername] = useState('');
  const [forgotResetToken, setForgotResetToken] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotEmailHint, setForgotEmailHint] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  
  // Google Auth Client ID State
  const defaultClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '655065657609-4p51158vudfvmdq2vki69vurkoqj457q.apps.googleusercontent.com';
  const [googleClientId, setGoogleClientId] = useState(defaultClientId);
  const [isGoogleScriptLoaded, setIsGoogleScriptLoaded] = useState(false);
  const googleBtnContainerRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

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
    if (isGoogleScriptLoaded && googleClientId && googleBtnContainerRef.current && !showForgotPassword) {
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
              text: 'continue_with',
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
  }, [isLogin, isGoogleScriptLoaded, googleClientId, showForgotPassword]);

  const handleGoogleCredentialResponse = async (response) => {
    setError('');
    setIsSubmitting(true);
    try {
      const user = await loginWithGoogle(response.credential);
      if (user) {
        api.recordConsent({
          identifier: user.username || 'google_user',
          purpose: 'google_oauth_dpdp',
          consented: true,
          notice_version: '2026.1-DPDP'
        });
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
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
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
        
        if (!consentPolicy) {
          setError('Under Section 6 of the DPDP Act (India), explicit consent to our Privacy Notice is required to establish an atelier account.');
          setIsSubmitting(false);
          return;
        }

        const result = await signup(formData.username, formData.password);
        if (result.success) {
          api.recordConsent({
            identifier: formData.username,
            purpose: 'account_creation_dpdp',
            consented: true,
            notice_version: '2026.1-DPDP'
          });
          if (consentMarketing) {
            api.recordConsent({
              identifier: formData.username,
              purpose: 'marketing_communications',
              consented: true,
              notice_version: '2026.1-DPDP'
            });
          }
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



  // Forgot Password: Step 1 Request Code
  const handleRequestPasswordReset = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (!forgotIdentifier.trim()) {
      setForgotError('Please enter your registered username or email.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.forgotPassword({ identifier: forgotIdentifier.trim() });
      if (res?.success) {
        setForgotTargetUsername(res.username);
        setForgotEmailHint(res.emailHint || 'your registered email');
        setForgotStep(2);
        setForgotSuccess(`Verification code dispatched to ${res.emailHint || 'your email'}.`);
      } else {
        setForgotError(res?.message || 'Account not found.');
      }
    } catch (err) {
      setForgotError(err.message || 'Could not find account.');
    } finally {
      setIsSubmitting(false);
    }
  };

    // Forgot Password: Step 2 Verify Code
  const handleVerifyResetCode = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (!forgotOtp.trim() || forgotOtp.trim().length !== 6) {
      setForgotError('Please enter the 6-digit verification code.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.verifyResetCode({
        username: forgotTargetUsername,
        otp: forgotOtp.trim()
      });

      if (res?.success) {
        setForgotResetToken(res.resetToken);
        setForgotStep(3);
        setForgotSuccess('Code verified successfully! Please enter your new password below.');
      } else {
        setForgotError(res?.message || 'Invalid verification code.');
      }
    } catch (err) {
      setForgotError(err.message || 'Invalid verification code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Forgot Password: Step 3 Set New Password
  const handleExecutePasswordReset = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (forgotNewPassword.length < 6) {
      setForgotError('New password must be at least 6 characters long.');
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('New passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.resetPassword({
        username: forgotTargetUsername,
        resetToken: forgotResetToken,
        otp: forgotOtp.trim(),
        newPassword: forgotNewPassword
      });

      if (res?.success) {
        setShowForgotPassword(false);
        setIsLogin(true);
        setFormData(prev => ({ ...prev, username: forgotTargetUsername, password: '' }));
        setSuccessMessage('Password updated successfully! Please log in with your new password.');
        setError('');
      } else {
        setForgotError(res?.message || 'Password update failed.');
      }
    } catch (err) {
      setForgotError(err.message || 'Password update failed.');
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

        {/* ===================================================================
            VIEW 1: ADMIN 2FA OTP VERIFICATION SCREEN (ONLY FOR ADMIN)
           =================================================================== */}
        {showForgotPassword ? (
          <div className="forgot-password-card module-fade-in">
            <h2 className="serif auth-title">Reset Password</h2>
            <p className="auth-subtitle">
              {forgotStep === 1 
                ? 'Enter your registered username or email to receive a 6-digit reset code.' 
                : `Enter the 6-digit code sent to ${forgotEmailHint} and pick a new password.`}
            </p>

            {forgotError && <p className="auth-error">{forgotError}</p>}
            {forgotSuccess && <p className="auth-success-alert">{forgotSuccess}</p>}
            

            {forgotStep === 1 ? (
              <form onSubmit={handleRequestPasswordReset} className="auth-form">
                <div className="form-group">
                  <label>Registered Username or Email</label>
                  <input 
                    type="text" 
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    placeholder="Enter username or email"
                    required
                    disabled={isSubmitting}
                  />
                  <small style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                    Admin account: enter <code>aesthetic_by_nikhil</code> or <code>nikhilappari2006@gmail.com</code>
                  </small>
                </div>

                <button type="submit" className="btn-primary w-full mt-1" disabled={isSubmitting}>
                  {isSubmitting ? 'Dispatching Reset Code...' : 'Send 6-Digit Reset Code'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleExecutePasswordReset} className="auth-form">
                <div className="form-group">
                  <label>6-Digit Reset Code</label>
                  <input 
                    type="text" 
                    maxLength="6"
                    placeholder="••••••"
                    style={{ textAlign: 'center', fontSize: '1.4rem', letterSpacing: '6px', fontFamily: 'monospace' }}
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label>New Password (min 6 characters)</label>
                  <input 
                    type="password" 
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input 
                    type="password" 
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <button type="submit" className="btn-primary w-full mt-1" disabled={isSubmitting}>
                  {isSubmitting ? 'Updating Password...' : 'Reset Password & Proceed'}
                </button>
              </form>
            )}

            <div style={{ textAlign: 'center', marginTop: '1.75rem' }}>
              <button 
                type="button" 
                className="auth-sub-link" 
                onClick={() => { setShowForgotPassword(false); setForgotStep(1); setForgotError(''); setForgotSuccess(''); }}
              >
                ← Back to Login
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="auth-tabs">
              <button 
                className={`auth-tab ${isLogin ? 'active' : ''}`} 
                onClick={() => { setIsLogin(true); setError(''); setSuccessMessage(''); }}
                disabled={isSubmitting}
              >
                Login
              </button>
              <button 
                className={`auth-tab ${!isLogin ? 'active' : ''}`} 
                onClick={() => { setIsLogin(false); setError(''); setSuccessMessage(''); }}
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
                ? 'Access your dashboard and manage your custom portrait orders.' 
                : 'Join our community of art lovers and commission your portrait.'}
            </p>

            {successMessage && <p className="auth-success-alert">{successMessage}</p>}

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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ margin: 0 }}>Password</label>
                  {isLogin && (
                    <button 
                      type="button" 
                      className="auth-sub-link" 
                      onClick={() => {
                        setShowForgotPassword(true);
                        setForgotStep(1);
                        setForgotIdentifier(formData.username || '');
                        setError('');
                        setForgotError('');
                        setForgotSuccess('');
                      }}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
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

              {!isLogin && (
                <div className="dpdp-consent-group" style={{ marginTop: '0.85rem', marginBottom: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', textAlign: 'left' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '0.78rem', color: '#c7cbd1', lineHeight: '1.4' }}>
                    <input 
                      type="checkbox" 
                      checked={consentPolicy} 
                      onChange={(e) => setConsentPolicy(e.target.checked)}
                      style={{ marginTop: '3px', accentColor: 'var(--accent-gold)', width: '15px', height: '15px', flexShrink: 0 }}
                    />
                    <span>
                      <strong style={{ color: '#fff' }}>[Required]</strong> I consent to Aesthetic by Nikhil processing my username and credentials in accordance with the{' '}
                      <Link to="/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-gold)', textDecoration: 'underline' }}>DPDP Privacy Notice</Link> and{' '}
                      <Link to="/terms-of-service" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-gold)', textDecoration: 'underline' }}>Terms</Link>.
                    </span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '0.78rem', color: '#9aa0a6', lineHeight: '1.4' }}>
                    <input 
                      type="checkbox" 
                      checked={consentMarketing} 
                      onChange={(e) => setConsentMarketing(e.target.checked)}
                      style={{ marginTop: '3px', accentColor: 'var(--accent-gold)', width: '15px', height: '15px', flexShrink: 0 }}
                    />
                    <span>
                      <em>(Optional)</em> I consent to receiving atelier updates, anniversary sketch reminders, and studio preview invitations.
                    </span>
                  </label>
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
              <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#7a858e', marginBottom: '0.5rem', lineHeight: '1.35' }}>
                🔒 <span>Identity verified securely under DPDP Act 2023. No access to contacts or personal files.</span>
              </p>
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
                  onClick={() => { if (!isSubmitting) { setIsLogin(!isLogin); setError(''); setSuccessMessage(''); } }}
                >
                  {isLogin ? 'Sign Up' : 'Login'}
                </span>
              </p>
            </div>

            <div className="auth-legal-notice" style={{ textAlign: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.75rem', color: '#889999' }}>
              <p style={{ margin: 0, lineHeight: 1.5 }}>
                By continuing, you agree to Aesthetic by Nikhil's{' '}
                <Link to="/terms-of-service" style={{ color: 'var(--accent-gold)', textDecoration: 'underline' }}>Terms of Service</Link> and{' '}
                <Link to="/privacy-policy" style={{ color: 'var(--accent-gold)', textDecoration: 'underline' }}>Privacy Policy</Link>.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
