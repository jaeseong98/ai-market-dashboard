import React, { useRef, useEffect } from 'react'
import { useDatabaseApi } from '../../hooks/useDatabaseApi'
import Header from '../../layouts/Header'
import Footer from '../../layouts/Footer'
import MarketChart from './components/MarketChart'
import EconomicIndicators from './components/EconomicIndicators'
import EconomicAnalysis from './components/EconomicAnalysis'
import NewsSummary from './components/NewsSummary'
import FinancialRates from './components/FinancialRates'
import FearGreedIndex from './components/FearGreedIndex'

const DashboardPage = () => {
    const { 
        economicIndicators, 
        newsSummary, 
        marketIndices, 
        fearGreedData, 
        exchangeRates, 
        commodityRates, 
        loading, 
        error 
    } = useDatabaseApi();

    if (loading) {
        return <div className="text-center mt-4">Loading...</div>;
    }

    if (error) {
        return <div className="text-center mt-4 text-red-500">Error: {error.message}</div>;
    }

    const latestFearGreedValue = fearGreedData && fearGreedData.length > 0 ? fearGreedData[0].fear_greed : null;

    return (
        <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
            <Header />
            <main className="flex-grow p-4 sm:p-6 mx-auto w-full max-w-screen-xl">
                <div className="space-y-6">
                    <div>
                        <MarketChart marketIndices={marketIndices} />
                        <div className="grid grid-cols-3 gap-6 mt-6">
                            <div className="col-span-2">
                                {exchangeRates && commodityRates && (
                                    <FinancialRates 
                                        exchangeRates={exchangeRates} 
                                        commodityRates={commodityRates} 
                                    />
                                )}
                            </div>
                            <div>
                                <FearGreedIndex 
                                    value={latestFearGreedValue} 
                                    timeSeriesData={fearGreedData} 
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <EconomicIndicators data={economicIndicators} />
                        <EconomicAnalysis />
                    </div>
                    <div>
                        <NewsSummary data={newsSummary} />
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default DashboardPage;
