import { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";
import { useAuth } from "../store/authcontext.jsx";

export const Navbar = () => {
  const { isLoggedIn } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header>
      <div className="container">
        <div className="logo-brand">
          <NavLink to="/" onClick={closeMobileMenu}>
            <span className="logo-icon">📰</span>
            Hinglish Snaps
          </NavLink>
        </div>

        {/* Hamburger Menu Button */}
        <button 
          className={`hamburger-btn ${isMobileMenuOpen ? "open" : ""}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>

        {/* Navigation Menu */}
        <nav className={isMobileMenuOpen ? "nav-open" : ""}>
          <ul>
            <li>
              <NavLink to="/" onClick={closeMobileMenu}>
                <span className="nav-icon">🏠</span> Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/about" onClick={closeMobileMenu}>
                <span className="nav-icon">ℹ️</span> About
              </NavLink>
            </li>
            <li>
              <NavLink to="/contact" onClick={closeMobileMenu}>
                <span className="nav-icon">✉️</span> Contact
              </NavLink>
            </li>
            {isLoggedIn ? (
              <li>
                <NavLink to="/logout" onClick={closeMobileMenu} className="nav-auth-btn logout">
                  <span className="nav-icon">🚪</span> Logout
                </NavLink>
              </li>
            ) : (
              <>
                <li>
                  <NavLink to="/register" onClick={closeMobileMenu} className="nav-auth-btn register">
                    <span className="nav-icon">✍️</span> Register
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/login" onClick={closeMobileMenu} className="nav-auth-btn login">
                    <span className="nav-icon">🔑</span> Login
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </nav>

        {/* Overlay for mobile menu */}
        {isMobileMenuOpen && (
          <div className="nav-overlay" onClick={closeMobileMenu}></div>
        )}
      </div>
    </header>
  );
};
