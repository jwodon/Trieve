import React, { useState, useEffect } from 'react';
import CompanyCard from './CompanyCard';
import '../App.css';

const datasetId = '58e9cb2c-786f-452b-ba07-290e3bd7356a';
const apiKey = 'tr-PxHAevwDu8cQbpz4kIgaVVcmuuekOHWY';

const allTags = [
    'Aerospace',
    'Agriculture',
    'Biotech',
    'Computing',
    'Construction & Housing',
    'Defense & Public Safety',
    'Education',
    'Energy & Climate',
    'Manufacturing',
    'Robotics',
    'Supply Chain',
    'Transportation',
];

function Home() {
    const [query, setQuery] = useState('default');
    const [results, setResults] = useState([]);
    const [tagFilter, setTagFilter] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchResults = async (searchQuery, tag, page) => {
        const filters = tag ? { must: [{ field: 'tag_set', match: [tag] }] } : {};

        const options = {
            method: 'POST',
            headers: {
                'TR-Dataset': datasetId,
                Authorization: apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: searchQuery,
                search_type: 'hybrid',
                page: page,
                page_size: 10,
                highlight_results: true,
                slim_chunks: true,
                filters: filters,
            }),
        };

        try {
            const response = await fetch('https://api.trieve.ai/api/chunk/search', options);
            const data = await response.json();

            const formattedResults = (data.score_chunks || []).map((item) => {
                const metadata = item.metadata && item.metadata[0] ? item.metadata[0] : {};
                const chunkHtml = metadata.chunk_html || '';
                const lines = chunkHtml.split('\n');
                const title =
                    lines
                        .find((line) => line.startsWith('Title:'))
                        ?.replace('Title:', '')
                        .trim() || 'No Title';
                const description =
                    lines
                        .find((line) => line.startsWith('Description:'))
                        ?.replace('Description:', '')
                        .trim() || 'No Description';
                const tags =
                    lines
                        .find((line) => line.startsWith('Tags:'))
                        ?.replace('Tags:', '')
                        .trim()
                        .split(', ') || [];
                const logo = metadata.metadata?.logo || 'default-logo.png';

                return { logo, title, description, tags };
            });

            if (formattedResults.length < 10) setHasMore(false);
            setResults((prevResults) => [...prevResults, ...formattedResults]);
        } catch (error) {
            console.error('Error fetching results', error);
        }
    };

    useEffect(() => {
        setResults([]);
        setPage(1);
        setHasMore(true);
        fetchResults(query, tagFilter, 1);
    }, [query, tagFilter]);

    const handleSearch = () => {
        setResults([]);
        setPage(1);
        setHasMore(true);
        fetchResults(query, tagFilter, 1);
    };

    const handleSeeMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchResults(query, tagFilter, nextPage);
    };

    return (
        <div className="home">
            <header>
                <img
                    src={process.env.PUBLIC_URL + '/buildlistlogo.png'}
                    alt="BuildList Logo"
                    className="buildlist-logo"
                />
                <div className="search-container">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search..."
                    />
                    <select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)}>
                        <option value="">All Tags</option>
                        {allTags.map((tag, index) => (
                            <option key={index} value={tag}>
                                {tag}
                            </option>
                        ))}
                    </select>
                    <button onClick={handleSearch}>Search</button>
                </div>
            </header>
            <div className="results">
                {results.map((result, index) => (
                    <CompanyCard
                        key={index}
                        logo={result.logo}
                        title={result.title}
                        description={result.description}
                        tags={result.tags}
                    />
                ))}
            </div>
            {hasMore && (
                <div className="see-more-container">
                    <button onClick={handleSeeMore} className="see-more-button">
                        See More
                    </button>
                </div>
            )}
        </div>
    );
}

export default Home;
