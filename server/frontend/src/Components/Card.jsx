import PropTypes from 'prop-types';
import { useState } from 'react';

// Placeholder image for articles without images
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=300&fit=crop&auto=format";

// Helper function to get relative time (e.g., "2 hours ago")
const getRelativeTime = (dateString) => {
    if (!dateString) return "";
    
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) {
        const mins = Math.floor(diffInSeconds / 60);
        return `${mins} min${mins > 1 ? "s" : ""} ago`;
    }
    if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    }
    if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days > 1 ? "s" : ""} ago`;
    }
    
    // For older articles, show the date
    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ArticleCard = ({ item }) => {
    const [hinglishSummary, setHinglishSummary] = useState(item.hinglishSummary || '');
    const [isConverting, setIsConverting] = useState(false);
    const [converted, setConverted] = useState(!item.isFallback);

    // DEBUG: log item to verify isFallback and other props
    // Remove this in production
    console.log('DEBUG ArticleCard item:', { url: item.url, title: item.title, isFallback: item.isFallback });

    const readMore = (url) => window.open(url, '_blank', 'noopener,noreferrer');
    const handleImageError = (e) => { e.target.src = PLACEHOLDER_IMAGE; };

    const convertNow = async () => {
        if (isConverting) return;
        setIsConverting(true);
        try {
            const resp = await fetch(`${API_URL}/api/news/convert`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: item.url,
                    title: item.title,
                    description: item.hinglishSummary || item.description || '',
                    image: item.image,
                    source: item.source,
                    publishedAt: item.publishedAt,
                }),
            });
            const data = await resp.json();
            if (resp.ok && data.hinglishSummary) {
                setHinglishSummary(data.hinglishSummary);
                setConverted(true);
            } else {
                console.error('Conversion error', data);
            }
        } catch (err) {
            console.error('Conversion request failed', err);
        } finally {
            setIsConverting(false);
        }
    };

    const imageUrl = item.image || PLACEHOLDER_IMAGE;
    const relativeTime = getRelativeTime(item.publishedAt);

    return (
        <div className='card'>
            <div className="card-image-wrapper">
                <img 
                    src={imageUrl} 
                    alt={item.title || "News image"}
                    onError={handleImageError}
                    loading="lazy"
                />
                {item.source && (
                    <span className="card-source-badge">{item.source}</span>
                )}
            </div>
            <div className='content'>
                <div className="card-meta">
                    <span className="card-time">🕒 {relativeTime}</span>
                </div>
                <a className='title' href={item.url} target="_blank" rel="noopener noreferrer">
                    {item.title}
                </a>
                <p className='summary'>
                    {hinglishSummary}
                    {!converted && (
                        <span className="fallback-notice"> ⏳ Hinglish summary not available yet</span>
                    )}
                </p>
                <div className="card-actions debug">
                    <button onClick={() => readMore(item.url)} className="read-more-btn">
                        Read Full Article
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="arrow-icon">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                    </button>
                    {!converted && (
                        <button onClick={convertNow} className="convert-btn" disabled={isConverting}>
                            {isConverting ? 'Converting...' : 'Convert to Hinglish'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const Card = ({ data }) => {
    if (!data || data.length === 0) return null;

    return (
        <div className='card-container'>
            {data.map((curItem) => (
                <ArticleCard key={curItem.url || curItem._id} item={curItem} />
            ))}
        </div>
    );
};

Card.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            _id: PropTypes.string,
            url: PropTypes.string.isRequired,
            image: PropTypes.string,
            title: PropTypes.string,
            hinglishSummary: PropTypes.string,
            publishedAt: PropTypes.string,
            isFallback: PropTypes.bool,
            source: PropTypes.string,
        })
    ).isRequired,
};

export default Card;
