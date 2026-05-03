import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Session, createClient } from '@supabase/supabase-js';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';

// Supabase client initialization (Placeholder for env vars)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseKey);

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  React.useEffect(() => {
    // Listen for Demo login event
    const handleDemo = () => {
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
      setIsDemo(true);
    };

    const handleDemoLogout = () => {
      setIsDemo(false);
      setSession(null);
    };

    window.addEventListener('login-demo', handleDemo);
    window.addEventListener('logout-demo', handleDemoLogout);

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isDemo) setSession(session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isDemo) setSession(session);
    });

    return () => {
      window.removeEventListener('login-demo', handleDemo);
      window.removeEventListener('logout-demo', handleDemoLogout);
      listener.subscription.unsubscribe();
    };
  }, [isDemo]);

  return (
    <HashRouter>
      <div style={{ fontFamily: 'system-ui, sans-serif', margin: 0, padding: 0 }}>
        <Routes>
          <Route
            path="/"
            element={session ? <Navigate to="/app" /> : <LandingPage />}
          />
          <Route 
            path="/login" 
            element={!session ? <Login supabase={supabase} /> : <Navigate to="/app" />} 
          />
          <Route 
            path="/app" 
            element={session ? <Dashboard session={session} /> : <Navigate to="/login" />} 
          />
        </Routes>
      </div>
    </HashRouter>
  );
}

export default App;
