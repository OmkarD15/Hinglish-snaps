import { useEffect, useState } from "react";
import { useAuth } from "/Users/ovdah/Desktop/Endinews/server/frontend/src/store/authcontext";

const defaultContactFormData = {
    username: "",
    email: "",
    message: "",
};

export const Contact = () => {
    const [data, setData] = useState(defaultContactFormData);
    const { user } = useAuth();
    const [isUserDataFetched, setIsUserDataFetched] = useState(false);

    useEffect(() => {
        // Update the form data with user information only once
        if (user && !isUserDataFetched) {
            setData({
                username: user.username || "",
                email: user.email || "",
                message: "",
            });
            setIsUserDataFetched(true); // Prevent re-fetching user data
        }
    }, [user, isUserDataFetched]);

    const handleInput = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({ ...prev, [name]: value }));
    };

    const handleContactForm = async (e) => {
        e.preventDefault();
        console.log("Form submitted with data: ", data);
        try {
            const response = await fetch("http://localhost:5000/api/form/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            console.log("response: ", response);
            // alert(response);

            if (response.ok) {
                setData(defaultContactFormData);
                const responseData = await response.json();
                alert("Message Send Successfully!");
                console.log(responseData);
            } else {
                // Handle API error here
                console.error("API Error:", response.status, response.statusText);
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <section className="contact-section">
          <div className="contact-container">
            <h1 className="contact-title">Get in Touch</h1>
            <p className="contact-description">We’d love to hear from you!</p>
            <div className="contact-form-wrapper">
              <form className="contact-form" onSubmit={handleContactForm}>
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