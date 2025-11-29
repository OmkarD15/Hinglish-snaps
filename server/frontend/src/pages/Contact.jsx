import { useEffect, useState } from "react";
// ✅ 1. Corrected the import path to be relative
import { useAuth } from "../store/authcontext.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const defaultContactFormData = {
  username: "",
  email: "",
  message: "",
};

export const Contact = () => {
  const [data, setData] = useState(defaultContactFormData);
  const { user } = useAuth();

  // ✅ 2. Simplified the useEffect hook for pre-filling data
  useEffect(() => {
    if (user) {
      setData({
        username: user.username,
        email: user.email,
        message: "", // Keep message field clear
      });
    }
  }, [user]); // This effect now only depends on the user object

  const handleInput = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContactForm = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/form/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setData(defaultContactFormData);
        alert("Message Sent Successfully!");
      } else {
        console.error("API Error:", response.status, response.statusText);
        alert("Failed to send message.");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <section className="contact-section">
      <div className="contact-container">
        <h1 className="contact-title">Get in Touch</h1>
        <p className="contact-description">We’d love to hear from you!</p>
        <div className="contact-form-wrapper">
          <form className="contact-form" onSubmit={handleContactForm}>
            {/* Form groups remain the same */}
            <div className="form-group">
              <label htmlFor="username" className="form-label">Name</label>
              <input
                type="text"
                id="username"
                name="username"
                className="form-input"
                value={data.username}
                onChange={handleInput}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                value={data.email}
                onChange={handleInput}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="message" className="form-label">Message</label>
              <textarea
                id="message"
                name="message"
                className="form-input"
                rows="5"
                value={data.message}
                onChange={handleInput}
                required
              />
            </div>
            <button type="submit" className="contact-btn">Send Message</button>
          </form>
        </div>
      </div>
    </section>
  );
};