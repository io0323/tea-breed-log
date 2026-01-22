import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { supabase } from "./lib/supabaseClient";
import { useEffect, useState } from "react";
import { AuthSession } from "@supabase/supabase-js";
import "./App.css";

// 遅延読み込みコンポーネント
const AuthForm = lazy(() => import("./components/auth/AuthForm").then((m: any) => m.default));
const TeaList = lazy(() => import("./components/TeaList").then((m: any) => m.default));
const TeaHealth = lazy(() => import("./pages/TeaHealth").then((m: any) => m.default));
const TeaDetails = lazy(() => import("./pages/TeaDetails").then((m: any) => m.default));
const EditTea = lazy(() => import("./pages/EditTea").then((m: any) => m.default));
const NewTea = lazy(() => import("./pages/NewTea").then((m: any) => m.default));

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
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tea-dark"></div>
          </div>
        }>
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
            <Route
              path="/teas/:id/health"
              element={session ? <TeaHealth /> : <Navigate to="/login" replace />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;