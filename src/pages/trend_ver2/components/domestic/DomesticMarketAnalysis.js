import { Card, CardContent } from '../../../../components/Card.js'
import { useState, useCallback } from 'react'
import marketData from '../../../../data/marketData.json'
import marketAnalysis from '../../../../data/market_analysis_1112.json'
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from 'recharts'

const PERIODS = [
    { id: 'daily', label: '전일대비' },
    { id: 'weekly', label: '전주대비' },
    { id: 'monthly', label: '전월대비' },
    { id: 'quarterly', label: '전분기대비' },
    { id: 'yearly', label: '전년대비' },
]

const TREND_PERIODS = [{ id: 'monthly', label: '월간 동향' }]

const EQUITY_INDICATORS = [
    { id: 'kospi', label: 'KOSPI', color: '#8884d8' },
    { id: 'kosdaq', label: 'KOSDAQ', color: '#82ca9d' },
    { id: 'kospi200', label: 'KOSPI200', color: '#ffc658' },
]

const BOND_INDICATORS = [
    { id: 'y3', label: '국고채 3년', color: '#FCD34D' },
    { id: 'y10', label: '국고채 10년', color: '#F97316' },
    { id: 'cd', label: 'CD금리', color: '#60A5FA' },
]

const DomesticMarketAnalysis = () => {
    const [selectedEquityTrendPeriod, setSelectedEquityTrendPeriod] = useState('daily')
    const [selectedBondsTrendPeriod, setSelectedBondsTrendPeriod] = useState('daily')
    const [selectedEquityPeriod, setSelectedEquityPeriod] = useState('daily')
    const [selectedBondsPeriod, setSelectedBondsPeriod] = useState('daily')
    const [selectedEquityIndicator, setSelectedEquityIndicator] = useState('kospi')
    const [selectedBondIndicator, setSelectedBondIndicator] = useState('y10')
    const [equityViewMode, setEquityViewMode] = useState('graph')
    const [bondViewMode, setBondViewMode] = useState('graph')

    // 기간별 인덱스 반환 함수
    const getIndexByPeriod = useCallback(
        (period) => {
            const currentDate = new Date(marketData.dates[0])
            let targetDate = new Date(currentDate)

            switch (period) {
                case 'daily':
                    targetDate.setDate(currentDate.getDate() - 1)
                    break
                case 'weekly':
                    targetDate.setDate(currentDate.getDate() - 7)
                    break
                case 'monthly':
                    const prevMonth = currentDate.getMonth() - 1
                    targetDate = new Date(currentDate.getFullYear(), prevMonth, currentDate.getDate())
                    break
                case 'quarterly':
                    const prevQuarter = currentDate.getMonth() - 3
                    targetDate = new Date(currentDate.getFullYear(), prevQuarter, currentDate.getDate())
                    break
                case 'yearly':
                    targetDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate())
                    break
                default:
                    targetDate.setDate(currentDate.getDate() - 1)
            }

            const targetTime = targetDate.getTime()
            let closestIndex = 0
            let closestDiff = Math.abs(new Date(marketData.dates[0]).getTime() - targetTime)

            for (let i = 1; i < marketData.dates.length; i++) {
                const diff = Math.abs(new Date(marketData.dates[i]).getTime() - targetTime)
                if (diff < closestDiff) {
                    closestDiff = diff
                    closestIndex = i
                }
            }

            return closestIndex
        },
        [],
    )

    const formatChange = useCallback((current, previous, type = 'bp') => {
        if (current === undefined || previous === undefined) {
            return 'N/A'
        }

        const change = current - previous

        if (type === 'bp') {
            // 베이시스 포인트로 변환 (0.01 = 1bp)
            const bpChange = change * 100
            const absBpChange = Math.abs(bpChange)
            if (change === 0) {
                return `${(current * 100).toFixed(2)}%(유지)`
            }
            return `${absBpChange.toFixed(1)}bp${change > 0 ? '↑' : '↓'}`
        } else {
            // 퍼센트로 변환
            const percentChange = change * 100
            if (change === 0) {
                return `${(current * 100).toFixed(2)}%(유지)`
            }
            return `(${change > 0 ? '+' : ''}${percentChange.toFixed(2)}%)`
        }
    }, [])

    // 날짜 포맷팅
    const formatDate = useCallback((dateString) => {
        const date = new Date(dateString)
        const year = date.getFullYear().toString().slice(2)
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}.${month}.${day}`
    }, [])

    // 날짜 범위 계산
    const getDateRange = useCallback(
        (period) => {
            if (!marketData || !marketData.dates) return { start: '', end: '' }

            const currentDate = new Date(marketData.dates[0])
            let pastDate = new Date(currentDate)

            switch (period) {
                case 'daily':
                    pastDate.setDate(currentDate.getDate() - 1)
                    break
                case 'weekly':
                    pastDate.setDate(currentDate.getDate() - 7)
                    break
                case 'monthly':
                    pastDate.setMonth(currentDate.getMonth() - 1)
                    break
                case 'quarterly':
                    pastDate.setMonth(currentDate.getMonth() - 3)
                    break
                case 'yearly':
                    pastDate.setFullYear(currentDate.getFullYear() - 1)
                    break
                default:
                    pastDate.setDate(currentDate.getDate() - 1)
            }

            return {
                start: formatDate(pastDate),
                end: formatDate(currentDate),
            }
        },
        [formatDate],
    )

    // getTrendText 함수 수정
    const getTrendText = useCallback((period, market, type) => {
        const currentMonth = '2024-10'

        if (!marketAnalysis.금융시장동향[currentMonth]) return ''

        let marketSection = market === 'equity' ? '국내주식' : '국내채권'

        switch (type) {
            case 'trend':
                return marketAnalysis.금융시장동향[currentMonth][marketSection].summary
            case 'positiveNews':
                return `<span class="text-green-500">▲ (긍정)</span> ${marketAnalysis.금융시장동향[currentMonth][
                    marketSection
                ].good_news.join(', ')}`
            case 'negativeNews':
                return `<span class="text-red-500">▼ (부정)</span> ${marketAnalysis.금융시장동향[currentMonth][
                    marketSection
                ].bad_news.join(', ')}`
            default:
                return ''
        }
    }, [])

    // getAnalysisText 함수는 기존 로직 유지 (실시간 데이터 계산)
    const getAnalysisText = useCallback(
        (period, market) => {
            if (!marketData || !marketData.dates) return ''

            const index = getIndexByPeriod(period)
            const periodLabel =
                period === 'daily'
                    ? '전일 대비'
                    : period === 'weekly'
                    ? '전주 대비'
                    : period === 'monthly'
                    ? '전월 대비'
                    : period === 'quarterly'
                    ? '전분기 대비'
                    : '전년 대비'

            if (market === 'equity') {
                return `[${periodLabel} 증감]
● KOSPI ${formatChange(
                    marketData.domestic.equity.kospi[marketData.dates.length - 1],
                    marketData.domestic.equity.kospi[marketData.dates.length - 1 - index],
                )}, KOSDAQ ${formatChange(
                    marketData.domestic.equity.kosdaq[marketData.dates.length - 1],
                    marketData.domestic.equity.kosdaq[marketData.dates.length - 1 - index],
                )}, KOSPI200 ${formatChange(
                    marketData.domestic.equity.kospi200[marketData.dates.length - 1],
                    marketData.domestic.equity.kospi200[marketData.dates.length - 1 - index],
                )}`
            } else {
                return `[${periodLabel} 증감]
● 국고 3년물 ${formatChange(
                    marketData.domestic.bonds.treasury.y3[marketData.dates.length - 1],
                    marketData.domestic.bonds.treasury.y3[marketData.dates.length - 1 - index],
                )}, 국고 10년물 ${formatChange(
                    marketData.domestic.bonds.treasury.y10[marketData.dates.length - 1],
                    marketData.domestic.bonds.treasury.y10[marketData.dates.length - 1 - index],
                )}, CD ${formatChange(
                    marketData.domestic.bonds.cd[marketData.dates.length - 1],
                    marketData.domestic.bonds.cd[marketData.dates.length - 1 - index],
                )}`
            }
        },
        [getIndexByPeriod, formatChange],
    )

    // 날짜 포맷팅 함수들 추가
    const formatTooltipDate = useCallback((dateString) => {
        const date = new Date(dateString)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }, [])

    const formatAxisDate = useCallback((dateString) => {
        const date = new Date(dateString)
        const year = String(date.getFullYear()).slice(2)
        const month = String(date.getMonth() + 1).padStart(2, '0')
        return `${year}.${month}`
    }, [])

    // 데이터 준비 함수 수정
    const prepareEquityGraphData = useCallback(() => {
        const compareIndex = getIndexByPeriod(selectedEquityPeriod)
        const filteredDates = marketData.dates.slice(0, compareIndex + 1)

        try {
            return filteredDates
                .map((date, index) => {
                    const value = marketData.domestic.equity[selectedEquityIndicator][index]
                    return {
                        date: formatAxisDate(date),
                        fullDate: formatTooltipDate(date),
                        value: value,
                        indicator: EQUITY_INDICATORS.find((i) => i.id === selectedEquityIndicator)?.label,
                    }
                })
                .filter(Boolean)
                .reverse()
        } catch (error) {
            console.error('Error preparing equity data:', error)
            return []
        }
    }, [selectedEquityIndicator, selectedEquityPeriod, formatAxisDate, formatTooltipDate, getIndexByPeriod])

    const prepareBondGraphData = useCallback(() => {
        const compareIndex = getIndexByPeriod(selectedBondsPeriod)
        const filteredDates = marketData.dates.slice(0, compareIndex + 1)

        try {
            return filteredDates
                .map((date, index) => {
                    let value
                    if (selectedBondIndicator === 'y3') {
                        value = marketData.domestic.bonds.treasury.y3[index]
                    } else if (selectedBondIndicator === 'y10') {
                        value = marketData.domestic.bonds.treasury.y10[index]
                    } else {
                        value = marketData.domestic.bonds.cd[index]
                    }

                    return {
                        date: formatAxisDate(date),
                        fullDate: formatTooltipDate(date),
                        value: value * 100,
                        indicator: BOND_INDICATORS.find((i) => i.id === selectedBondIndicator)?.label,
                    }
                })
                .filter(Boolean)
                .reverse()
        } catch (error) {
            console.error('Error preparing bond data:', error)
            return []
        }
    }, [selectedBondIndicator, selectedBondsPeriod, formatAxisDate, formatTooltipDate, getIndexByPeriod])

    return (
        <Card>
            <CardContent className="p-5">
                <div className="flex">
                    {/* 왼쪽 섹션 (2/3) */}
                    <div className="w-3/4 pr-10">
                        {/* 주식 시장 섹션 */}
                        <div>
                            {/* 헤더 섹션 */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-white">📈</span>
                                    <h3 className="text-lg font-medium text-white">국내 주식시장</h3>
                                </div>
                            </div>

                            {/* 주식 섹션 */}
                            <section className="mb-8">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="flex items-center text-yellow-300">
                                        <span className="w-2 h-2 bg-yellow-300 rounded-full mr-2"></span>
                                        국내 주식시장 동향 및 뉴스
                                    </h4>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm text-gray-400">
                                            ({getDateRange(selectedEquityTrendPeriod).start} ~{' '}
                                            {getDateRange(selectedEquityTrendPeriod).end})
                                        </span>
                                        <select
                                            value={selectedEquityTrendPeriod}
                                            onChange={(e) => setSelectedEquityTrendPeriod(e.target.value)}
                                            className="bg-gray-800 text-white text-sm px-3 py-1.5 rounded-md border border-gray-600"
                                        >
                                            {TREND_PERIODS.map((period) => (
                                                <option key={period.id} value={period.id}>
                                                    {period.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* 주식시장 동향 */}
                                <div className="mb-4">
                                    <p className="text-gray-200 text-sm">
                                        {getTrendText(selectedEquityTrendPeriod, 'equity', 'trend')}
                                    </p>
                                </div>

                                {/* 주식시장 뉴스 */}
                                <div className="mb-8 space-y-2">
                                    {/* 긍정적 뉴스 - 초록색 */}
                                    <div className="flex items-start gap-2">
                                        <div
                                            className="text-gray-200 text-sm"
                                            dangerouslySetInnerHTML={{
                                                __html: getTrendText(
                                                    selectedEquityTrendPeriod,
                                                    'equity',
                                                    'positiveNews',
                                                ),
                                            }}
                                        />
                                    </div>
                                    {/* 부정적 뉴스 - 빨간색 */}
                                    <div className="flex items-start gap-2">
                                        <div
                                            className="text-gray-200 text-sm"
                                            dangerouslySetInnerHTML={{
                                                __html: getTrendText(
                                                    selectedEquityTrendPeriod,
                                                    'equity',
                                                    'negativeNews',
                                                ),
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* 주식 증감 */}
                                <div className="mt-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="flex items-center text-yellow-300">
                                            <span className="w-2 h-2 bg-yellow-300 rounded-full mr-2"></span>
                                            국내 주식 증감
                                        </h4>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm text-gray-400">
                                                ({getDateRange(selectedEquityPeriod).start} ~{' '}
                                                {getDateRange(selectedEquityPeriod).end})
                                            </span>
                                            <select
                                                value={selectedEquityPeriod}
                                                onChange={(e) => setSelectedEquityPeriod(e.target.value)}
                                                className="bg-gray-800 text-white text-sm px-3 py-1.5 rounded-md border border-gray-600"
                                            >
                                                {PERIODS.map((period) => (
                                                    <option key={period.id} value={period.id}>
                                                        {period.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <p className="text-gray-200 text-sm whitespace-pre-line">
                                        {getAnalysisText(selectedEquityPeriod, 'equity')}
                                    </p>
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* 오른쪽 섹션 (1/3) */}
                    <div className="w-1/4">
                        {/* 주식 시장 그래프/테이블 */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-sm text-gray-400">주식 시장</h4>
                                <div className="flex gap-2">
                                    <button
                                        className={`px-3 py-1 text-sm rounded ${
                                            equityViewMode === 'graph'
                                                ? 'bg-gradient-to-r from-slate-700/70 to-zinc-700/70 text-slate-100 border border-slate-500/50'
                                                : 'bg-gradient-to-r from-slate-900/50 to-zinc-900/50 hover:from-slate-800/50 hover:to-zinc-800/50 text-slate-200/90 border border-slate-700/50'
                                        }`}
                                        onClick={() => setEquityViewMode('graph')}
                                    >
                                        그래프
                                    </button>
                                    <button
                                        className={`px-3 py-1 text-sm rounded ${
                                            equityViewMode === 'table'
                                                ? 'bg-gradient-to-r from-slate-700/70 to-zinc-700/70 text-slate-100 border border-slate-500/50'
                                                : 'bg-gradient-to-r from-slate-900/50 to-zinc-900/50 hover:from-slate-800/50 hover:to-zinc-800/50 text-slate-200/90 border border-slate-700/50'
                                        }`}
                                        onClick={() => setEquityViewMode('table')}
                                    >
                                        테이블
                                    </button>
                                </div>
                            </div>
                            <select
                                value={selectedEquityIndicator}
                                onChange={(e) => setSelectedEquityIndicator(e.target.value)}
                                className="w-full bg-gray-800 text-white text-sm px-3 py-2 rounded-md border border-gray-600 mb-4"
                            >
                                {EQUITY_INDICATORS.map((indicator) => (
                                    <option key={indicator.id} value={indicator.id}>
                                        {indicator.label}
                                    </option>
                                ))}
                            </select>
                            {equityViewMode === 'graph' ? (
                                <div className="h-60">
                                    <ResponsiveContainer width="100%" height="120%">
                                        <LineChart
                                            data={prepareEquityGraphData()}
                                            margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                            <XAxis dataKey="date" tick={{ fill: '#9CA3AF', fontSize: 15 }} />
                                            <YAxis
                                                tick={{
                                                    fill: '#9CA3AF',
                                                    fontSize: 12,
                                                }}
                                                tickFormatter={(value) => {
                                                    return Number.isInteger(value) ? value : value.toFixed(2)
                                                }}
                                            />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: 'black', border: 'none' }}
                                                formatter={(value, name, props) => [
                                                    `${props.payload.indicator} ${value?.toFixed(3)}%`,
                                                ]}
                                                labelFormatter={(label, payload) => {
                                                    if (payload && payload[0]) {
                                                        return payload[0].payload.fullDate // YYYY-MM-DD 형식으로 표시
                                                    }
                                                    return ''
                                                }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="value"
                                                stroke={
                                                    EQUITY_INDICATORS.find((i) => i.id === selectedEquityIndicator)
                                                        ?.color
                                                }
                                                dot={false}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="overflow-y-auto max-h-60 border border-gray-700 rounded-md">
                                    <table className="min-w-full divide-y divide-gray-700">
                                        <thead className="bg-gray-800 sticky top-0">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">
                                                    날짜
                                                </th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">
                                                    지표
                                                </th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-400">
                                                    값
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-700">
                                            {prepareEquityGraphData().map((item, index) => (
                                                <tr key={`equity-${index}`}>
                                                    <td className="px-4 py-2 text-sm text-gray-300">{item.fullDate}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-300">
                                                        {item.indicator}
                                                    </td>
                                                    <td className="px-4 py-2 text-sm text-gray-300 text-right">
                                                        {item.value ? Number(item.value).toFixed(2) : 'N/A'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 전체 섹션을 가로지르는 구분선 */}
                <div className="border-b border-gray-700 my-6"></div>

                <div className="flex">
                    {/* 왼쪽 섹션 (2/3) */}
                    <div className="w-3/4 pr-10">
                        {/* 채권 시장 섹션 */}
                        <div>
                            {/* 헤더 섹션 */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-white">📈</span>
                                    <h3 className="text-lg font-medium text-white">국내 채권시장</h3>
                                </div>
                            </div>

                            {/* 채권 섹션 */}
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="flex items-center text-blue-300">
                                        <span className="w-2 h-2 bg-blue-300 rounded-full mr-2"></span>
                                        국내 채권시장 동향 및 뉴스
                                    </h4>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm text-gray-400">
                                            ({getDateRange(selectedBondsTrendPeriod).start} ~{' '}
                                            {getDateRange(selectedBondsTrendPeriod).end})
                                        </span>
                                        <select
                                            value={selectedBondsTrendPeriod}
                                            onChange={(e) => setSelectedBondsTrendPeriod(e.target.value)}
                                            className="bg-gray-800 text-white text-sm px-3 py-1.5 rounded-md border border-gray-600"
                                        >
                                            {TREND_PERIODS.map((period) => (
                                                <option key={period.id} value={period.id}>
                                                    {period.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* 채권시장 동향 */}
                                <div className="mb-4">
                                    <p
                                        className="text-gray-200 text-sm"
                                        dangerouslySetInnerHTML={{
                                            __html: getTrendText(selectedBondsTrendPeriod, 'bonds', 'trend'),
                                        }}
                                    />
                                </div>

                                {/* 채권시장 뉴스 */}
                                <div className="mb-8 space-y-2">
                                    {/* 긍정적 뉴스 - 초록색 */}
                                    <div className="flex items-start gap-2">
                                        <div
                                            className="text-gray-200 text-sm"
                                            dangerouslySetInnerHTML={{
                                                __html: getTrendText(selectedBondsTrendPeriod, 'bonds', 'positiveNews'),
                                            }}
                                        />
                                    </div>
                                    {/* 부정적 뉴스 - 빨간색 */}
                                    <div className="flex items-start gap-2">
                                        <div
                                            className="text-gray-200 text-sm"
                                            dangerouslySetInnerHTML={{
                                                __html: getTrendText(selectedBondsTrendPeriod, 'bonds', 'negativeNews'),
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* 채권 증감 */}
                                <div className="mt-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="flex items-center text-blue-300">
                                            <span className="w-2 h-2 bg-blue-300 rounded-full mr-2"></span>
                                            국내 채권 증감
                                        </h4>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm text-gray-400">
                                                ({getDateRange(selectedBondsPeriod).start} ~{' '}
                                                {getDateRange(selectedBondsPeriod).end})
                                            </span>
                                            <select
                                                value={selectedBondsPeriod}
                                                onChange={(e) => setSelectedBondsPeriod(e.target.value)}
                                                className="bg-gray-800 text-white text-sm px-3 py-1.5 rounded-md border border-gray-600"
                                            >
                                                {PERIODS.map((period) => (
                                                    <option key={period.id} value={period.id}>
                                                        {period.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <p className="text-gray-200 text-sm whitespace-pre-line">
                                        {getAnalysisText(selectedBondsPeriod, 'bonds')}
                                    </p>
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* 오른쪽 섹션 (1/3) */}
                    <div className="w-1/4">
                        {/* 채권 시장 그래프/테이블 */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-sm text-gray-400">채권 시장</h4>
                                <div className="flex gap-2">
                                    <button
                                        className={`px-3 py-1 text-sm rounded ${
                                            bondViewMode === 'graph'
                ? 'bg-gradient-to-r from-slate-700/70 to-zinc-700/70 text-slate-100 border border-slate-500/50'
                : 'bg-gradient-to-r from-slate-900/50 to-zinc-900/50 hover:from-slate-800/50 hover:to-zinc-800/50 text-slate-200/90 border border-slate-700/50'
                                        }`}
                                        onClick={() => setBondViewMode('graph')}
                                    >
                                        그래프
                                    </button>
                                    <button
                                        className={`px-3 py-1 text-sm rounded ${
                                            bondViewMode === 'table'
                ? 'bg-gradient-to-r from-slate-700/70 to-zinc-700/70 text-slate-100 border border-slate-500/50'
                : 'bg-gradient-to-r from-slate-900/50 to-zinc-900/50 hover:from-slate-800/50 hover:to-zinc-800/50 text-slate-200/90 border border-slate-700/50'
                                        }`}
                                        onClick={() => setBondViewMode('table')}
                                    >
                                        테이블
                                    </button>
                                </div>
                            </div>
                            <select
                                value={selectedBondIndicator}
                                onChange={(e) => setSelectedBondIndicator(e.target.value)}
                                className="w-full bg-gray-800 text-white text-sm px-3 py-2 rounded-md border border-gray-600 mb-4"
                            >
                                {BOND_INDICATORS.map((indicator) => (
                                    <option key={indicator.id} value={indicator.id}>
                                        {indicator.label}
                                    </option>
                                ))}
                            </select>
                            {bondViewMode === 'graph' ? (
                                <div className="h-60">
                                    <ResponsiveContainer width="100%" height="120%">
                                        <LineChart
                                            data={prepareBondGraphData()}
                                            margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                            <XAxis dataKey="date" tick={{ fill: '#9CA3AF', fontSize: 15 }} />
                                            <YAxis
                                                tick={{
                                                    fill: '#9CA3AF',
                                                    fontSize: 12,
                                                }}
                                                tickFormatter={(value) => {
                                                    return Number.isInteger(value) ? value : value.toFixed(2)
                                                }}
                                            />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: 'black', border: 'none' }}
                                                formatter={(value, name, props) => [
                                                    `${props.payload.indicator} ${value?.toFixed(3)}%`,
                                                ]}
                                                labelFormatter={(label, payload) => {
                                                    if (payload && payload[0]) {
                                                        return payload[0].payload.fullDate // YYYY-MM-DD 형식으로 표시
                                                    }
                                                    return ''
                                                }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="value"
                                                stroke={
                                                    BOND_INDICATORS.find((i) => i.id === selectedBondIndicator)?.color
                                                }
                                                dot={false}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="overflow-y-auto max-h-60 border border-gray-700 rounded-md">
                                    <table className="min-w-full divide-y divide-gray-700">
                                        <thead className="bg-gray-800 sticky top-0">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">
                                                    날짜
                                                </th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">
                                                    지표
                                                </th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-400">
                                                    값
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-700">
                                            {prepareBondGraphData().map((item, index) => (
                                                <tr key={`bond-${index}`}>
                                                    <td className="px-4 py-2 text-sm text-gray-300">{item.fullDate}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-300">
                                                        {item.indicator}
                                                    </td>
                                                    <td className="px-4 py-2 text-sm text-gray-300 text-right">
                                                        {item.value ? Number(item.value).toFixed(2) : 'N/A'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default DomesticMarketAnalysis
