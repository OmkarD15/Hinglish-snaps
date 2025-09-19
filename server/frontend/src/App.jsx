import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Navbar } from "./Components/Navbar";
import { About } from "./pages/About";
import { Contact } from "./pages/Contact";
import { Error } from "./pages/Error";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Logout } from "./pages/Logout";
import { Register } from "./pages/Register";

const App = () => {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                {/* ✅ FIX: Removed the stray 'y' character which was a syntax error */}
                <Route path="/contact" element={<Contact />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="*" element={<Error />} />
            </Routes>
        </Router>
    );
};

export default App;