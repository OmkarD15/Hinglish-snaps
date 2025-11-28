import PropTypes from 'prop-types';

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

const Card = ({ data }) => {
    const readMore = (url) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    // Handle image loading errors
    const handleImageError = (e) => {
        e.target.src = PLACEHOLDER_IMAGE;
    };

    if (!data || data.length === 0) {
        return null;
    }

    return (
        <div className='card-container'>
            {data.map((curItem) => {
                if (!curItem) return null;

                const imageUrl = curItem.image || PLACEHOLDER_IMAGE;
                const relativeTime = getRelativeTime(curItem.publishedAt);

                return (
                    <div className='card' key={curItem.url || curItem._id}>
                        <div className="card-image-wrapper">
                            <img 
                                src={imageUrl} 
                                alt={curItem.title || "News image"}
                                onError={handleImageError}
                                loading="lazy"
                            />
                            {curItem.source && (
                                <span className="card-source-badge">{curItem.source}</span>
                            )}
                        </div>
                        <div className='content'>
                            <div className="card-meta">
                                <span className="card-time">🕒 {relativeTime}</span>
                            </div>
                            <a className='title' href={curItem.url} target="_blank" rel="noopener noreferrer">
                                {curItem.title}
                            </a>
                            <p className='summary'>
                                {curItem.hinglishSummary}
                                {curItem.isFallback && (
                                    <span className="fallback-notice">
                                        ⏳ Hinglish summary coming soon...
                                    </span>
                                )}
                            </p>
                            <div className="card-actions">
                                <button onClick={() => readMore(curItem.url)} className="read-more-btn">
                                    Read Full Article
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="arrow-icon">
                                        <path d="M5 12h14M12 5l7 7-7 7"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
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
