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

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

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
