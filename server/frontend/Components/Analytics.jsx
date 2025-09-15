import React from 'react';

export const Analytics = () => {
  return (
    <section className="section-analytics">
      <div className="container">
        <div className="grid grid-three-cols">
          <div className="analytics-item">
            <div className="icon">
              <img src="/images/icon1.jpg" alt="Icon 1" />
            </div>
            <h2>Real-Time Updates</h2>
            <p>Stay informed with the latest news as it happens, delivered straight to your device.</p>
          </div>
          <div className="analytics-item">
            <div className="icon">
              <img src="/images/icon2.jpg" alt="Icon 2" />
            </div>
            <h2>Concise Summaries</h2>
            <p>Get quick, easy-to-read summaries of the most important news stories.</p>
          </div>
          <div className="analytics-item">
            <div className="icon">
              <img src="/images/icon3.jpg" alt="Icon 3" />
            </div>
            <h2>Personalized Content</h2>
            <p>Receive news tailored to your interests and preferences.</p>
          </div>
        </div>
      </div>
    </section>
  );
};