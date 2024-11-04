import React, { useEffect, useState, useMemo } from 'react'
import { Line } from 'react-chartjs-2'
import { Card, CardHeader, CardContent } from '../../../components/Card.js'
import { indicatorNames, indicatorColors } from '../../../helpers/indicators.js'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale,
    registerables,
} from 'chart.js'
import 'chartjs-adapter-date-fns'
import annotationPlugin from 'chartjs-plugin-annotation'
import { format, parseISO, isEqual, subYears } from 'date-fns'
import { ko } from 'date-fns/locale'
import { winsorizeData } from '../../../helpers/dataprocessing.js'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale,
    annotationPlugin,
    ...registerables,
)


// 기존의 TimeSeriesChart 컴포넌트
const TimeSeriesChart = ({ data, indicatorKey, nberData, onClose, isNormalized }) => {
    const [chartInstance, setChartInstance] = useState(null)
    const [showTrimmed, setShowTrimmed] = useState(false)
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [dateRangeType, setDateRangeType] = useState('all')

    useEffect(() => {
        return () => {
            if (chartInstance) {
                chartInstance.destroy()
            }
        }
    }, [chartInstance])

    const handleChartRef = (ref) => {
        if (ref) {
            setChartInstance(ref.chartInstance)
        }
    }

    // 필터링된 데이터 계산
    const filteredData = useMemo(() => {
        return data.filter(item => {
            const itemDate = new Date(item.DATA_YMD)
            const start = startDate ? new Date(startDate) : new Date(0)
            const end = endDate ? new Date(endDate) : new Date()
            return itemDate >= start && itemDate <= end
        })
    }, [data, startDate, endDate])

    // validData를 filteredData 기반으로 수정
    const validData = useMemo(() => {
        return filteredData
            .filter((item) => item[indicatorKey] !== undefined && item[indicatorKey] !== null)
            .sort((a, b) => new Date(a.DATA_YMD) - new Date(b.DATA_YMD))
    }, [filteredData, indicatorKey])

    // trimmedData도 filteredData 기반으로 계산
    const trimmedData = useMemo(() => winsorizeData(validData, indicatorKey), [validData, indicatorKey])

    const values = validData.map(item => parseFloat(item[indicatorKey]))
    const min = Math.min(...values)
    const max = Math.max(...values)
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length
    const std = Math.sqrt(values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length)
    const upperBound = mean + 3 * std
    const lowerBound = mean - 3 * std

    const normalizeValue = (value) => (value - min) / (max - min)

    const chartData = {
        labels: validData.map((item) => item.DATA_YMD),
        datasets: [
            {
                label: `${indicatorNames[indicatorKey]} (이상치 제거)`,
                data: trimmedData.map((item) => ({
                    x: item.DATA_YMD,
                    y: isNormalized ? normalizeValue(item[`${indicatorKey}_winsorized`]) : item[`${indicatorKey}_winsorized`]
                })),
                borderColor: 'rgb(255, 165, 0)',
                backgroundColor: 'rgba(255, 165, 0, 0.5)',
                borderWidth: 2, // 선 두께를 1로 설정
                tension: 0.1,
                pointRadius: 1, // 점 크기를 1로 줄임
                pointHoverRadius: 5, // 호버 시 점 크기를 3으로 줄임
                pointStyle: 'circle', // 점 스타일을 원으로 변경
                hidden: !showTrimmed,
            },
            {
                label: `${indicatorNames[indicatorKey]} (원본)`,
                data: validData.map((item) => isNormalized ? normalizeValue(parseFloat(item[indicatorKey])) : parseFloat(item[indicatorKey])),
                borderColor: 'rgb(135, 206, 235)',
                backgroundColor: 'rgba(135, 206, 235, 0.5)',
                borderWidth: 2, // 선 두께를 1로 설정
                pointRadius: 0, // 점 크기를 1로 줄임
                pointHoverRadius: 5, // 호버 시 점 크기를 3으로 줄임
                pointStyle: 'circle', // 점 스타일을 원으로 변
            },
            {
                label: '평균',
                data: validData.map(() => isNormalized ? normalizeValue(mean) : mean),
                borderColor: 'rgb(255, 0, 0)',
                borderWidth: 2,
                borderDash: [5, 5],
                pointRadius: 0,
                fill: false,
            },
            {
                label: '상한 (평균 + 3*표준편차)',
                data: validData.map(() => isNormalized ? normalizeValue(upperBound) : upperBound),
                borderColor: 'rgb(0, 128, 0)',
                borderWidth: 2,
                borderDash: [5, 5],
                pointRadius: 0,
                fill: false,
            },
            {
                label: '하한 (평균 - 3*표준편차)',
                data: validData.map(() => isNormalized ? normalizeValue(lowerBound) : lowerBound),
                borderColor: 'rgb(0, 128, 0)',
                borderWidth: 2,
                borderDash: [5, 5],
                pointRadius: 0,
                fill: false,
            },
        ],
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                onClick: (e, legendItem, legend) => {
                    const index = legendItem.datasetIndex
                    const ci = legend.chart
                    if (ci.isDatasetVisible(index)) {
                        ci.hide(index)
                        legendItem.hidden = false
                    } else {
                        ci.show(index)
                        legendItem.hidden = true
                    }
                    setShowTrimmed(ci.isDatasetVisible(1))
                },
                labels: {
                    color: 'rgb(156, 163, 175)', // 범례 텍스트 색상을 회색으로 변경 (Tailwind의 gray-400에 해당)
                    usePointStyle: true,
                    pointStyle: 'rectRounded',
                    font: {
                        size: 12 // 폰트 크기 조정 (필요에 따라)
                    },
                    boxWidth: 15, // 범례 아이콘의 너비
                    boxHeight: 15, // 범례 아이콘의 높이
                },
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    title: (context) => {
                        const date = new Date(context[0].parsed.x)
                        return format(date, 'yyyy-MM-dd', { locale: ko })
                    },
                    label: (context) => {
                        let label = context.dataset.label || ''
                        if (label) {
                            label += ': '
                        }
                        if (context.parsed.y !== null) {
                            label += context.parsed.y.toFixed(2)
                        }
                        return label
                    },
                    afterBody: (context) => {
                        const date = new Date(context[0].parsed.x)
                        const formattedDate = format(date, 'yyyy-MM-dd')
                        const nberItem = nberData.find((item) => isEqual(parseISO(item.date), parseISO(formattedDate)))
                        if (nberItem && nberItem.isRecession) {
                            return '🟥 경기 침체 기간' // 빨간색 네모 이모지 사용
                        }
                        return ''
                    },
                },
            },
            annotation: {
                annotations: nberData.reduce((acc, item, index, array) => {
                    if (item.isRecession && (!array[index - 1] || !array[index - 1].isRecession)) {
                        const endDate =
                            array.slice(index).find((i) => !i.isRecession)?.date || array[array.length - 1].date
                        acc.push({
                            type: 'box',
                            xMin: item.date,
                            xMax: endDate,
                            backgroundColor: 'rgba(255, 0, 0, 0.1)',
                            borderColor: 'rgba(255, 0, 0, 0.3)',
                            drawTime: 'beforeDatasetsDraw',
                        })
                    }
                    return acc
                }, []),
            },
        },
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'month',
                    displayFormats: {
                        month: 'yyyy-MM',
                    },
                },
                grid: {
                    display: false,  // x축 격자 선 제거
                },
                ticks: {
                    color: 'rgb(156, 163, 175)',
                    font: {
                        size: 11
                    }
                },
                title: {
                    display: true,
                    text: '날짜',
                    color: 'rgb(156, 163, 175)',
                },
                min: startDate || undefined,
                max: endDate || undefined,
            },
            y: {
                title: {
                    display: true,
                    text: isNormalized ? '정규화된 값' : '값',
                },
                beginAtZero: isNormalized,
                min: isNormalized ? 0 : undefined,
                max: isNormalized ? 1 : undefined,
                grid: {
                    display: false,
                },
            },
        },
    }

    const handleDateRangeChange = (rangeType) => {
        setDateRangeType(rangeType)
        const now = new Date()
        
        switch (rangeType) {
            case '1y':
                setStartDate(format(subYears(now, 1), 'yyyy-MM-dd'))
                setEndDate(format(now, 'yyyy-MM-dd'))
                break
            case '3y':
                setStartDate(format(subYears(now, 3), 'yyyy-MM-dd'))
                setEndDate(format(now, 'yyyy-MM-dd'))
                break
            case '5y':
                setStartDate(format(subYears(now, 5), 'yyyy-MM-dd'))
                setEndDate(format(now, 'yyyy-MM-dd'))
                break
            case '10y':
                setStartDate(format(subYears(now, 10), 'yyyy-MM-dd'))
                setEndDate(format(now, 'yyyy-MM-dd'))
                break
            case 'all':
                setStartDate('')
                setEndDate('')
                break
            case 'custom':
                // custom인 경우 현재 선택된 날짜 유지
                break
            default:
                // 알 수 없는 타입인 경우 전체 기간으로 설정
                setDateRangeType('all')
                setStartDate('')
                setEndDate('')
                break
        }
    }

    const resetDateRange = () => {
        setDateRangeType('all')
        setStartDate('')
        setEndDate('')
    }

    return (
        <Card className="fixed inset-0 z-50 bg-gray-900 bg-opacity-75 flex items-center justify-center">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-4xl">
                <CardHeader className="flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold text-white">
                            {indicatorNames[indicatorKey]} 시계열 그래프
                        </h3>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setShowTrimmed(!showTrimmed)}
                                className="text-sm text-gray-400 hover:text-white"
                            >
                                {showTrimmed ? '이상치 제거 숨기기' : '이상치 제거 보기'}
                            </button>
                            <button onClick={onClose} className="text-sm text-gray-400 hover:text-white">
                                닫기
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <select 
                            value={dateRangeType}
                            onChange={(e) => handleDateRangeChange(e.target.value)}
                            className="bg-gray-700 text-white px-2 py-1 rounded text-sm"
                        >
                            <option value="custom">직접 선택</option>
                            <option value="1y">최근 1년</option>
                            <option value="3y">최근 3년</option>
                            <option value="5y">최근 5년</option>
                            <option value="10y">최근 10년</option>
                            <option value="all">전체 기간</option>
                        </select>
                        {dateRangeType === 'custom' && (
                            <>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="bg-gray-700 text-white px-2 py-1 rounded text-sm"
                                />
                                <span className="text-white text-sm">~</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="bg-gray-700 text-white px-2 py-1 rounded text-sm"
                                />
                            </>
                        )}
                        <button
                            onClick={resetDateRange}
                            className="text-sm text-gray-400 hover:text-white px-2 py-1"
                        >
                            초기화
                        </button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div style={{ 
                        height: '400px', 
                        backgroundColor: 'rgb(17, 24, 39)',  // 배경색 추가
                        borderRadius: '0.5rem',              // 모서리 둥글게
                        padding: '1rem'                      // 패딩 추가
                    }}>
                        <Line data={chartData} options={options} ref={handleChartRef} />
                    </div>
                </CardContent>
            </div>
        </Card>
    )
}

// 새로운 CompareChart 컴포넌트
const CompareChart = ({ data, selectedIndicators, nberData, onClose }) => {
    const [isNormalized, setIsNormalized] = useState(false)
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [dateRangeType, setDateRangeType] = useState('all')

    // 필터링된 데이터 계산
    const filteredData = useMemo(() => {
        return data.filter(item => {
            const itemDate = new Date(item.DATA_YMD)
            const start = startDate ? new Date(startDate) : new Date(0)
            const end = endDate ? new Date(endDate) : new Date()
            return itemDate >= start && itemDate <= end
        })
    }, [data, startDate, endDate])

    // 차트 데이터 생성
    const chartData = useMemo(() => ({
        labels: filteredData.map(item => item.DATA_YMD),
        datasets: selectedIndicators.map(indicator => ({
            label: indicatorNames[indicator],
            data: filteredData.map(item => ({
                x: item.DATA_YMD,
                y: isNormalized 
                    ? (item[indicator] - Math.min(...filteredData.map(d => d[indicator]))) / 
                      (Math.max(...filteredData.map(d => d[indicator])) - Math.min(...filteredData.map(d => d[indicator])))
                    : item[indicator]
            })),
            borderColor: indicatorColors[indicator],
            backgroundColor: `${indicatorColors[indicator]}50`,
            borderWidth: 2,
            tension: 0.1,
            pointRadius: 1,
            pointHoverRadius: 5,
        }))
    }), [filteredData, selectedIndicators, isNormalized])

    // 차트 옵션 설정
    const options = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'month',
                    displayFormats: {
                        month: 'yyyy-MM',
                    },
                },
                grid: {
                    display: false,
                },
                min: startDate || undefined,
                max: endDate || undefined,
                ticks: {
                    color: 'rgb(156, 163, 175)',
                    font: {
                        size: 11
                    }
                },
            },
            y: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
                ticks: {
                    color: 'rgb(156, 163, 175)',
                }
            }
        },
        plugins: {
            tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    title: (context) => {
                        const date = new Date(context[0].parsed.x)
                        return format(date, 'yyyy-MM-dd', { locale: ko })
                    },
                    label: function(context) {
                        const indicator = selectedIndicators[context.datasetIndex];
                        const value = context.parsed.y;
                        return `${indicatorNames[indicator]}: ${value.toFixed(4)}`;
                    },
                    afterBody: (context) => {
                        const date = new Date(context[0].parsed.x);
                        const formattedDate = format(date, 'yyyy-MM-dd');
                        const nberItem = nberData.find((item) => isEqual(parseISO(item.date), parseISO(formattedDate)));
                        if (nberItem && nberItem.isRecession) {
                            return '🟥 경기 침체 기간';
                        }
                        return '';
                    }
                }
            },
            legend: {
                position: 'top',
                labels: {
                    color: 'rgb(156, 163, 175)',
                    usePointStyle: true,
                    pointStyle: 'rectRounded',
                    font: {
                        size: 12
                    },
                    boxWidth: 15,
                    boxHeight: 15,
                    generateLabels: (chart) => {
                        const originalLabels = ChartJS.defaults.plugins.legend.labels.generateLabels(chart);
                        originalLabels.push({
                            text: '경기 침체 기간',
                            fillStyle: 'rgba(255, 0, 0, 0.1)',
                            strokeStyle: 'rgba(255, 0, 0, 0.5)',
                            lineWidth: 0.5,
                            hidden: false,
                            index: originalLabels.length,
                            pointStyle: 'rectRounded',
                        });
                        return originalLabels;
                    }
                },
                onClick: (e, legendItem, legend) => {
                    if (legendItem.text === '경기 침체 기간') return;
                    const index = legendItem.datasetIndex;
                    const ci = legend.chart;
                    if (ci.isDatasetVisible(index)) {
                        ci.hide(index);
                        legendItem.hidden = true;
                    } else {
                        ci.show(index);
                        legendItem.hidden = false;
                    }
                }
            },
            annotation: {   
                annotations: nberData.reduce((acc, item, index, array) => {
                    if (item.isRecession && (!array[index - 1] || !array[index - 1].isRecession)) {
                        const endDate =
                            array.slice(index).find((i) => !i.isRecession)?.date || array[array.length - 1].date
                        acc.push({
                            type: 'box',
                            xMin: item.date,
                            xMax: endDate,
                            backgroundColor: 'rgba(255, 0, 0, 0.1)',
                            borderColor: 'rgba(255, 0, 0, 0.5)',
                            borderWidth: 0.5,
                            drawTime: 'beforeDatasetsDraw',
                        })
                    }
                    return acc
                }, []),
            }
        }
    }), [startDate, endDate, nberData, selectedIndicators])

    const handleDateRangeChange = (rangeType) => {
        setDateRangeType(rangeType)
        const now = new Date()
        
        switch (rangeType) {
            case '1y':
                setStartDate(format(subYears(now, 1), 'yyyy-MM-dd'))
                setEndDate(format(now, 'yyyy-MM-dd'))
                break
            case '3y':
                setStartDate(format(subYears(now, 3), 'yyyy-MM-dd'))
                setEndDate(format(now, 'yyyy-MM-dd'))
                break
            case '5y':
                setStartDate(format(subYears(now, 5), 'yyyy-MM-dd'))
                setEndDate(format(now, 'yyyy-MM-dd'))
                break
            case '10y':
                setStartDate(format(subYears(now, 10), 'yyyy-MM-dd'))
                setEndDate(format(now, 'yyyy-MM-dd'))
                break
            case 'all':
                setStartDate('')
                setEndDate('')
                break
            case 'custom':
                break
            default:
                setDateRangeType('all')
                setStartDate('')
                setEndDate('')
                break
        }
    }

    const resetDateRange = () => {
        setDateRangeType('all')
        setStartDate('')
        setEndDate('')
    }

    return (
        <Card className="fixed inset-0 z-50 bg-gray-900 bg-opacity-75 flex items-center justify-center">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-4xl">
                <CardHeader className="flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold text-white">
                            지표 비교 그래프 {isNormalized ? '(정규화된 값)' : '(원래 값)'}
                        </h3>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsNormalized(!isNormalized)}
                                className="text-sm text-gray-400 hover:text-white"
                            >
                                {isNormalized ? '원래 값 보기' : '정규화된 값 보기'}
                            </button>
                            <button onClick={onClose} className="text-sm text-gray-400 hover:text-white">
                                닫기
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <select 
                            value={dateRangeType}
                            onChange={(e) => handleDateRangeChange(e.target.value)}
                            className="bg-gray-700 text-white px-2 py-1 rounded text-sm"
                        >
                            <option value="custom">직접 선택</option>
                            <option value="1y">최근 1년</option>
                            <option value="3y">최근 3년</option>
                            <option value="5y">최근 5년</option>
                            <option value="10y">최근 10년</option>
                            <option value="all">전체 기간</option>
                        </select>
                        {dateRangeType === 'custom' && (
                            <>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="bg-gray-700 text-white px-2 py-1 rounded text-sm"
                                />
                                <span className="text-white text-sm">~</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="bg-gray-700 text-white px-2 py-1 rounded text-sm"
                                />
                            </>
                        )}
                        <button
                            onClick={resetDateRange}
                            className="text-sm text-gray-400 hover:text-white px-2 py-1"
                        >
                            초기화
                        </button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div style={{ height: '400px', backgroundColor: 'rgb(17, 24, 39)', borderRadius: '0.5rem', padding: '1rem' }}>
                        {selectedIndicators.length > 0 ? (
                            <Line data={chartData} options={options} />
                        ) : (
                            <p className="text-center text-gray-400">데이터를 불러오는 중입니다...</p>
                        )}
                    </div>
                </CardContent>
            </div>
        </Card>
    )
}

// 두 컴포넌트를 함께 export
export { TimeSeriesChart, CompareChart }
