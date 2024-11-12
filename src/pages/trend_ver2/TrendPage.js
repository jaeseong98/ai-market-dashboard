import React from 'react';
import DomesticMarketAnalysis from './components/domestic/DomesticMarketAnalysis.js';
import GlobalMarketAnalysis from './components/global/GlobalMarketAnalysis.js';
import EconomicTrends from './components/EconomicTrends.js';
const TrendPage = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">경제 및 시장동향 요약(임시 데이터)</h2>
            
            {/* 경제상황 */}
            <EconomicTrends />

            {/* 국내 시장 */}
            <DomesticMarketAnalysis />

            {/* 해외 시장 */}
            <GlobalMarketAnalysis />
        </div>
    );
};

export default TrendPage;
