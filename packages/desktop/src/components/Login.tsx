import React, { useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

interface LoginProps {
  supabase: SupabaseClient;
}

export default function Login({ supabase }: LoginProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setErrorMsg(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setErrorMsg(error.message);
      else setErrorMsg('Signup successful! You can now log in.');
    }
    
    setLoading(false);
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
      fontFamily: "'Inter', system-ui, sans-serif",
      color: 'white'
    }}>
      {/* Background Orbs */}
      <div style={{ position: 'absolute', width: '400px', height: '400px', background: '#3b82f6', borderRadius: '50%', filter: 'blur(150px)', opacity: 0.3, top: '-10%', left: '-10%' }} />
      <div style={{ position: 'absolute', width: '300px', height: '300px', background: '#8b5cf6', borderRadius: '50%', filter: 'blur(150px)', opacity: 0.3, bottom: '10%', right: '-5%' }} />

      <div style={{
        position: 'relative',
        zIndex: 10,
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '3rem',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.025em', background: 'linear-gradient(to right, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ClarityIQ
          </h1>
          <p style={{ marginTop: '0.5rem', color: '#94a3b8', fontSize: '0.95rem' }}>The Deal Arc Engine</p>
        </div>

        <div style={{ display: 'flex', marginBottom: '2rem', background: 'rgba(0,0,0,0.2)', padding: '0.25rem', borderRadius: '12px' }}>
          <button
            onClick={() => { setIsLogin(true); setErrorMsg(''); }}
            style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s', background: isLogin ? '#fff' : 'transparent', color: isLogin ? '#0f172a' : '#94a3b8' }}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsLogin(false); setErrorMsg(''); }}
            style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s', background: !isLogin ? '#fff' : 'transparent', color: !isLogin ? '#0f172a' : '#94a3b8' }}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ position: 'relative' }}>
            <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', outline: 'none', fontSize: '1rem', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', outline: 'none', fontSize: '1rem', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
            />
          </div>

          {errorMsg && (
            <div style={{ padding: '0.75rem', background: errorMsg.includes('successful') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: errorMsg.includes('successful') ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: errorMsg.includes('successful') ? '#34d399' : '#f87171', fontSize: '0.875rem', textAlign: 'center' }}>
              {errorMsg}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s', boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)' }}
          >
            {loading ? <Loader2 className="spinner" size={18} /> : (isLogin ? 'Sign In to Dashboard' : 'Create Account')}
            {!loading && <ArrowRight size={18} />}
          </button>

          <div style={{ position: 'relative', margin: '1rem 0', textAlign: 'center' }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.1)', zIndex: 1 }} />
            <span style={{ position: 'relative', zIndex: 2, background: '#1e203c', padding: '0 1rem', color: '#64748b', fontSize: '0.85rem' }}>OR</span>
          </div>

          <button 
            type="button"
            onClick={() => {
              // We'll handle this in App.tsx by passing a custom event or using a shared state
              window.dispatchEvent(new CustomEvent('login-demo'));
            }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            Explore with Demo Mode
          </button>
        </form>
      </div>

      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&display=swap');
          input:focus { border-color: #3b82f6 !important; }
          button[type="submit"]:hover:not(:disabled) { background: #2563eb !important; }
          .spinner { animation: spin 1s linear infinite; }
          @keyframes spin { 100% { transform: rotate(360deg); } }
        `}
      </style>
    </div>
  );
}
