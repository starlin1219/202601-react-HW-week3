import axios from "axios";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";

// API 設定
const API_BASE = import.meta.env.VITE_API_BASE;

export default function AdminHeader() {
  const navigate = useNavigate();
  const { isAuth, setIsAuth } = useAuth();

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE}/logout`);
      setIsAuth(false);

      document.cookie = "hexToken=; Max-Age=0;";
      delete axios.defaults.headers.common["Authorization"];

      navigate("/login", { replace: true });
    } catch (error) {
      alert(error.response?.data?.message);
    }
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-body-tertiary">
        <div className="container">
          <a className="navbar-brand" href="#">
            Sweetbyte
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div
            className="collapse navbar-collapse gap-3"
            id="navbarSupportedContent"
          >
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link to="/admin/products" className="nav-link">
                  產品列表
                </Link>
              </li>
            </ul>
            {isAuth ? (
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={handleLogout}
              >
                登出
              </button>
            ) : (
              <Link to="/login" className="btn btn-outline-primary">
                登入
              </Link>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
