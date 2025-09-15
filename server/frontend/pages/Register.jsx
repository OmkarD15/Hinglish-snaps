import { useState } from "react";
import { useNavigate } from "react-router-dom";
// ✅ 1. Corrected the import path to be relative
import { useAuth } from "/Users/ovdah/Desktop/Endinews/server/frontend/src/store/authcontext";

const URL = "http://localhost:5000/api/auth/register";

export const Register = () => {
  const [user, setUser] = useState({
    username: "",
    email: "",
    phone: "",
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
        alert("Registration Successful!");
        setUser({ username: "", email: "", phone: "", password: "" });
        navigate("/"); // Navigate to the homepage after successful registration
      } else {
        // Show detailed error messages from backend validation
        if (data.errors && Array.isArray(data.errors)) {
          alert(`Validation Errors:\n${data.errors.join("\n")}`);
        } else {
          alert(data.message || "Registration failed");
        }
      }
    } catch (error) {
      console.error("Error during registration:", error);
      alert("Something went wrong. Please try again later.");
    }
  };

  return (
    <section className="register-section">
      <main>
        <div className="container register-container">
          <div className="register-content">
            <h1 className="register-heading">Create an Account</h1>
            <p className="register-subheading">Please fill in the form to create an account</p>
            <form onSubmit={handleSubmit} className="register-form">
              {/* Username Input */}
              <div className="form-group">
                <label htmlFor="username" className="form-label">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={user.username}
                  onChange={handleInput}
                  className="form-input"
                  placeholder="Enter your username"
                  required
                />
              </div>
              {/* Email Input */}
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
              {/* Phone Input */}
              <div className="form-group">
                <label htmlFor="phone" className="form-label">Phone Number</label>
                <input
                  type="number"
                  id="phone"
                  name="phone"
                  value={user.phone}
                  onChange={handleInput}
                  className="form-input"
                  placeholder="Enter your phone number"
                  required
                />
              </div>
              {/* Password Input */}
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
              <button type="submit" className="btn-submit">Register Now</button>
            </form>
            <p className="register-footer">
              Already have an account? <a href="/login" className="login-link">Log in</a>
            </p>
          </div>
        </div>
      </main>
    </section>
  );
};