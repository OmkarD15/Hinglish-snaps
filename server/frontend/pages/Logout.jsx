import { useEffect } from "react";
import { Navigate } from "react-router-dom";
// ✅ FIX: Corrected the import path to be relative
import { useAuth } from "../src/store/auth-context.jsx";

export const Logout = () => {
  const { removeTokenFromLS } = useAuth();

  useEffect(() => {
    removeTokenFromLS(); // Call the logout function
  }, [removeTokenFromLS]); // ✅ Best Practice: Include function in dependency array

  return <Navigate to="/login" />;
};