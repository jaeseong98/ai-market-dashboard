import React from 'react'
import { useDatabaseApi } from '../../hooks/useDatabaseApi.js'
import EconomicIndicators from './components/EconomicIndicators.js';
import EconomicAnalysis from './components/EconomicAnalysis.js';
import ModelPrediction from './components/ModelPrediction.js';
import EconomicCalendar from './components/EconomicCalendar.js';

const EconomicsPage = () => {
    const { economicIndicators, loading, error } = useDatabaseApi()

    if (loading) return <div className="text-center mt-4">Loading...</div>
    if (error) return <div className="text-center mt-4 text-red-500">Error: {error.message}</div>

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Economics</h2>
                {economicIndicators && economicIndicators[0]?.DATA_YMD && (
                    <div className="text-xs text-gray-400 mt-1">
                        최근 업데이트: {new Date(economicIndicators[0].DATA_YMD).toLocaleDateString('ko-KR')}
                    </div>
                )}
            </div>
            <div className="flex gap-4">
                <div className="w-2/3">
                    <ModelPrediction />
                </div>
                <div className="w-1/3">
                    <EconomicCalendar />
                </div>
            </div>
            <EconomicIndicators data={economicIndicators} />
            <EconomicAnalysis />
        </div>
    )
}

export default EconomicsPage
