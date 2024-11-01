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
        commodityRates: null,
        marketIndices: null
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (process.env.NODE_ENV === 'development') {
                    // marketIndices 데이터만 먼저 가져와보기
                    const marketIndicesRes = await axios.get(`${API_BASE_URL}/market-indices`);
                    console.log('Market Indices Raw Response:', marketIndicesRes);
                    
                    // 나머지 데이터 가져오기
                    const [
                        economicIndicators,
                        newsSummary,
                        detailedMarketData,
                        marketForecast,
                        fearGreedData,
                        exchangeRates,
                        commodityRates,
                    ] = await Promise.all([
                        axios.get(`${API_BASE_URL}/economic-indicators`).then(res => res.data.data),
                        axios.get(`${API_BASE_URL}/news-summary`).then(res => res.data.data),
                        axios.get(`${API_BASE_URL}/detailed-market-data`).then(res => res.data.data),
                        axios.get(`${API_BASE_URL}/market-forecast`).then(res => res.data.data),
                        axios.get(`${API_BASE_URL}/fear-greed-data`).then(res => res.data),
                        axios.get(`${API_BASE_URL}/exchange-rates`).then(res => res.data.data || res.data),
                        axios.get(`${API_BASE_URL}/commodity-rates`).then(res => res.data.data || res.data),
                    ]);

                    const newData = {
                        economicIndicators,
                        newsSummary,
                        detailedMarketData,
                        marketForecast,
                        fearGreedData,
                        exchangeRates: exchangeRates || {},
                        commodityRates: commodityRates || {},
                        marketIndices: marketIndicesRes.data  // 직접 할당
                    };

                    console.log('Setting data with marketIndices:', newData.marketIndices);
                    setData(newData);
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // 반환하기 전에 marketIndices 확인
    console.log('Returning marketIndices:', data.marketIndices);
    
    return {
        ...data,
        loading,
        error
    };
};
