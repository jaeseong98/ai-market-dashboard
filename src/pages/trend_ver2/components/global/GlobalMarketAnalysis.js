import { Card, CardContent } from '../../../../components/Card.js'
import { useState, useMemo, useCallback } from 'react'
import marketData from '../../../../data/marketData.json'
import marketAnalysis from '../../../../data/market_analysis_1112.json' // 새로운 JSON 파일 import
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const PERIODS = [
    { id: 'daily', label: '전일대비' },
    { id: 'weekly', label: '전주대비' },
    { id: 'monthly', label: '전월대비' },
    { id: 'quarterly', label: '전분기대비' },
    { id: 'yearly', label: '전년대비' },
]

const EQUITY_INDICATORS = [
    { id: 'msci_acwi', label: 'MSCI ACWI', color: '#8884d8' },
    { id: 'msci_dm', label: 'MSCI DM', color: '#82ca9d' },
    { id: 'msci_em', label: 'MSCI EM', color: '#ffc658' },
    { id: 'nasdaq', label: 'NASDAQ', color: '#ff7300' },
    { id: 'sp500', label: 'S&P500', color: '#0088fe' },
    { id: 'stoxx600', label: 'STOXX600', color: '#00c49f' },
]

const BOND_INDICATORS = [
    { id: 'us_policy', label: '미국 기준금리', color: '#FCD34D' },
    { id: 'us_y1', label: '미국 국채 1년', color: '#F59E0B' },
    { id: 'us_y3', label: '미국 국채 3년', color: '#F97316' },
    { id: 'us_y10', label: '미국 국채 10년', color: '#FB923C' },
    { id: 'us_y30', label: '미국 국채 30년', color: '#FDE68A' },

    { id: 'japan_policy', label: '일본 기준금리', color: '#60A5FA' },

    { id: 'europe_policy', label: '유럽 기준금리', color: '#34D399' },
]

const TREND_PERIODS = [
    { id: 'daily', label: '일간 동향' },
    { id: 'weekly', label: '주간 동향' },
    { id: 'monthly', label: '월간 동향' },
]
const GlobalMarketAnalysis = () => {
    const [selectedEquityTrendPeriod, setSelectedEquityTrendPeriod] = useState('monthly')
    const [selectedBondsTrendPeriod, setSelectedBondsTrendPeriod] = useState('monthly')
    const [selectedEquityPeriod, setSelectedEquityPeriod] = useState('monthly')
    const [selectedBondsPeriod, setSelectedBondsPeriod] = useState('monthly')
    const [selectedEquityIndicator, setSelectedEquityIndicator] = useState('msci_acwi')
    const [selectedBondIndicator, setSelectedBondIndicator] = useState('us_policy')
    const [equityViewMode, setEquityViewMode] = useState('graph')
    const [bondViewMode, setBondViewMode] = useState('graph')

    // useMemo 수정
    const globalData = useMemo(
        () => ({
            dates: marketData.dates,
            bonds: marketData.global.bonds,
            equity: marketData.global.equity,
        }),
        [],
    ) // marketData 의존성 제거

    const getIndexByPeriod = useCallback(
        (period) => {
            const currentDate = new Date(globalData.dates[0])
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
            let closestDiff = Math.abs(new Date(globalData.dates[0]).getTime() - targetTime)

            for (let i = 1; i < globalData.dates.length; i++) {
                const diff = Math.abs(new Date(globalData.dates[i]).getTime() - targetTime)
                if (diff < closestDiff) {
                    closestDiff = diff
                    closestIndex = i
                }
            }

            return closestIndex
        },
        [globalData.dates],
    )

    const formatChange = useCallback((current, previous, type = 'bp') => {
        if (current === undefined || previous === undefined) {
            return 'N/A'
        }

        const change = current - previous

        if (type === 'bp') {
            // 베이시스 포인트로 변환 (0.01 = 1bp)
            const bpChange = change * 10000
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

    // 통합된 분석 텍스트 생성 함수
    const getAnalysisText = useCallback(
        (period, market) => {
            if (!marketData || !marketData.global) {
                return '데이터 로딩 중...'
            }

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
● MSCI ACWI ${formatChange(
                    marketData.global.equity.msci_acwi[marketData.dates.length - 1],
                    marketData.global.equity.msci_acwi[marketData.dates.length - 1 - index],
                )}, MSCI DM ${formatChange(
                    marketData.global.equity.msci_dm[marketData.dates.length - 1],
                    marketData.global.equity.msci_dm[marketData.dates.length - 1 - index],
                )}, MSCI EM ${formatChange(
                    marketData.global.equity.msci_em[marketData.dates.length - 1],
                    marketData.global.equity.msci_em[marketData.dates.length - 1 - index],
                )}
● NASDAQ ${formatChange(
                    marketData.global.equity.nasdaq[marketData.dates.length - 1],
                    marketData.global.equity.nasdaq[marketData.dates.length - 1 - index],
                )}, S&P500 ${formatChange(
                    marketData.global.equity.sp500[marketData.dates.length - 1],
                    marketData.global.equity.sp500[marketData.dates.length - 1 - index],
                )}, STOXX600 ${formatChange(
                    marketData.global.equity.stoxx600[marketData.dates.length - 1],
                    marketData.global.equity.stoxx600[marketData.dates.length - 1 - index],
                )}`
            } else {
                // 미국 채권 지표들
                const usChanges = `● 미국(기준금리 ${formatChange(
                    marketData.global.bonds.us.policy_rate[marketData.dates.length - 1],
                    marketData.global.bonds.us.policy_rate[marketData.dates.length - 1 - index],
                )}, 1년물 ${formatChange(
                    marketData.global.bonds.us.y1[marketData.dates.length - 1],
                    marketData.global.bonds.us.y1[marketData.dates.length - 1 - index],
                )}, 3년물 ${formatChange(
                    marketData.global.bonds.us.y3[marketData.dates.length - 1],
                    marketData.global.bonds.us.y3[marketData.dates.length - 1 - index],
                )}, 10년물 ${formatChange(
                    marketData.global.bonds.us.y10[marketData.dates.length - 1],
                    marketData.global.bonds.us.y10[marketData.dates.length - 1 - index],
                )}, 30년물 ${formatChange(
                    marketData.global.bonds.us.y30[marketData.dates.length - 1],
                    marketData.global.bonds.us.y30[marketData.dates.length - 1 - index],
                )})\n● 일본 기준금리 ${formatChange(
                    marketData.global.bonds.japan.policy_rate[marketData.dates.length - 1],
                    marketData.global.bonds.japan.policy_rate[marketData.dates.length - 1 - index],
                )}, 유럽 기준금리 ${formatChange(
                    marketData.global.bonds.europe.policy_rate[marketData.dates.length - 1],
                    marketData.global.bonds.europe.policy_rate[marketData.dates.length - 1 - index],
                )}`

                return `[${periodLabel} 증감]\n${usChanges}`
            }
        },
        [getIndexByPeriod, formatChange],
    )

    // 금융시장 동향 텍스트 생성 함수
    const getTrendText = useCallback((period, market, type) => {
        const currentMonth = '2024-10'

        if (!marketAnalysis.금융시장동향[currentMonth]) return ''

        let marketSection = market === 'equity' ? '해외시장' : '해외채권'

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

    const getDateRange = useCallback((period) => {
        if (!marketData || !marketData.dates) return { start: '', end: '' }

        const dates = marketData.dates
        const currentDate = new Date(dates[0]) // 가장 최신 날짜

        // 기간에 따른 과거 날짜 계산
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

        // YYYY-MM-DD 형식을 YY.MM.DD 형식으로 변환
        const formatDate = (date) => {
            const year = date.getFullYear().toString().slice(2)
            const month = (date.getMonth() + 1).toString().padStart(2, '0')
            const day = date.getDate().toString().padStart(2, '0')
            return `${year}.${month}.${day}`
        }

        return {
            start: formatDate(pastDate),
            end: formatDate(currentDate),
        }
    }, [])

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

    const prepareEquityGraphData = useCallback(() => {
        const compareIndex = getIndexByPeriod(selectedEquityPeriod)
        const filteredDates = globalData.dates.slice(0, compareIndex + 1)

        try {
            return filteredDates
                .map((date, index) => {
                    // equity 데이터가 존재하는지 확인
                    if (!marketData.global.equity || !marketData.global.equity[selectedEquityIndicator]) {
                        console.error('Equity data not found:', selectedEquityIndicator)
                        return null
                    }

                    const value = marketData.global.equity[selectedEquityIndicator][index]
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
    }, [globalData, selectedEquityIndicator, selectedEquityPeriod, formatAxisDate, formatTooltipDate, getIndexByPeriod])

    const prepareBondGraphData = useCallback(() => {
        const compareIndex = getIndexByPeriod(selectedBondsPeriod)
        const filteredDates = globalData.dates.slice(0, compareIndex + 1)

        try {
            return filteredDates
                .map((date, index) => {
                    const [country, rateType] = selectedBondIndicator.split('_')

                    if (!marketData.global.bonds?.[country]) {
                        console.error('Bond data not found for country:', country)
                        return null
                    }

                    let value
                    // policy와 국채 구분
                    if (rateType === 'policy') {
                        value = marketData.global.bonds[country]['policy_rate']?.[index]
                    } else {
                        value = marketData.global.bonds[country][rateType]?.[index]
                    }

                    if (value === undefined) {
                        console.error('Bond data not found for type:', rateType)
                        return null
                    }

                    const indicator = BOND_INDICATORS.find((i) => i.id === selectedBondIndicator)
                    return {
                        date: formatAxisDate(date),
                        fullDate: formatTooltipDate(date),
                        value: value,
                        indicator: indicator?.label,
                        color: indicator?.color,
                    }
                })
                .filter(Boolean)
                .reverse()
        } catch (error) {
            console.error('Error preparing bond data:', error)
            return []
        }
    }, [globalData, selectedBondIndicator, selectedBondsPeriod, formatAxisDate, formatTooltipDate, getIndexByPeriod])

    return (
        <Card>
            <CardContent className="p-5">
                {/* 주식시장 섹션 */}
                <div className="flex">
                    {/* 왼쪽 텍스트 섹션 */}
                    <div className="w-3/4 pr-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <span className="text-white">🌎</span>
                                <h3 className="text-lg font-medium text-white">해외 주식시장</h3>
                            </div>
                        </div>

                        {/* 주식시장 동향 및 뉴스 */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="flex items-center text-yellow-300">
                                    <span className="w-2 h-2 bg-yellow-300 rounded-full mr-2"></span>
                                    해외 주식시장 동향 및 뉴스
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
                                            __html: getTrendText(selectedEquityTrendPeriod, 'equity', 'positiveNews'),
                                        }}
                                    />
                                </div>
                                {/* 부정 뉴스 - 빨간색 */}
                                <div className="flex items-start gap-2">
                                    <div
                                        className="text-gray-200 text-sm"
                                        dangerouslySetInnerHTML={{
                                            __html: getTrendText(selectedEquityTrendPeriod, 'equity', 'negativeNews'),
                                        }}
                                    />
                                </div>
                            </div>

                            {/* 주식 증감 */}
                            <div className="mt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="flex items-center text-yellow-300">
                                        <span className="w-2 h-2 bg-yellow-300 rounded-full mr-2"></span>
                                        해외 주식 증감
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
                                                        {item.value ? Number(item.value).toFixed(3) : 'N/A'}%
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

                {/* 채권시장 섹션 */}
                <div className="flex">
                    {/* 왼쪽 텍스트 섹션 */}
                    <div className="w-3/4 pr-10">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-white">🌎</span>
                            <h3 className="text-lg font-medium text-white">해외 채권시장</h3>
                        </div>
                        {/* 채권시장 동향 및 뉴스 */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="flex items-center text-blue-300">
                                    <span className="w-2 h-2 bg-blue-300 rounded-full mr-2"></span>
                                    해외 채권시장 동향 및 뉴스
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
                                <p className="text-gray-200 text-sm">
                                    {getTrendText(selectedBondsTrendPeriod, 'bonds', 'trend')}
                                </p>
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
                                        해외 채권 증감
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
                                                    const percentValue = value * 100
                                                    return Number.isInteger(percentValue)
                                                        ? percentValue
                                                        : percentValue.toFixed(2)
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
                                                        {item.value ? Number(item.value * 100).toFixed(2) : 'N/A'}%
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

export default GlobalMarketAnalysis
