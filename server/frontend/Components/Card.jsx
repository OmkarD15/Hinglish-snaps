import PropTypes from 'prop-types';

const Card = ({ data }) => {
    const readMore = (url) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className='card-container'>
            {data.map((curItem) => {
                // ✅ 1. Check for the new 'image' property from your database
                if (!curItem || !curItem.image) return null;

                return (
                    // ✅ 2. Use a stable, unique key like the article URL
                    <div className='card' key={curItem.url}>
                        <img src={curItem.image} alt={curItem.title || "News image"} />
                        <div className='content'>
                            <a className='title' href={curItem.url} target="_blank" rel="noopener noreferrer">
                                {curItem.title}
                            </a>
                            {/* ✅ 3. Display the 'hinglishSummary' from the backend */}
                            <p className='summary'>
                                {curItem.hinglishSummary}
                                {/* ✅ 4. Conditionally show a message if it's a fallback */}
                                {curItem.isFallback && (
                                    <span style={{ color: "orange", fontSize: "0.8em", display: "block", marginTop: "5px" }}>
                                        ⏳ Hinglish summary is being prepared...
                                    </span>
                                )}
                            </p>
                            <button onClick={() => readMore(curItem.url)}>Read More</button>
                            <p className='date'>{new Date(curItem.publishedAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// ✅ 5. Updated prop types to match the new data from your database
Card.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            url: PropTypes.string.isRequired,
            image: PropTypes.string,
            title: PropTypes.string,
            hinglishSummary: PropTypes.string,
            publishedAt: PropTypes.string,
            isFallback: PropTypes.bool,
        })
    ).isRequired,
};

export default Card;