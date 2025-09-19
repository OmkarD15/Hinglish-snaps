import { useEffect, useState } from 'react';
import Card from '../Components/Card.jsx';

// ✅ This line reads the live backend URL from the environment variable on Vercel.
//    If it can't find it (like when you run it locally), it falls back to localhost.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const Home = () => {
    const [category, setCategory] = useState("finance");
    const [newsData, setNewsData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const getData = async () => {
        setIsLoading(true);
        try {
            // ✅ Using the API_URL variable for the fetch call
            const response = await fetch(`${API_URL}/api/news?category=${category}`);
            const jsonData = await response.json();
            setNewsData(jsonData);
        } catch (error) {
            console.error("Error fetching news from backend:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getData();
    }, [category]);

    useEffect(() => {
        const pollInterval = setInterval(getData, 60000); 
        return () => clearInterval(pollInterval);
    }, [category]); 

    const handleCategoryChange = (e) => {
        setCategory(e.target.value);
    };

    return (
        <main>
            <section className="hero-section">
                <div className="container">
                    {/* ✅ Updated brand name for consistency */}
                    <h1 className="hero-heading">Welcome to Hinglish Snaps</h1>
                    <p className="hero-subheading">Aapki Hinglish News, Sabse Pehle!</p>
                    <form onSubmit={(e) => e.preventDefault()} className="search-form">
                        <select value={category} onChange={handleCategoryChange} className="search-select">
                            <option value="finance">Finance</option>
                            <option value="technology">Technology</option>
                            <option value-="business">Business</option>
                        </select>
                    </form>
                </div>
            </section>

            <section className="news-section">
                <div className="container">
                    {isLoading ? <p>Loading News...</p> : <Card data={newsData} />}
                </div>
            </section>
        </main>
    );
};

export default Home;