import { useEffect, useState } from 'react';
import Card from '../Components/Card.jsx';

export const Home = () => {
    const [category, setCategory] = useState("finance");
    const [newsData, setNewsData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const getData = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/news?category=${category}`);
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
                    <h1 className="hero-heading">Welcome to ENDI News</h1>
                    <p className="hero-subheading">Aapki Hinglish News, Sabse Pehle!</p>
                    <form onSubmit={(e) => e.preventDefault()} className="search-form">
                        {/* ✅ Updated the dropdown to only show your chosen categories */}
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