import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Session, createClient } from '@supabase/supabase-js';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigError =
  !supabaseUrl || !supabaseKey
    ? 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in packages/desktop/.env.'
    : '';

export const supabase = supabaseConfigError
  ? null
  : createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    });

export type MfaChallenge = {
  mode: 'setup';
} | {
  mode: 'verify';
  factorId: string;
  friendlyName?: string;
};

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [mfaChallenge, setMfaChallenge] = useState<MfaChallenge | null>(null);
  const isDemoRef = React.useRef(false);

  React.useEffect(() => {
    const syncSession = async (nextSession: Session | null) => {
      setSession(nextSession);

      if (!nextSession || !supabase || nextSession.user?.id === 'demo-user-id') {
        setMfaChallenge(null);
        setAuthReady(true);
        return;
      }

      const { data: factorData, error: factorError } = await supabase.auth.mfa.listFactors();
      const factor = factorError ? null : factorData.totp.find((item) => item.status === 'verified');

      if (!factor) {
        setMfaChallenge({ mode: 'setup' });
        setAuthReady(true);
        return;
      }

      const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      if (aalError || aalData.currentLevel === aalData.nextLevel || aalData.nextLevel !== 'aal2') {
        setMfaChallenge(null);
        setAuthReady(true);
        return;
      }

      setMfaChallenge({
        mode: 'verify',
        factorId: factor.id,
        friendlyName: factor.friendly_name,
      });
      setAuthReady(true);
    };

    // Listen for Demo login event
    const handleDemo = () => {
      isDemoRef.current = true;
      const mockSession: any = {
        access_token: 'demo-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'demo-refresh',
        user: {
          id: 'demo-user-id',
          email: 'demo@clarityiq.ai',
          app_metadata: {},
          user_metadata: { full_name: 'Demo User' },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        }
      };
      setSession(mockSession);
      setMfaChallenge(null);
      setAuthReady(true);
    };

    const handleDemoLogout = () => {
      isDemoRef.current = false;
      setSession(null);
      setMfaChallenge(null);
      setAuthReady(true);
    };

    window.addEventListener('login-demo', handleDemo);
    window.addEventListener('logout-demo', handleDemoLogout);

    if (!supabase) {
      setAuthReady(true);
      return () => {
        window.removeEventListener('login-demo', handleDemo);
        window.removeEventListener('logout-demo', handleDemoLogout);
      };
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isDemoRef.current) syncSession(session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      isDemoRef.current = false;
      syncSession(session);
    });

    return () => {
      window.removeEventListener('login-demo', handleDemo);
      window.removeEventListener('logout-demo', handleDemoLogout);
      listener.subscription.unsubscribe();
    };
  }, []);

  if (!authReady) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0a0a1a', color: 'white', fontFamily: 'system-ui, sans-serif' }}>
        Checking authentication...
      </div>
    );
  }

  return (
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div style={{ fontFamily: 'system-ui, sans-serif', margin: 0, padding: 0 }}>
        <Routes>
          <Route
            path="/"
            element={session && !mfaChallenge ? <Navigate to="/app" /> : <LandingPage />}
          />
          <Route 
            path="/login" 
            element={!session || mfaChallenge ? (
              <Login
                supabase={supabase}
                configError={supabaseConfigError}
                mfaChallenge={mfaChallenge}
                onMfaVerified={async () => {
                  const { data } = await supabase?.auth.getSession() ?? { data: { session: null } };
                  setMfaChallenge(null);
                  setSession(data.session);
                }}
              />
            ) : <Navigate to="/app" />} 
          />
          <Route 
            path="/app" 
            element={session && !mfaChallenge ? <Dashboard session={session} /> : <Navigate to="/login" />} 
          />
        </Routes>
      </div>
    </HashRouter>
  );
}

export default App;
