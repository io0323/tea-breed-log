import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthForm } from "./components/auth/AuthForm";
import { TeaList } from "./components/TeaList";
import { supabase } from "./lib/supabaseClient";
import { useEffect, useState } from "react";
import { AuthSession } from "@supabase/supabase-js";
import { Toaster } from "react-hot-toast";
import "./App.css";

function App() {
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-tea-light">
        <Toaster position="top-right" />
        <Routes>
          <Route
            path="/login"
            element={!session ? <AuthForm /> : <Navigate to="/" replace />}
          />
          <Route
            path="/"
            element={session ? <TeaList /> : <Navigate to="/login" replace />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
