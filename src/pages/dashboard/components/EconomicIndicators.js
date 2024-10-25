import React, { useState, useMemo, useCallback } from 'react'
import { Card, CardHeader, CardContent } from '../../../components/Card.js'
import Button from '../../../components/Button.js'
import Input from '../../../components/Input.js'
import { indicatorNames, indicatorIcons, indicatorUnits, indicatorCategories, recommendedIndicators } from '../../../helpers/indicators.js'
import {
    calculateStatistics,
    formatValue,
    calculateTrend,
    normalizeData,
} from '../../../helpers/dataprocessing.js'
import { ArrowLeft, ArrowRight, Minus, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { TimeSeriesChart, CompareChart } from './TimeSeriesChart.js'
import { Tooltip } from '../../../helpers/Tooltip.js'
import CompareModal from './CompareModal.js'

const EconomicIndicators = React.memo(({ data }) => {
    const [selectedIndicator, setSelectedIndicator] = useState(null)
    const [isNormalized, setIsNormalized] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('전체')
    const [currentPage, setCurrentPage] = useState(1)
    const [isCompareMode] = useState(false)
    const [selectedIndicators, setSelectedIndicators] = useState([])
    const [isCompareModalOpen, setIsCompareModalOpen] = useState(false)
    const [useKorCycle, setUseKorCycle] = useState(false)

    const memoizedNormalizedData = useMemo(() => normalizeData(data), [data])

    const filteredIndicators = useMemo(() => {
        return Object.keys(indicatorNames).filter(key => {
            const matchesSearch = indicatorNames[key].toLowerCase().includes(searchTerm.toLowerCase())
            const matchesCategory = selectedCategory === '전체' 
                ? true 
                : selectedCategory === '추천' 
                    ? recommendedIndicators[useKorCycle ? 'kr' : 'us'].includes(key)
                    : indicatorCategories[key] && (
                        Array.isArray(indicatorCategories[key])
                            ? indicatorCategories[key].includes(selectedCategory)
                            : indicatorCategories[key] === selectedCategory
                    )
            return matchesSearch && matchesCategory
        })
    }, [searchTerm, selectedCategory, useKorCycle])

    const paginatedIndicators = useMemo(() => {
        const startIndex = (currentPage - 1) * 9
        return filteredIndicators.slice(startIndex, startIndex + 9)
    }, [filteredIndicators, currentPage])

    const pageCount = Math.ceil(filteredIndicators.length / 9)

    const uniqueCategories = useMemo(() => {
        const categories = new Set(['전체'])
        Object.values(indicatorCategories).forEach(cats => {
            if (Array.isArray(cats)) {
                cats.forEach(cat => categories.add(cat))
            } else if (cats) {
                categories.add(cats)
            }
        })
        const sortedCategories = Array.from(categories).sort((a, b) => a.localeCompare(b))
        return ['추천', '전체', ...sortedCategories.filter(cat => cat !== '전체' && cat !== '추천')]
    }, [])

    const indicatorStats = useMemo(() => {
        const stats = {}
        filteredIndicators.forEach(indicatorKey => {
            stats[indicatorKey] = calculateStatistics(
                isNormalized ? memoizedNormalizedData : data,
                indicatorKey,
                useKorCycle
            )
        })
        return stats
    }, [filteredIndicators, isNormalized, memoizedNormalizedData, data, useKorCycle])

    const renderIndicatorChart = useCallback((indicatorKey) => {
        const stats = indicatorStats[indicatorKey]
        if (indicatorKey === 'nber_recession_indicator' || !stats) return null

        const currentData = isNormalized ? memoizedNormalizedData : data

        const trend = calculateTrend(currentData, indicatorKey)
        const Icon = indicatorIcons[indicatorKey]

        if (!stats) return null


        const range = stats.max - stats.min
        const getPosition = (value) => Math.max(0, Math.min(100, ((value - stats.min) / range) * 100))

        const getTrendIcon = () => {
            switch (trend) {
                case 'up':
                    return <ArrowRight className="text-yellow-500 w-5 h-5" />
                case 'down':
                    return <ArrowLeft className="text-yellow-500 w-5 h-5" />
                default:
                    return <Minus className="text-yellow-500 w-5 h-5" />
            }
        }


        const recessionStart = stats.recessionAvg - stats.recessionStdDev
        const recessionEnd = stats.recessionAvg + stats.recessionStdDev
        const expansionStart = stats.expansionAvg - stats.expansionStdDev
        const expansionEnd = stats.expansionAvg + stats.expansionStdDev

        // 겹치는 부분 계산
        const overlapStart = Math.max(recessionStart, expansionStart)
        const overlapEnd = Math.min(recessionEnd, expansionEnd)

        // 겹치는 부분이 있는 경우에만 조정
        const hasOverlap = overlapStart < overlapEnd

        // 중첩되지 않은 범위 계산
        const expansionRanges = []
        const recessionRanges = []

        if (hasOverlap) {
            if (expansionStart < overlapStart) {
                expansionRanges.push([expansionStart, overlapStart])
            }
            if (expansionEnd > overlapEnd) {
                expansionRanges.push([overlapEnd, expansionEnd])
            }
            if (recessionStart < overlapStart) {
                recessionRanges.push([recessionStart, overlapStart])
            }
            if (recessionEnd > overlapEnd) {
                recessionRanges.push([overlapEnd, recessionEnd])
            }
        } else {
            expansionRanges.push([expansionStart, expansionEnd])
            recessionRanges.push([recessionStart, recessionEnd])
        }

        const tooltipContent = (
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-white mb-2">{indicatorNames[indicatorKey]}</h3>
                <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                        <p className="text-sm text-gray-400">현재 값</p>
                        <p className="text-lg font-bold text-amber-500">{formatValue(stats.current, true)}</p>
                    </div>
                    {expansionRanges.length > 0 && (
                        <div>
                            <p className="text-sm text-gray-400">확장기 범위</p>
                            <p className="text-emerald-500">
                                {expansionRanges.map((range, index) => (
                                    <span key={index}>
                                        {formatValue(range[0], true)} ~ {formatValue(range[1], true)}
                                        {index < expansionRanges.length - 1 && <br />}
                                    </span>
                                ))}
                            </p>
                        </div>
                    )}
                    {recessionRanges.length > 0 && (
                        <div>
                            <p className="text-sm text-gray-400">침체기 범위</p>
                            <p className="text-rose-500">
                                {recessionRanges.map((range, index) => (
                                    <span key={index}>
                                        {formatValue(range[0], true)} ~ {formatValue(range[1], true)}
                                        {index < recessionRanges.length - 1 && <br />}
                                    </span>
                                ))}
                            </p>
                        </div>
                    )}
                    <div>
                        <p className="text-sm text-gray-400">확장기 평균</p>
                        <p className="text-emerald-500">{formatValue(stats.expansionAvg, true)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">침체기 평균</p>
                        <p className="text-rose-500">{formatValue(stats.recessionAvg, true)}</p>
                    </div>
                    <div className="col-span-2">
                        <p className="text-sm text-gray-400">전체 범위</p>
                        <p className="text-gray-300">
                            {formatValue(stats.min, true)} ~ {formatValue(stats.max, true)}
                        </p>
                    </div>
                    <div className="col-span-2 mt-2">
                        <p className="text-sm text-gray-400">전월 대비</p>
                        <div className="grid grid-cols-3 gap-2 mt-1">
                            {[
                                { label: '1개월', value: stats.oneMonthChange, previous: stats.previousMonth },
                                { label: '3개월', value: stats.threeMonthChange, previous: stats.threeMonthsAgo },
                                { label: '6개월', value: stats.sixMonthChange, previous: stats.sixMonthsAgo }
                            ].map(({ label, value, previous }) => (
                                <div key={label} className="text-center">
                                    <p className="text-xs text-gray-400">{label} 전</p>
                                    {value !== null ? (
                                        <p className={`text-sm font-semibold ${
                                            value > 0 ? 'text-emerald-500' : 
                                            value < 0 ? 'text-rose-500' : 
                                            'text-gray-300'
                                        }`}>
                                            {value > 0 ? '+' : ''}{formatValue(value)}%
                                        </p>
                                    ) : (
                                        <p className="text-sm text-gray-400">N/A</p>
                                    )}
                                    <p className="text-xs text-gray-400">
                                        {previous !== undefined ? formatValue(previous) : 'N/A'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )

        return (
            <Tooltip content={tooltipContent}>
                <Card
                    key={indicatorKey}
                    className={`bg-gray-800 border-gray-700 cursor-pointer overflow-hidden ${
                        isCompareMode && selectedIndicators.includes(indicatorKey) ? 'border-2 border-blue-500' : ''
                    }`}
                    onClick={() => {
                        if (isCompareMode) {
                            setSelectedIndicators(prev => 
                                prev.includes(indicatorKey) 
                                    ? prev.filter(key => key !== indicatorKey)
                                    : [...prev, indicatorKey].slice(-3)
                            )
                        } else {
                            setSelectedIndicator(indicatorKey)
                        }
                    }}
                >
                    <div className="flex items-center justify-between mb-7">
                        <div className="flex items-center">
                            <Icon className="w-5 h-5 mr-2 text-blue-500" />
                            <h3 className="text-base font-semibold text-gray-100">{indicatorNames[indicatorKey]}</h3>
                        </div>
                        {!isNormalized && (
                            <span className="text-xs text-gray-400">단위 : {indicatorUnits[indicatorKey]}</span>
                        )}
                    </div>
                    <div className="relative h-8 bg-gray-700 mx-3">
                        <div className="absolute inset-0 bg-gray-600"></div>
                        <div
                            className="absolute h-full bg-rose-500 bg-opacity-30"
                            style={{
                                left: `${getPosition(recessionStart)}%`,
                                width: `${getPosition(hasOverlap ? overlapStart : recessionEnd) - getPosition(recessionStart)}%`,
                            }}
                        ></div>
                        {hasOverlap && (
                            <div
                                className="absolute h-full bg-rose-500 bg-opacity-30"
                                style={{
                                    left: `${getPosition(overlapEnd)}%`,
                                    width: `${getPosition(recessionEnd) - getPosition(overlapEnd)}%`,
                                }}
                            ></div>
                        )}
                        <div
                            className="absolute h-full bg-emerald-500 bg-opacity-30"
                            style={{
                                left: `${getPosition(hasOverlap ? overlapEnd : expansionStart)}%`,
                                width: `${getPosition(expansionEnd) - getPosition(hasOverlap ? overlapEnd : expansionStart)}%`,
                            }}
                        ></div>
                        {hasOverlap && (
                            <div
                                className="absolute h-full bg-emerald-500 bg-opacity-30"
                                style={{
                                    left: `${getPosition(expansionStart)}%`,
                                    width: `${getPosition(overlapStart) - getPosition(expansionStart)}%`,
                                }}
                            ></div>
                        )}

                        <div
                            className="absolute top-0 h-full w-0.5 bg-emerald-500"
                            style={{ left: `${getPosition(stats.expansionAvg)}%` }}
                        >
                            {/* 수치 제거 */}
                        </div>
                        <div
                            className="absolute top-0 h-full w-0.5 bg-rose-500"
                            style={{ left: `${getPosition(stats.recessionAvg)}%` }}
                        >
                            {/* 수치 제거 */}
                        </div>

                        <div
                            className="absolute top-0 h-full w-1 bg-amber-500"
                            style={{ left: `${getPosition(stats.current)}%` }}
                        >
                            <div className="absolute bottom-full mb-1 transform -translate-x-1/2 text-xs">
                                <div className="bg-gray-800 rounded-full p-0.5 shadow-lg">
                                    {getTrendIcon()}
                                </div>
                            </div>
                            <div className="absolute top-full mt-1 transform -translate-x-1/2 text-xs text-amber-500">
                                {formatValue(stats.current, true)}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-between mt-5 text-xs text-gray-400 px-3">
                        <span>{formatValue(stats.min, true)}</span>
                        <span>{formatValue(stats.max, true)}</span>
                    </div>
                </Card>
            </Tooltip>
        )
    }, [isNormalized, memoizedNormalizedData, data, setSelectedIndicator, isCompareMode, selectedIndicators, indicatorStats])

    const handleSelectIndicators = useCallback((indicatorKey) => {
        setSelectedIndicators(prev => {
            if (prev.includes(indicatorKey)) {
                return prev.filter(key => key !== indicatorKey);
            } else {
                return [...prev, indicatorKey];
            }
        });
    }, [])

    const toggleCycleIndicator = useCallback(() => {
        setUseKorCycle(prev => !prev)
    }, [])

    return (
        <div className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="bg-gray-900 p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                        <div className="flex items-center mb-2 sm:mb-0">
                            <span className="text-2xl mr-2" role="img" aria-label="chart increasing">
                                📊
                            </span>
                            <h3 className="text-xl font-semibold text-gray-100 mr-4">경제지표</h3>
                            <Button
                                onClick={() => setIsNormalized(!isNormalized)}
                                className="px-3 py-1 text-sm rounded bg-blue-600 hover:bg-blue-700 mr-2"
                            >
                                {isNormalized ? 'View Original' : 'View Norm.ver'}
                            </Button>
                            <Button
                                onClick={() => setIsCompareModalOpen(true)}
                                className="px-3 py-1 text-sm rounded bg-emerald-600 hover:bg-emerald-700 mr-2"
                            >
                                비교하기
                            </Button>
                            <Button
                                onClick={toggleCycleIndicator}
                                className="px-3 py-1 text-sm rounded bg-rose-600 hover:bg-rose-700 mr-2"
                            >
                                {useKorCycle ? '미국 경기 순환' : '한국 경기 순환'}
                            </Button>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="flex flex-wrap items-center text-xs text-gray-400 gap-3 mr-4">
                                <span className="flex items-center">
                                    <span className="w-3 h-3 bg-emerald-500 inline-block mr-1"></span>
                                    확장기 범위
                                </span>
                                <span className="flex items-center">
                                    <span className="w-3 h-3 bg-rose-500 inline-block mr-1"></span>
                                    침체기 범위
                                </span>
                                <span className="flex items-center">
                                    <span className="w-3 h-3 bg-gray-500 inline-block mr-1"></span>
                                    전체 범위
                                </span>
                                <span className="flex items-center">
                                    <ArrowRight className="text-yellow-500 w-4 h-4 mr-1" />
                                    1개월 추세
                                </span>
                                <span className="flex items-center">
                                    <span className="w-3 h-3 bg-yellow-500 inline-block mr-1"></span>
                                    현재 값
                                </span>
                            </div>
                            <div className="relative">
                                <Input
                                    type="text"
                                    placeholder="지표 검색..."
                                    className="bg-gray-800 text-white pl-8 pr-3 py-2 rounded-full text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-600"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                        {uniqueCategories.map(category => (
                            <Button
                                key={category}
                                onClick={() => {
                                    setSelectedCategory(category)
                                    setCurrentPage(1)
                                }}
                                className={`px-3 py-1 text-sm rounded ${
                                    category === '추천'
                                        ? selectedCategory === category
                                            ? 'bg-yellow-600 text-white'
                                            : 'bg-yellow-700 text-gray-200 hover:bg-yellow-600'
                                        : selectedCategory === category
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                            >
                                {category}
                            </Button>
                        ))}
                    </div>
                </CardHeader>
                <CardContent className="bg-gray-900 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {paginatedIndicators.map(renderIndicatorChart)}
                    </div>
                    <div className="flex justify-center items-center space-x-4 mt-6">
                        <Button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 rounded disabled:opacity-50"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-white">
                            {currentPage} / {pageCount}
                        </span>
                        <Button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount))}
                            disabled={currentPage === pageCount}
                            className="px-3 py-1 rounded disabled:opacity-50"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
            {selectedIndicator && !isCompareMode && (
                <TimeSeriesChart
                    data={isNormalized ? memoizedNormalizedData : data}
                    indicatorKey={selectedIndicator}
                    nberData={data.map((item) => ({
                        date: item.DATA_YMD,
                        isRecession: useKorCycle ? item.kor === 1 : item.economic_phase === 1,
                    }))}
                    onClose={() => setSelectedIndicator(null)}
                    isNormalized={isNormalized}
                    useKorCycle={useKorCycle}
                />
            )}
                {selectedIndicators.length > 0 && (
                    <CompareChart
                        data={data}
                        selectedIndicators={selectedIndicators}
                        nberData={data.map((item) => ({
                            date: item.DATA_YMD,
                            isRecession: useKorCycle ? item.kor === 1 : item.economic_phase === 1,
                        }))}
                        onClose={() => setSelectedIndicators([])}
                        isNormalized={isNormalized}
                        useKorCycle={useKorCycle}
                    />
                )}
                
            <CompareModal
                isOpen={isCompareModalOpen}
                onClose={() => setIsCompareModalOpen(false)}
                onSelectIndicators={handleSelectIndicators}
                selectedIndicators={selectedIndicators}
            />
        </div>
    )
})

export default EconomicIndicators
