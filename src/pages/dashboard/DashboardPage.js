import React, { useRef } from 'react'
import { useDatabaseApi } from '../../hooks/useDatabaseApi'
import Header from '../../layouts/Header'
import Footer from '../../layouts/Footer'
import MarketChart from './components/MarketChart'
import EconomicIndicators from './components/EconomicIndicators'
import EconomicAnalysis from './components/EconomicAnalysis'
import MarketInsights from './components/MarketInsights'
import NewsSummary from './components/NewsSummary'
import FinancialRates from './components/FinancialRates'
import FearGreedIndex from './components/FearGreedIndex'

const DashboardPage = () => {
    const { economicIndicators, newsSummary, detailedMarketData, marketForecast, fearGreedData, exchangeRates, commodityRates, loading, error } = useDatabaseApi()

    const marketRef = useRef(null)
    const economicsRef = useRef(null)
    const newsRef = useRef(null)

    const scrollToSection = (ref) => {
        ref.current.scrollIntoView({ behavior: 'smooth' })
    }

    // 가장 최근의 fearGreedData 값 가져오기
    const latestFearGreedValue = fearGreedData && fearGreedData.length > 0 ? fearGreedData[0].fear_greed : null

    if (loading) return <div className="text-center mt-4">Loading...</div>
    if (error) return <div className="text-center mt-4 text-red-500">Error: {error.message}</div>

    return (
        <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
            <Header
                scrollToSection={scrollToSection}
                marketRef={marketRef}
                economicsRef={economicsRef}
                newsRef={newsRef}
            />
            <main className="flex-grow p-4 sm:p-6 mx-auto w-full max-w-screen-xl">
                <div className="space-y-6">
                    <div ref={marketRef}>
                        {detailedMarketData && detailedMarketData.length > 0 && (
                            <MarketChart detailedMarketData={detailedMarketData} marketForecast={marketForecast} />
                        )}
                        <div className="grid grid-cols-3 gap-6 mt-6">
                            <div className="col-span-2 h-[300px]">
                                {exchangeRates && commodityRates && (
                                    <FinancialRates exchangeRates={exchangeRates} commodityRates={commodityRates} />
                                )}
                            </div>
                            <div className="h-[300px]">
                                <FearGreedIndex value={latestFearGreedValue} timeSeriesData={fearGreedData} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-8 mt-8"></div>
                        <MarketInsights />
                    </div>
                    <div ref={economicsRef}>
                        <EconomicIndicators data={economicIndicators} />
                        <EconomicAnalysis />
                    </div>
                    <div ref={newsRef}>
                        <NewsSummary data={newsSummary} />
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}

export default DashboardPage
