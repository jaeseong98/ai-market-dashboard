import { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE_URL = 'http://10.100.140.212:8000/api'

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
                if (process.env.NODE_ENV === 'development') {
                    const [
                        economicIndicators,
                        newsSummary,
                        detailedMarketData,
                        marketForecast,
                        fearGreedData,
                        exchangeRates,
                        commodityRates
                    ] = await Promise.all([
                        axios.get(`${API_BASE_URL}/economic-indicators`).then(res => res.data.data),
                        axios.get(`${API_BASE_URL}/news-summary`).then(res => res.data.data),
                        axios.get(`${API_BASE_URL}/detailed-market-data`).then(res => res.data.data),
                        axios.get(`${API_BASE_URL}/market-forecast`).then(res => res.data.data),
                        axios.get(`${API_BASE_URL}/fear-greed-data`).then(res => res.data),
                        axios.get(`${API_BASE_URL}/exchange-rates`).then(res => res.data.data || res.data),
                        axios.get(`${API_BASE_URL}/commodity-rates`).then(res => res.data.data || res.data)
                    ]);

                    setData({
                        economicIndicators,
                        newsSummary,
                        detailedMarketData,
                        marketForecast,
                        fearGreedData,
                        exchangeRates: exchangeRates || {},
                        commodityRates: commodityRates || {}
                    });
                } else {
                    // 프로덕션 환경에서는 baseURL을 고려한 경로 사용
                    const staticDataPath = process.env.PUBLIC_URL + '/static-data.json';
                    const response = await fetch(staticDataPath);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const staticData = await response.json();
                    setData(staticData);
                }
                setLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return { ...data, loading, error };
};
