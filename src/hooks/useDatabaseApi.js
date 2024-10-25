import { useState, useEffect } from 'react'

export const useDatabaseApi = () => {
    const [data, setData] = useState({
        economicIndicators: [],
        newsSummary: [],
        detailedMarketData: [],
        marketForecast: null,
        fearGreedData: [],
        exchangeRates: null,
        commodityRates: null
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/static-data.json');
                const staticData = await response.json();
                setData(staticData);
                setLoading(false);
            } catch (err) {
                setError(err);
                setLoading(false);
                console.error('Error fetching static data:', err);
            }
        };

        fetchData();
    }, []);

    return { ...data, loading, error };
};
