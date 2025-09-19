import { NavLink } from "react-router-dom";
// ✅ 1. Corrected the import path to match directory casing
import { Analytics } from "../Components/Analytics";

export const About = () => {
  return (
    <>
      <main>
        <section className="about-section">
          <div className="container grid grid-two-cols">
            <div className="about-content">
              <h1 className="about-heading">Why Choose Us?</h1>
              <p className="about-description">
                {/* ✅ 2. Updated brand name for consistency */}
                The objective of Hinglish Snaps is to provide concise, 50-60 word summaries, offering quick, accessible updates on tech and finance, saving time while keeping users informed and engaged.
              </p>
              <div className="btn-group">
                <NavLink to="/contact">
                  <button className="btn-primary">Connect Now</button>
                </NavLink>
                <button className="btn-secondary">Learn More</button>
              </div>
            </div>
            <div className="about-image">
              <img
                src="/images/about.jpg"
                alt="Why Choose Us"
                className="animated-image"
              />
            </div>
          </div>
        </section>
        <Analytics />
      </main>
      <footer className="footer">
        <p>Simplified for everyone</p>
      </footer>
    </>
  );
};