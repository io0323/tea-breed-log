import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthForm } from "./components/auth/AuthForm";
import { TeaList } from "./components/TeaList";
import { TeaHealth } from "./pages/TeaHealth";
import { TeaDetails } from "./pages/TeaDetails";
import { EditTea } from "./pages/EditTea";
import { NewTea } from "./pages/NewTea";
import { supabase } from "./lib/supabaseClient";
import { useEffect, useState } from "react";
import { AuthSession } from "@supabase/supabase-js";
import { Toaster } from "react-hot-toast";
import "./App.css";

function App() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tea-dark"></div>
      </div>
    );
  }

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
            element={session ? <TeaList 
              teas={[]} 
              onTeaSelect={() => {}} 
              onTeaEdit={() => {}} 
              onTeaDelete={() => {}} 
            /> : <Navigate to="/login" replace />}
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
          <Route
            path="/teas/:id/health"
            element={session ? <TeaHealth /> : <Navigate to="/login" replace />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;