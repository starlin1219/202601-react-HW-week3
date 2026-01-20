import { Navigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";

export default function RequireAuth({ children }) {
  const { isAuth, isCheckingAuth } = useAuth();

  if (isCheckingAuth) {
    return (
      <div className="d-flex justify-content-center align-items-center gap-3 vh-100">
        資料驗證中…
        <div className="spinner-border" role="status" />
      </div>
    );
  }

  if (!isAuth) return <Navigate to="/login" replace />;

  return children;
}
