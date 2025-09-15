import { createContext, useCallback, useContext, useEffect, useState } from "react";

// 1. Create the context
export const AuthContext = createContext();

// 2. Define the Provider component
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const storeTokenInLS = (serverToken) => {
    setToken(serverToken);
    return localStorage.setItem("token", serverToken);
  };

  const removeTokenFromLS = () => {
    setToken(null);
    setUser(null);
    return localStorage.removeItem("token");
  };

  const isLoggedIn = !!token;

  // Function to fetch logged-in user data
  const userAuthentication = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:5000/api/auth/user", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        removeTokenFromLS();
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    userAuthentication();
  }, [userAuthentication]);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        storeTokenInLS,
        removeTokenFromLS,
        user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 3. Define the custom hook
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};