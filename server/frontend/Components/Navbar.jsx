import { NavLink } from "react-router-dom";
import "/Users/ovdah/Desktop/Endinews/server/frontend/Components/Navbar.css";
import { useAuth } from "/Users/ovdah/Desktop/Endinews/server/frontend/src/store/authcontext";

export const Navbar = () => {
  const { isLoggedIn } = useAuth();
  console.log("login or not ", isLoggedIn);
  return (
    <>
      <header>
        <div className="container">
          <div className="logo-brand">
            <NavLink to="/">ENDI NEWS</NavLink>
          </div>

          <nav>
            <ul>
              <li>
                <NavLink to="/"> Home </NavLink>
              </li>
              <li>
                <NavLink to="/about"> About </NavLink>
              </li>
              <li>
                <NavLink to="/contact"> Contact </NavLink>
              </li>

              {isLoggedIn ? (
                <li>
                  <NavLink to="/logout">Logout</NavLink>
                </li>
              ) : (
                <>
                  <li>
                    <NavLink to="/register"> Register </NavLink>
                  </li>
                  <li>
                    <NavLink to="/login"> Login </NavLink>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </header>
    </>
  );
};