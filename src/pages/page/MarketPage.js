import React from 'react'
import { useDatabaseApi } from '../../hooks/useDatabaseApi.js'
import MarketChart from '../dashboard/components/MarketChart.js'
import FinancialRates from '../dashboard/components/FinancialRates.js'
import FearGreedIndex from '../dashboard/components/FearGreedIndex.js'
import MarketInsights from '../dashboard/components/MarketInsights.js'

const MarketsPage = () => {
    const { detailedMarketData, marketForecast, fearGreedData, exchangeRates, commodityRates, loading, error } = useDatabaseApi()

    if (loading) return <div className="text-center mt-4">Loading...</div>
    if (error) return <div className="text-center mt-4 text-red-500">Error: {error.message}</div>

    const latestFearGreedValue = fearGreedData && fearGreedData.length > 0 ? fearGreedData[0].fear_greed : null

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Markets</h2>
            {detailedMarketData && detailedMarketData.length > 0 && (
                <MarketChart detailedMarketData={detailedMarketData} marketForecast={marketForecast} />
            )}
            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2">
                    {exchangeRates && commodityRates && (
                        <FinancialRates exchangeRates={exchangeRates} commodityRates={commodityRates} />
                    )}
                </div>
                <div>
                    <FearGreedIndex value={latestFearGreedValue} timeSeriesData={fearGreedData} />
                </div>
            </div>
            <MarketInsights />
        </div>
    )
}

export default MarketsPage

