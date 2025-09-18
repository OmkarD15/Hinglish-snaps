import { useState } from "react";
import { useNavigate } from "react-router-dom";
// ✅ 1. Corrected the import path to be relative
import { useAuth } from "../store/auth-context.jsx";

const URL = "http://localhost:5000/api/auth/login";

export const Login = () => {
  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  // ✅ 2. Removed `setUser` as it's not needed here; AuthProvider will handle it
  const { storeTokenInLS } = useAuth(); 

  const handleInput = (e) => {
    let name = e.target.name;
    let value = e.target.value;

    setUser({
      ...user,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        storeTokenInLS(data.token);
        alert("Login Successful");
        navigate("/");
      } else {
        alert(data.message || "Invalid Credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred during login.");
    }
  };
  
  return (
    <section className="login-section">
      <main>
        <div className="container login-container">
          <div className="login-content">
            <h1 className="login-heading">Welcome Back</h1>
            <p className="login-subheading">Please log in to your account</p>
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={user.email}
                  onChange={handleInput}
                  className="form-input"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={user.password}
                  onChange={handleInput}
                  className="form-input"
                  placeholder="Enter your password"
                  required
                />
              </div>
              <button type="submit" className="btn-submit">Log In</button>
            </form>
            <p className="login-footer">
              Don't have an account? <a href="/register" className="register-link">Sign up</a>
            </p>
          </div>
        </div>
      </main>
    </section>
  );
};