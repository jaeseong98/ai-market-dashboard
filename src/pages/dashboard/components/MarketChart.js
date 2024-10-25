import { Card, CardHeader, CardContent } from '../../../components/Card.js'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { calculateChange } from '../../../helpers/calculations.js'
import CustomTooltip from '../../../components/CustomTooltip.js'

// 천 단위 구분자를 적용하는 함수 추가
const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    }).format(value);
}

const MarketChart = ({ detailedMarketData }) => { // marketForecast 제거
    if (!detailedMarketData || detailedMarketData.length === 0) {
        return <Card className="p-4">No market data available</Card>
    }

    // 데이터를 날짜순으로 정렬하고 최신 20개만 선택
    const sortedData = [...detailedMarketData].sort((a, b) => new Date(a.DATA_YMD) - new Date(b.DATA_YMD)).slice(-100)

    const latestData = sortedData[sortedData.length - 1]
    const previousData = sortedData[sortedData.length - 2] || latestData

    // 예측 데이터 제거
    const combinedData = [...sortedData]

    const renderChart = (label, actualKey) => { // forecastKey 제거
        const actualColor = '#E74C3C'
        const gradientId = `gradient${label.replace(/\s/g, '')}` // 고유한 id 생성

        // 데이터의 최소값과 최대값 계산
        const allValues = combinedData.map((d) => d[actualKey]).filter((v) => v !== undefined)
        const minValue = Math.min(...allValues)
        const maxValue = Math.max(...allValues)

        // Y축 범위 계산 (10% 여유 추가)
        const yAxisMin = minValue - (maxValue - minValue) * 0.1
        const yAxisMax = maxValue + (maxValue - minValue) * 0.1

        return (
            <Card className="flex-1 min-w-[45%]">
                <CardHeader className="flex justify-between items-start">
                    <span className="font-semibold">{label}</span>
                    <div className="text-right">
                        <div className="text-2xl font-bold">
                            {latestData[actualKey] ? formatNumber(latestData[actualKey]) : 'N/A'}
                        </div>
                        <div className="flex items-center justify-end text-sm">
                            <span
                                className={`${
                                    calculateChange(latestData[actualKey], previousData[actualKey]) >= 0
                                        ? 'text-green-500'
                                        : 'text-red-500'
                                }`}
                            >
                                {formatNumber(calculateChange(latestData[actualKey], previousData[actualKey]))}%
                            </span>
                            <span className="text-gray-400 ml-2">(USD)</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={combinedData}>
                            <defs>
                                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={actualColor} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={actualColor} stopOpacity={0.2} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="DATA_YMD" stroke="#A0AEC0" dy = {5} />
                            <YAxis
                                stroke="#A0AEC0"
                                dy = {-5}
                                domain={[yAxisMin, yAxisMax]}
                                tickFormatter={(value) => value.toFixed(0)}
                            />
                            <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" />

                            <Tooltip content={<CustomTooltip />} /> {/* 커스텀 툴팁 적용 */}
                            <Area
                                type="monotone"
                                dataKey={actualKey}
                                stroke={actualColor}
                                fillOpacity={0.5}
                                fill={`url(#${gradientId})`}
                                strokeWidth={2}
                                name="가격"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">
                {renderChart('S&P 500', 'sp500_close')}
                {renderChart('NASDAQ', 'nasdaq_close')}
            </div>
        </div>
    )
}

export default MarketChart
