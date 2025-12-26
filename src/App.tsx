import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthForm } from "./components/auth/AuthForm";
import { TeaList } from "./components/TeaList";
import { TeaDetails } from "./pages/TeaDetails";
import { EditTea } from "./pages/EditTea";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { supabase } from "./lib/supabaseClient";
import { useEffect, useState } from "react";
import { AuthSession } from "@supabase/supabase-js";
import { Toaster } from "react-hot-toast";
import { NewTea } from "./pages/NewTea";
import "./App.css";

const AppContent = () => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const { setUser } = useAuth();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  return (
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
        <Route
          path="/teas/new"
          element={session ? <NewTea /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/teas/:id"
          element={session ? <TeaDetails /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/teas/:id/edit"
          element={session ? <EditTea /> : <Navigate to="/login" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
