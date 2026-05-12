import React, { useEffect, useRef, useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { Mail, Lock, ArrowRight, Loader2, Zap, Sparkles, ShieldCheck } from 'lucide-react';
import { colors, shadows } from './styles';

interface LoginProps {
  supabase: SupabaseClient | null;
  configError?: string;
  mfaChallenge?: {
    mode: 'setup';
  } | {
    mode: 'verify';
    factorId: string;
    friendlyName?: string;
  } | null;
  onMfaVerified?: () => void | Promise<void>;
}

export default function Login({ supabase, configError, mfaChallenge, onMfaVerified }: LoginProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaEnrollData, setMfaEnrollData] = useState<{ factorId: string; qrCode: string; secret: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const enrollmentStartedRef = useRef(false);
  const isMfaStep = Boolean(mfaChallenge);
  const isMfaSetup = mfaChallenge?.mode === 'setup';
  const isSuccessMessage = errorMsg.includes('successful') || errorMsg.includes('confirmed') || errorMsg.includes('verified');

  useEffect(() => {
    if (!supabase || !isMfaSetup || mfaEnrollData || enrollmentStartedRef.current) return;

    const startMfaEnrollment = async () => {
      enrollmentStartedRef.current = true;
      setLoading(true);
      setErrorMsg('');

      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'ClarityIQ',
        issuer: 'ClarityIQ',
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setMfaEnrollData({
          factorId: data.id,
          qrCode: data.totp.qr_code.startsWith('data:')
            ? data.totp.qr_code
            : `data:image/svg+xml;utf-8,${encodeURIComponent(data.totp.qr_code)}`,
          secret: data.totp.secret,
        });
        setErrorMsg('Scan the QR code, then enter the authenticator code to finish MFA setup.');
      }

      setLoading(false);
    };

    startMfaEnrollment();
  }, [isMfaSetup, mfaEnrollData, supabase]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    if (!supabase) {
      setErrorMsg(configError || 'Supabase is not configured.');
      setLoading(false);
      return;
    }

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setErrorMsg(error.message);
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) setErrorMsg(error.message);
      else if (data.session) setErrorMsg('Signup successful. Opening your dashboard...');
      else setErrorMsg('Signup successful. Check your email to confirm your account, then sign in.');
    }
    
    setLoading(false);
  };

  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    if (!supabase || !mfaChallenge) {
      setErrorMsg(configError || 'MFA is not ready. Please sign in again.');
      setLoading(false);
      return;
    }

    const normalizedCode = mfaCode.replace(/\s/g, '');
    let error;

    if (mfaChallenge.mode === 'setup') {
      if (!mfaEnrollData) {
        setErrorMsg('MFA setup is still loading. Try again in a moment.');
        setLoading(false);
        return;
      }

      const challenge = await supabase.auth.mfa.challenge({ factorId: mfaEnrollData.factorId });
      error = challenge.error;

      if (!error && challenge.data) {
        const verify = await supabase.auth.mfa.verify({
          factorId: mfaEnrollData.factorId,
          challengeId: challenge.data.id,
          code: normalizedCode,
        });
        error = verify.error;
      } else if (!error) {
        setErrorMsg('Could not create an MFA challenge. Please try again.');
        setLoading(false);
        return;
      }
    } else {
      const verify = await supabase.auth.mfa.challengeAndVerify({
        factorId: mfaChallenge.factorId,
        code: normalizedCode,
      });
      error = verify.error;
    }

    if (error) {
      setErrorMsg(error.message);
    } else {
      setErrorMsg('MFA verified. Opening your dashboard...');
      await onMfaVerified?.();
    }

    setLoading(false);
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: colors.bgDark,
      backgroundImage: colors.meshGradient,
      fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, system-ui, sans-serif",
      color: colors.textPrimary,
      padding: '2rem',
    }}>
      {/* Animated background elements */}
      <div style={{ 
        position: 'absolute', 
        width: '500px', 
        height: '500px', 
        background: colors.gradientPrimary, 
        borderRadius: '50%', 
        filter: 'blur(180px)', 
        opacity: 0.2, 
        top: '-15%', 
        left: '-10%',
        animation: 'float 8s ease-in-out infinite',
      }} />
      <div style={{ 
        position: 'absolute', 
        width: '400px', 
        height: '400px', 
        background: colors.gradientPurple, 
        borderRadius: '50%', 
        filter: 'blur(180px)', 
        opacity: 0.2, 
        bottom: '-10%', 
        right: '-8%',
        animation: 'float 10s ease-in-out infinite reverse',
      }} />

      <div style={{
        position: 'relative',
        zIndex: 10,
        background: colors.bgCard,
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        border: `1px solid ${colors.border}`,
        padding: '3rem',
        borderRadius: '32px',
        width: '100%',
        maxWidth: '460px',
        boxShadow: shadows.card,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        {/* Logo and Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            background: colors.gradientPrimary,
            borderRadius: '20px',
            marginBottom: '1.5rem',
            boxShadow: shadows.glow,
          }}>
            <Zap size={32} color="white" />
          </div>
          <h1 style={{ 
            margin: 0, 
            fontSize: '2.25rem', 
            fontWeight: 800, 
            letterSpacing: '-0.03em', 
            background: colors.gradientPrimary,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '0.5rem',
          }}>
            ClarityIQ
          </h1>
          <p style={{ 
            margin: 0, 
            color: colors.textSecondary, 
            fontSize: '1rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}>
            <Sparkles size={16} color={colors.primaryLight} />
            AI-powered sales intelligence
          </p>
        </div>

        {/* Tab Switcher */}
        {!isMfaStep && <div style={{ 
          display: 'flex', 
          marginBottom: '2rem', 
          background: 'rgba(0,0,0,0.3)', 
          padding: '4px', 
          borderRadius: '14px',
          border: `1px solid ${colors.border}`,
        }}>
          <button
            onClick={() => { setIsLogin(true); setErrorMsg(''); }}
            style={{ 
              flex: 1, 
              padding: '0.75rem', 
              borderRadius: '10px', 
              border: 'none', 
              cursor: 'pointer', 
              fontWeight: 700, 
              fontSize: '0.95rem',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
              background: isLogin ? colors.gradientPrimary : 'transparent', 
              color: isLogin ? 'white' : colors.textSecondary,
              boxShadow: isLogin ? shadows.button : 'none',
              fontFamily: 'inherit',
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsLogin(false); setErrorMsg(''); }}
            style={{ 
              flex: 1, 
              padding: '0.75rem', 
              borderRadius: '10px', 
              border: 'none', 
              cursor: 'pointer', 
              fontWeight: 700, 
              fontSize: '0.95rem',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
              background: !isLogin ? colors.gradientPrimary : 'transparent', 
              color: !isLogin ? 'white' : colors.textSecondary,
              boxShadow: !isLogin ? shadows.button : 'none',
              fontFamily: 'inherit',
            }}
          >
            Sign Up
          </button>
        </div>}

        {/* Form */}
        <form onSubmit={isMfaStep ? handleMfaVerify : handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {isMfaStep ? (
            <>
              <div style={{ textAlign: 'center', color: colors.textSecondary, lineHeight: 1.6, fontWeight: 500 }}>
                {isMfaSetup
                  ? 'Set up MFA before opening your dashboard.'
                  : `Enter the 6-digit code from your authenticator app${mfaChallenge?.mode === 'verify' && mfaChallenge.friendlyName ? ` for ${mfaChallenge.friendlyName}` : ''}.`}
              </div>
              {isMfaSetup && mfaEnrollData && (
                <div style={{ display: 'grid', gap: '0.875rem', justifyItems: 'center' }}>
                  <div style={{ background: 'white', padding: '0.75rem', borderRadius: '12px', width: '180px', height: '180px', display: 'grid', placeItems: 'center' }}>
                    <img src={mfaEnrollData.qrCode} alt="MFA QR code" style={{ width: '156px', height: '156px' }} />
                  </div>
                  <div style={{ color: colors.textMuted, fontSize: '0.78rem', lineHeight: 1.5, wordBreak: 'break-all', textAlign: 'center' }}>
                    Secret: {mfaEnrollData.secret}
                  </div>
                </div>
              )}
              <div style={{ position: 'relative' }}>
                <ShieldCheck size={20} color={colors.textMuted} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="Authentication code"
                  value={mfaCode}
                  required
                  minLength={6}
                  maxLength={8}
                  onChange={(e) => setMfaCode(e.target.value.replace(/[^\d]/g, '').slice(0, 8))}
                  className="login-input"
                  style={{ 
                    width: '100%', 
                    padding: '1.125rem 1.25rem 1.125rem 3.5rem', 
                    background: colors.bgInput, 
                    border: `1px solid ${colors.border}`, 
                    borderRadius: '14px', 
                    color: colors.textPrimary, 
                    outline: 'none', 
                    fontSize: '1.25rem', 
                    fontWeight: 700,
                    boxSizing: 'border-box', 
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    backdropFilter: 'blur(8px)',
                    fontFamily: 'inherit',
                    letterSpacing: '0.08em',
                  }}
                />
              </div>
            </>
          ) : (
            <>
          {/* Email Input */}
          <div style={{ position: 'relative' }}>
            <Mail size={20} color={colors.textMuted} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              style={{ 
                width: '100%', 
                padding: '1.125rem 1.25rem 1.125rem 3.5rem', 
                background: colors.bgInput, 
                border: `1px solid ${colors.border}`, 
                borderRadius: '14px', 
                color: colors.textPrimary, 
                outline: 'none', 
                fontSize: '1rem', 
                fontWeight: 500,
                boxSizing: 'border-box', 
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                backdropFilter: 'blur(8px)',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Password Input */}
          <div style={{ position: 'relative' }}>
            <Lock size={20} color={colors.textMuted} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              style={{ 
                width: '100%', 
                padding: '1.125rem 1.25rem 1.125rem 3.5rem', 
                background: colors.bgInput, 
                border: `1px solid ${colors.border}`, 
                borderRadius: '14px', 
                color: colors.textPrimary, 
                outline: 'none', 
                fontSize: '1rem', 
                fontWeight: 500,
                boxSizing: 'border-box', 
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                backdropFilter: 'blur(8px)',
                fontFamily: 'inherit',
              }}
            />
          </div>
            </>
          )}

          {/* Error/Success Message */}
          {(configError || errorMsg) && (
            <div style={{ 
              padding: '1rem', 
              background: isSuccessMessage ? colors.successBg : colors.dangerBg, 
              border: `1px solid ${isSuccessMessage ? colors.success : colors.danger}40`, 
              borderRadius: '12px', 
              color: isSuccessMessage ? colors.success : colors.danger, 
              fontSize: '0.9rem', 
              fontWeight: 600,
              textAlign: 'center',
              backdropFilter: 'blur(8px)',
            }}>
              {errorMsg || configError}
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading || !supabase}
            className="login-submit-btn"
            style={{ 
              marginTop: '0.5rem', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.625rem', 
              width: '100%', 
              padding: '1.125rem', 
              background: colors.gradientPrimary, 
              color: 'white', 
              border: 'none', 
              borderRadius: '14px', 
              fontSize: '1rem', 
              fontWeight: 700, 
              cursor: loading ? 'not-allowed' : 'pointer', 
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
              boxShadow: shadows.button,
              opacity: loading ? 0.7 : 1,
              fontFamily: 'inherit',
            }}
          >
            {loading ? (
              <>
                <Loader2 className="spinner" size={20} />
                Processing...
              </>
            ) : (
              <>
                {isMfaSetup ? 'Enable MFA and Continue' : isMfaStep ? 'Verify MFA' : isLogin ? 'Sign In to Dashboard' : 'Create Account'}
                <ArrowRight size={20} />
              </>
            )}
          </button>

          {/* Divider */}
          {!isMfaStep && <div style={{ position: 'relative', margin: '0.5rem 0', textAlign: 'center' }}>
            <div style={{ 
              position: 'absolute', 
              top: '50%', 
              left: 0, 
              right: 0, 
              height: '1px', 
              background: colors.border, 
              zIndex: 1 
            }} />
            <span style={{ 
              position: 'relative', 
              zIndex: 2, 
              background: colors.bgCard, 
              padding: '0 1rem', 
              color: colors.textMuted, 
              fontSize: '0.85rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              OR
            </span>
          </div>}

          {/* Demo Mode Button */}
          {!isMfaStep && <button 
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('login-demo'));
            }}
            className="demo-btn"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.625rem', 
              width: '100%', 
              padding: '1.125rem', 
              background: 'rgba(255,255,255,0.04)', 
              color: colors.textPrimary, 
              border: `1px solid ${colors.border}`, 
              borderRadius: '14px', 
              fontSize: '1rem', 
              fontWeight: 700, 
              cursor: 'pointer', 
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              backdropFilter: 'blur(8px)',
              fontFamily: 'inherit',
            }}
          >
            <Sparkles size={20} />
            Explore with Demo Mode
          </button>}
        </form>

        {/* Footer */}
        {!isMfaStep && <p style={{ 
          marginTop: '2rem', 
          textAlign: 'center', 
          color: colors.textMuted, 
          fontSize: '0.85rem',
          lineHeight: 1.6,
        }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            style={{
              background: 'none',
              border: 'none',
              color: colors.primary,
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
              fontFamily: 'inherit',
            }}
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>}
      </div>

      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
          
          .login-input:focus { 
            border-color: ${colors.primary} !important; 
            box-shadow: 0 0 0 3px ${colors.primaryGlow} !important;
          }
          
          .login-submit-btn:hover:not(:disabled) { 
            box-shadow: ${shadows.buttonHover} !important;
            transform: translateY(-2px);
          }
          
          .demo-btn:hover {
            background: rgba(255,255,255,0.08) !important;
            border-color: ${colors.borderLight} !important;
            transform: translateY(-2px);
          }
          
          .spinner { 
            animation: spin 1s linear infinite; 
          }
          
          @keyframes spin { 
            100% { transform: rotate(360deg); } 
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          
          input::placeholder {
            color: ${colors.textMuted};
            opacity: 0.7;
          }
        `}
      </style>
    </div>
  );
}
