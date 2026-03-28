"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchCurrentUser } from "../../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = localStorage.getItem("neuronews_auth");
        if (raw) {
          const parsed = JSON.parse(raw);
          setUser(parsed.user || null);
          setToken(parsed.token || "");
        }

        if (raw) {
          const fresh = await fetchCurrentUser();
          const refreshed = {
            user: fresh.user,
            token: JSON.parse(raw).token
          };
          setUser(refreshed.user);
          localStorage.setItem("neuronews_auth", JSON.stringify(refreshed));
        }
      } catch (_error) {
        localStorage.removeItem("neuronews_auth");
        setUser(null);
        setToken("");
      } finally {
        setReady(true);
      }
    })();
  }, []);

  function login(payload) {
    const data = {
      user: payload.user,
      token: payload.token
    };
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem("neuronews_auth", JSON.stringify(data));
  }

  function logout() {
    setUser(null);
    setToken("");
    localStorage.removeItem("neuronews_auth");
  }

  const value = useMemo(
    () => ({
      user,
      token,
      ready,
      login,
      logout,
      isAuthenticated: Boolean(user && token)
    }),
    [user, token, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
