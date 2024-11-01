import axios from 'axios'

const API_BASE_URL = 'http://10.100.140.212:8000/api';
// const API_BASE_URL = 'http://localhost:8000/api'

export const fetchEconomicIndicators = async () => {
    const response = await axios.get(`${API_BASE_URL}/economic-indicators`)
    return response.data.data
}

export const fetchEconomicForecast = async () => {
    const response = await axios.get(`${API_BASE_URL}/economic-forecast`)
    return response.data.data
}

export const fetchNewsSummary = async () => {
    const response = await axios.get(`${API_BASE_URL}/news-summary`)
    return response.data.data
}

export const fetchDetailedMarketData = async () => {
    const response = await axios.get(`${API_BASE_URL}/detailed-market-data`)
    return response.data.data
}

export const fetchMarketForecast = async () => {
    const response = await axios.get(`${API_BASE_URL}/market-forecast`)
    return response.data.data
}

export const fetchKorData = async () => {
    const response = await axios.get(`${API_BASE_URL}/kor-data`)
    return response.data.data
}

export const fetchFearGreedData = async () => {
    const response = await axios.get(`${API_BASE_URL}/fear-greed-data`);
    return response.data;
};

export const fetchExchangeRates = async () => {
    const response = await axios.get(`${API_BASE_URL}/exchange-rates`);
    return response.data;
};

export const fetchCommodityRates = async () => {
    const response = await axios.get(`${API_BASE_URL}/commodity-rates`);
    return response.data;
};

export const fetchMarketIndices = async () => {
    const response = await axios.get(`${API_BASE_URL}/market-indices`);
    return response.data.data;
};
