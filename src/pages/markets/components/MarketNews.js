import React from 'react'
import { Card, CardHeader, CardContent } from '../../../components/Card.js'

const MarketNews = () => {
    // 임시 뉴스 데이터
    const dummyNews = [
        {
            id: 1,
            title: "Fed, 기준금리 동결 결정",
            time: "3시간 전",
            source: "Bloomberg"
        },
        {
            id: 2,
            title: "KOSPI, 외국인 매수세에 상승 마감",
            time: "5시간 전",
            source: "Reuters"
        },
        {
            id: 3,
            title: "미국 고용지표 예상치 상회",
            time: "7시간 전",
            source: "MarketWatch"
        },
        {
            id: 4,
            title: "중국 PMI 지수 반등",
            time: "8시간 전",
            source: "CNBC"
        }
    ];

    return (
        <Card className="h-full">
            <CardHeader className="p">
                <h3 className="text-lg font-semibold text-white select-none">시장 뉴스(임시)</h3>
            </CardHeader>
            <CardContent className="p">
                <div className="space-y-2 overflow-y-auto h-full">
                    {dummyNews.map((news) => (
                        <div key={news.id} className="flex items-start space-x-2 hover:bg-gray-800/30 p-1 rounded cursor-pointer">
                            <div className="flex-1">
                                <h4 className="text-sm text-gray-200">{news.title}</h4>
                                <div className="flex items-center space-x-2 text-xs text-gray-400">
                                    <span>{news.source}</span>
                                    <span>•</span>
                                    <span>{news.time}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

export default MarketNews 