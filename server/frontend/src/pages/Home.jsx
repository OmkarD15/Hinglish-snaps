import { useCallback, useEffect, useState } from 'react';
import Card from '../Components/Card.jsx';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const ITEMS_PER_PAGE = 6;

export const Home = () => {
    const [category, setCategory] = useState("finance");
    const [newsData, setNewsData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    
    // Pagination state
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [totalResults, setTotalResults] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    
    // Search state
    const [searchInput, setSearchInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch news data with pagination and search
    const getData = useCallback(async (pageNum = 1, append = false) => {
        if (append) {
            setIsLoadingMore(true);
        } else {
            setIsLoading(true);
        }
        
        try {
            const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : "";
            const response = await fetch(
                `${API_URL}/api/news?category=${category}&page=${pageNum}&limit=${ITEMS_PER_PAGE}${searchParam}`
            );
            const jsonData = await response.json();
            
            if (append) {
                setNewsData(prev => [...prev, ...jsonData.articles]);
            } else {
                setNewsData(jsonData.articles || []);
            }
            setHasMore(jsonData.hasMore || false);
            setTotalResults(jsonData.total || 0);
            setTotalPages(jsonData.totalPages || 1);
            setPage(jsonData.page || 1);
        } catch (error) {
            console.error("Error fetching news from backend:", error);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, [category, searchQuery]);

    // Initial load and when category/search changes
    useEffect(() => {
        setPage(1);
        getData(1, false);
    }, [getData]);

    // Polling for fresh data every 60 seconds
    useEffect(() => {
        const pollInterval = setInterval(() => {
            getData(1, false);
        }, 60000);
        return () => clearInterval(pollInterval);
    }, [getData]);

    const handleCategoryChange = (newCategory) => {
        if (newCategory !== category) {
            setCategory(newCategory);
            setSearchInput("");
            setSearchQuery("");
            setPage(1);
            setTotalPages(1);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setSearchQuery(searchInput.trim());
        setPage(1);
        setTotalPages(1);
    };

    const handleClearSearch = () => {
        setSearchInput("");
        setSearchQuery("");
        setPage(1);
        setTotalPages(1);
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        getData(nextPage, true);
    };

    return (
        <main>
            <section className="hero-section">
                <div className="container">
                    <h1 className="hero-heading">Hinglish Snaps</h1>
                    <p className="hero-subheading">Aapki Hinglish News, Sabse Pehle!</p>
                    
                    {/* Search Bar */}
                    <form onSubmit={handleSearchSubmit} className="search-bar-form">
                        <div className="search-input-wrapper">
                            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8"/>
                                <path d="m21 21-4.35-4.35"/>
                            </svg>
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search news..."
                                className="search-input"
                            />
                            {searchInput && (
                                <button type="button" onClick={handleClearSearch} className="search-clear-btn">
                                    ✕
                                </button>
                            )}
                        </div>
                        <button type="submit" className="search-submit-btn">Search</button>
                    </form>

                    {/* Category Pills */}
                    <div className="category-pills">
                        {["finance", "technology", "business"].map((cat) => (
                            <button
                                key={cat}
                                className={`category-pill ${category === cat ? "active" : ""}`}
                                onClick={() => handleCategoryChange(cat)}
                            >
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <section className="news-section">
                <div className="container">
                    {/* Results Info */}
                    {searchQuery && (
                        <div className="search-results-info">
                            <p>
                                {totalResults} result{totalResults !== 1 ? "s" : ""} for "{searchQuery}" in {category}
                                <button onClick={handleClearSearch} className="clear-search-link">Clear search</button>
                            </p>
                        </div>
                    )}

                    {/* Loading State */}
                    {isLoading ? (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                            <p>Loading news...</p>
                        </div>
                    ) : newsData.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📰</div>
                            <h3>No news found</h3>
                            <p>
                                {searchQuery 
                                    ? `No articles matching "${searchQuery}" in ${category}. Try a different search term.`
                                    : `No articles available in ${category} category right now. Check back soon!`
                                }
                            </p>
                            {searchQuery && (
                                <button onClick={handleClearSearch} className="btn-primary">Clear Search</button>
                            )}
                        </div>
                    ) : (
                        <>
                            <Card data={newsData} />
                            
                            {/* Load More Button */}
                            {hasMore && (
                                <div className="load-more-container">
                                    <button 
                                        onClick={handleLoadMore} 
                                        disabled={isLoadingMore}
                                        className="load-more-btn"
                                    >
                                        {isLoadingMore ? (
                                            <>
                                                <span className="btn-spinner"></span>
                                                Loading...
                                            </>
                                        ) : (
                                            <>Load More News</>  
                                        )}
                                    </button>
                                    <p className="results-count">
                                        Showing {newsData.length} of {totalResults} articles
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>
        </main>
    );
};

export default Home;
