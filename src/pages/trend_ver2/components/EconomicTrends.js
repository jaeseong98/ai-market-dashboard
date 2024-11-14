import { Card, CardContent } from '../../../components/Card.js'
import { useState } from 'react'
import marketAnalysis from '../../../data/market_analysis_1112.json'

const EconomicTrends = () => {
    const [selectedDate, setSelectedDate] = useState('2024-10-31') // 가장 최근 날짜를 기본값으로

    // 날짜 목록 생성 (역순으로 정렬)
    const dates = Object.keys(marketAnalysis.경제동향).sort((a, b) => b.localeCompare(a))

    // 날짜 포맷 변환 (2024-10-31 → 10/2)
    const formatDate = (dateStr) => {
        const date = new Date(dateStr)
        return `${date.getMonth() + 1}/${date.getDate()}`
    }

    // 줄바꿈 및 글머리 기호 추가 함수
    const formatSummary = (summary) => {
        return summary
            .split(/(?<!\d)\.(?!\d)/) // 숫자가 아닌 경우에만 .으로 분리
            .map((sentence) => sentence.trim())
            .filter((sentence) => sentence) // 빈 문장 제거
            .map((sentence) => `• ${sentence}.`) // 글머리 기호 추가
            .join('<br/><br/>') // 줄바꿈
    }

    return (
        <Card className="bg-gray-800 text-white w-full">
            <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">📊</span>
                        <h3 className="text-lg font-medium text-white">경제상황</h3>
                    </div>
                    <select
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-gray-800 text-sm px-3 py-1.5 rounded-md border border-gray-600 text-white"
                    >
                        {dates.map((date) => (
                            <option key={date} value={date}>
                                {formatDate(date)}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-blue-300">
                        <span className="w-2 h-2 bg-blue-300 rounded-full"></span>
                        <h4>일일 경제동향</h4>
                    </div>
                    <p
                        className="text-sm text-gray-200 leading-relaxed"
                        dangerouslySetInnerHTML={{
                            __html: formatSummary(marketAnalysis.경제동향[selectedDate]?.summary),
                        }} // 수정된 부분
                    />
                </div>
            </CardContent>
        </Card>
    )
}

export default EconomicTrends
