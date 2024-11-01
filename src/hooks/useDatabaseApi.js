import { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE_URL = 'http://10.100.140.212:8000/api'

export const useDatabaseApi = () => {
    const [data, setData] = useState({
        marketIndices: null,
        fearGreedData: null,
        exchangeRates: null,
        commodityRates: null,
        economicIndicators: null,
        newsSummary: null
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                let staticData;
                
                if (process.env.NODE_ENV === 'production') {
                    // 프로덕션 환경: static-data.json 사용
                    const response = await fetch(`${process.env.PUBLIC_URL}/static-data.json`);
                    staticData = await response.json();
                } else {
                    // 개발 환경: API 직접 호출
                    const marketIndicesRes = await axios.get(`${API_BASE_URL}/market-indices`);
                    const [
                        economicIndicators,
                        newsSummary,
                        fearGreedData,
                        exchangeRates,
                        commodityRates,
                    ] = await Promise.all([
                        axios.get(`${API_BASE_URL}/economic-indicators`).then(res => res.data.data),
                        axios.get(`${API_BASE_URL}/news-summary`).then(res => res.data.data),
                        axios.get(`${API_BASE_URL}/fear-greed-data`).then(res => res.data),
                        axios.get(`${API_BASE_URL}/exchange-rates`).then(res => res.data.data || res.data),
                        axios.get(`${API_BASE_URL}/commodity-rates`).then(res => res.data.data || res.data),
                    ]);

                    staticData = {
                        economicIndicators,
                        newsSummary,
                        fearGreedData,
                        exchangeRates: exchangeRates || {},
                        commodityRates: commodityRates || {},
                        marketIndices: marketIndicesRes.data
                    };
                }

                setData(staticData);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    return {
        ...data,
        loading,
        error
    };
};
