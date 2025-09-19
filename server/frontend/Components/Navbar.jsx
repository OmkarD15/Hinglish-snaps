import { NavLink } from "react-router-dom";
import "./Navbar.css";
// ✅ FIX: Corrected the relative path to include the 'src' directory
import { useAuth } from "../src/store/auth-context.jsx";

export const Navbar = () => {
  const { isLoggedIn } = useAuth();
  return (
    <header>
      <div className="container">
        <div className="logo-brand">
          <NavLink to="/">Hinglish Snaps</NavLink>
        </div>
        <nav>
          <ul>
            <li><NavLink to="/"> Home </NavLink></li>
            <li><NavLink to="/about"> About </NavLink></li>
            <li><NavLink to="/contact"> Contact </NavLink></li>
            {isLoggedIn ? (
              <li><NavLink to="/logout">Logout</NavLink></li>
            ) : (
              <>
                <li><NavLink to="/register"> Register </NavLink></li>
                <li><NavLink to="/login"> Login </NavLink></li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};