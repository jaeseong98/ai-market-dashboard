import React from 'react'
import { useDatabaseApi } from '../../hooks/useDatabaseApi.js'
import NewsSummary from '../dashboard/components/NewsSummary.js'

const NewsPage = () => {
    const { newsSummary, loading, error } = useDatabaseApi()

    if (loading) return <div className="text-center mt-4">Loading...</div>
    if (error) return <div className="text-center mt-4 text-red-500">Error: {error.message}</div>

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">News</h2>
            <NewsSummary data={newsSummary} />
        </div>
    )
}

export default NewsPage
