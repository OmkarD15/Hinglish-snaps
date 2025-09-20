import { useCallback, useEffect, useState } from 'react';
import Card from '../Components/Card.jsx';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const Home = () => {
    const [category, setCategory] = useState("finance");
    const [newsData, setNewsData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // ✅ 1. Wrapped the getData function in useCallback
    //    It will only be recreated if the 'category' state changes.
    const getData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/news?category=${category}`);
            const jsonData = await response.json();
            setNewsData(jsonData);
        } catch (error) {
            console.error("Error fetching news from backend:", error);
        } finally {
            setIsLoading(false);
        }
    }, [category]); // The dependency for getData is the category

    // ✅ 2. Added 'getData' to the dependency array, which now safely works
    useEffect(() => {
        getData();
    }, [getData]);

    // ✅ 2. Added 'getData' to the dependency array here as well
    useEffect(() => {
        const pollInterval = setInterval(getData, 60000); 
        return () => clearInterval(pollInterval);
    }, [getData]); 

    const handleCategoryChange = (e) => {
        setCategory(e.target.value);
    };

    return (
        <main>
            <section className="hero-section">
                <div className="container">
                    <h1 className="hero-heading">Welcome to Hinglish Snaps</h1>
                    <p className="hero-subheading">Aapki Hinglish News, Sabse Pehle!</p>
                    <form onSubmit={(e) => e.preventDefault()} className="search-form">
                        <select value={category} onChange={handleCategoryChange} className="search-select">
                            <option value="finance">Finance</option>
                            <option value="technology">Technology</option>
                            <option value="business">Business</option>
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