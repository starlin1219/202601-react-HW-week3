import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";

// API 設定
const API_BASE = import.meta.env.VITE_API_BASE;

export default function Login() {
  const navigate = useNavigate();
  const { setIsAuth } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((preData) => ({
      ...preData,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/admin/signin`, formData);

      const { token, expired } = res.data;
      document.cookie = `hexToken=${token};expires=${new Date(expired)}`;
      axios.defaults.headers.common["Authorization"] = token;

      setIsAuth(true);
      navigate("/admin/products", { replace: true });
    } catch (error) {
      setIsAuth(false);
      alert(error.response?.data?.message || "登入失敗");
    }
  };

  return (
    <>
      <section className="bg-primary-subtle">
        <div className="container">
          <div className="login mx-auto">
            <div className="card p-4">
              <div className="card-body">
                <h1>請先登入</h1>
                <form onSubmit={(e) => handleLogin(e)}>
                  <div className="form-floating mb-3">
                    <input
                      type="email"
                      className="form-control"
                      name="username"
                      id="username"
                      value={formData.username}
                      placeholder="name@example.com"
                      onChange={handleInputChange}
                    />
                    <label htmlFor="username">Email address</label>
                  </div>
                  <div className="form-floating mb-3">
                    <input
                      type="password"
                      className="form-control"
                      name="password"
                      id="password"
                      value={formData.password}
                      placeholder="Password"
                      onChange={handleInputChange}
                    />
                    <label htmlFor="password">Password</label>
                  </div>
                  <button type="submit" className="btn btn-primary w-100">
                    登入
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
