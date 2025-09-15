import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Navbar } from "/Users/ovdah/Desktop/Endinews/server/frontend/Components/Navbar";
import { About } from "/Users/ovdah/Desktop/Endinews/server/frontend/pages/About";
import { Contact } from "/Users/ovdah/Desktop/Endinews/server/frontend/pages/Contact";
import { Error } from "/Users/ovdah/Desktop/Endinews/server/frontend/pages/Error";
import { Home } from "/Users/ovdah/Desktop/Endinews/server/frontend/pages/Home";
import { Login } from "/Users/ovdah/Desktop/Endinews/server/frontend/pages/Login";
import { Logout } from "/Users/ovdah/Desktop/Endinews/server/frontend/pages/Logout";
import { Register } from "/Users/ovdah/Desktop/Endinews/server/frontend/pages/Register";

const App = () => {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />y 
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="*" element={<Error />} />
            </Routes>
        </Router>
    );
};

export default App;
