import React from 'react'
import { useDatabaseApi } from '../../hooks/useDatabaseApi.js'
import EconomicIndicators from '../dashboard/components/EconomicIndicators.js'
import EconomicAnalysis from '../dashboard/components/EconomicAnalysis.js'
import NberPrediction from '../dashboard/components/ModelPrediction.js'
import EconomicCalendar from '../dashboard/components/EconomicCalendar.js'

const EconomicsPage = () => {
    const { economicIndicators, loading, error } = useDatabaseApi()

    if (loading) return <div className="text-center mt-4">Loading...</div>
    if (error) return <div className="text-center mt-4 text-red-500">Error: {error.message}</div>

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Economics</h2>
            <div className="flex gap-4">
                <div className="w-2/3">
                    <NberPrediction />
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
