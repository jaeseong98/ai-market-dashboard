import React from 'react'
import { useDatabaseApi } from '../../hooks/useDatabaseApi.js'
import MarketChart from '../dashboard/components/MarketChart.js'
import FearGreedIndex from '../dashboard/components/FearGreedIndex.js'
import MarketInsights from '../dashboard/components/MarketInsights.js'
import MarketNews from '../dashboard/components/MarketNews.js'

const MarketsPage = () => {
    const { 
        marketIndices, 
        fearGreedData, 
        exchangeRates, 
        commodityRates, 
        loading, 
        error 
    } = useDatabaseApi();

    if (loading) return <div className="text-center mt-4">Loading...</div>
    if (error) return <div className="text-center mt-4 text-red-500">Error: {error.message}</div>

    const latestFearGreedValue = fearGreedData && fearGreedData.length > 0 ? fearGreedData[0].fear_greed : null

    return (
        
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Markets</h2>
                {marketIndices?.data?.[0]?.trading_date && (
                    <div className="text-xs text-gray-400 mt-1">
                        최근 업데이트: {new Date(marketIndices.data[0].trading_date).toLocaleDateString('ko-KR')}
                    </div>
                )}
            </div>
            {marketIndices && marketIndices.data && marketIndices.data.length > 0 && (
                <MarketChart 
                    marketIndices={marketIndices}
                    exchangeRates={exchangeRates}
                    commodityRates={commodityRates}
                />
            )}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <FearGreedIndex value={latestFearGreedValue} timeSeriesData={fearGreedData} />
                </div>
                <div>
                    <MarketNews />
                </div>
            </div>
            <MarketInsights />
        </div>
    )
}

export default MarketsPage

