import { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;

const AuthContext = createContext();

function getTokenFromCookie() {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("hexToken="))
    ?.split("=")[1];
}

export function AuthProvider({ children }) {
  const [isAuth, setIsAuth] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const checkAuth = async () => {
    setIsCheckingAuth(true);

    try {
      const token = getTokenFromCookie();

      if (!token) {
        setIsAuth(false);
        return;
      }

      axios.defaults.headers.common["Authorization"] = token;

      const res = await axios.post(`${API_BASE}/api/user/check`);
      setIsAuth(!!res.data?.success);

      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setIsAuth(false);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value = useMemo(
    () => ({
      isAuth,
      setIsAuth,
      isCheckingAuth,
      checkAuth,
    }),
    [isAuth, isCheckingAuth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);

  return context;
}
