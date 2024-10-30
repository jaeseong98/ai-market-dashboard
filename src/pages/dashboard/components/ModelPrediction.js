import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardContent } from '../../../components/Card.js'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import Papa from 'papaparse'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

// 값에 따른 색상을 계산하는 함수를 컴포넌트 외부로 이동
const getColor = (val) => {
    if (val <= 0.05) return '#22c55e'
    if (val <= 0.10) return '#4ade80'
    if (val <= 0.15) return '#fbbf24'
    if (val <= 0.20) return '#f87171'
    return '#ef4444'
}

const EconomicIndicator = ({ value }) => {
    const indicatorPosition = 100 - value * 100
    const textColor = getColor(value)

    return (
        <div className="flex items-center">
            <div className="relative w-4 h-64">
                <div 
                    className="absolute inset-0"
                    style={{
                        background: `linear-gradient(to top, 
                            #22c55e 0%, 
                            #4ade80 20%, 
                            #fbbf24 40%, 
                            #f87171 60%, 
                            #ef4444 80%, 
                            #ef4444 100%)`
                    }}
                ></div>
                <div 
                    className="absolute left-0 w-full h-1 bg-yellow-400"
                    style={{ bottom: `${value * 100}%` }}
                ></div>
                <div 
                    className="absolute left-full transform -translate-y-1/2 ml-2"
                    style={{ top: `${indicatorPosition}%` }}
                >
                    <div 
                        className="relative bg-gray-700 text-sm px-2 py-1 rounded"
                        style={{ color: textColor }}
                    >
                        <div 
                            className="absolute w-0 h-0 border-t-[6px] border-b-[6px] border-r-[6px] border-transparent border-r-gray-700"
                            style={{
                                left: '-6px',
                                top: '50%',
                                transform: 'translateY(-50%)'
                            }}
                        ></div>
                        {(value * 100).toFixed(2)}%
                    </div>
                </div>
                <div className="absolute -left-10 top-0 text-sm text-white">100%</div>
                <div className="absolute -left-7 bottom-0 text-sm text-white">0%</div>
            </div>
        </div>
    )
}

const ModelPrediction = () => {
    const [data, setData] = useState([])

    useEffect(() => {
        // public 폴더의 CSV 파일 직접 접근
        Papa.parse(process.env.PUBLIC_URL + '/lgb_result2.csv', {
            download: true,
            header: true,
            complete: (results) => {
                const filteredData = results.data
                    .filter(item => item.DATE_YMD && new Date(item.DATE_YMD) >= new Date('1990-01-01'))
                    .sort((a, b) => new Date(a.DATE_YMD) - new Date(b.DATE_YMD));
                setData(filteredData);
            },
            error: (error) => {
                console.error('Error parsing CSV:', error);
            }
        });
    }, []);

    if (data.length === 0) {
        return <div>Loading...</div>
    }

    const currentPrediction = parseFloat(data[data.length - 1].predicted_prob)
    const previousPrediction = parseFloat(data[data.length - 2].predicted_prob)
    const predictionChange = currentPrediction - previousPrediction
    const changeColor = getColor(Math.abs(predictionChange))

    const chartData = {
        labels: data.map(item => item.DATE_YMD),
        datasets: [
            {
                label: '실제 미국 경기침체',
                data: data.map(item => parseInt(item.actual)),
                type: 'bar',
                borderColor: 'rgb(50, 20, 171, 1)',
                backgroundColor: 'rgba(50, 20, 171, 1)',

                borderWidth: 1,
                yAxisID: 'y-axis-1',
            },
            {
                label: '미국 경기침체 예측 확률',
                data: data.map(item => parseFloat(item.predicted_prob)),
                type: 'line',
                backgroundColor: 'rgba(255, 165, 0, 1)', // 진한 주황색
                borderColor: 'rgba(255, 140, 0, 1)', // 진한 주황색 테두리
                tension: 0.1,
                pointRadius: 0,
                yAxisID: 'y-axis-1',
            }
        ]
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'year',
                    displayFormats: {
                        year: 'yyyy'
                    },
                    tooltipFormat: 'yyyy-MM-dd'  // 툴팁 날짜 형식 추가
                },
                ticks: {
                    color: 'rgb(156, 163, 175)',
                },
                grid: {
                    color: 'rgba(75, 85, 99, 0.3)',
                },
            },
            'y-axis-1': {
                type: 'linear',
                display: true,
                position: 'left',
                ticks: {
                    max: 1,
                    min: 0,
                    stepSize: 0.2,
                    color: 'rgb(156, 163, 175)',
                },
                grid: {
                    color: 'rgba(75, 85, 99, 0.3)',
                },
            },
        },
        plugins: {
            legend: {
                display: true,
                labels: {
                    color: 'rgb(156, 163, 175)',
                },
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    title: function(context) {
                        // 툴팁 제목(날짜)을 'YYYY-MM-DD' 형식으로 변경
                        return new Date(context[0].parsed.x).toISOString().split('T')[0];
                    }
                }
            },
        },
    }

    return (
        <Card className="bg-gray-800 text-white">
            <CardHeader>
                <h3 className="text-xl font-semibold mb-4 ml-2">📋 미국 경기침체 예측</h3>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col lg:flex-row items-stretch">
                    <div className="lg:w-1/3 mb-4 lg:mb-0 mr-6">
                        <div className="p-6 h-full flex flex-col justify-between">
                            <div className="flex items-center">
                                <div className="ml-8">
                                    <EconomicIndicator value={currentPrediction} />
                                </div>
                                <div className="ml-20 flex flex-col">
                                    <div className="text-xl font-semibold mb-2">현재 경기침체 확률</div>
                                    <div className="text-5xl font-bold" style={{ color: getColor(currentPrediction) }}>
                                        {(currentPrediction * 100).toFixed(2)}%
                                    </div>
                                    <div className="text-lg mt-4" style={{ color: changeColor }}>
                                        {predictionChange > 0 ? '▲' : '▼'} {Math.abs(predictionChange * 100).toFixed(2)}% 전월 대비
                                    </div>
                                    <div className="text-sm text-gray-400 mt-4">
                                        최종 업데이트: {new Date().toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="lg:w-2/3 h-80">
                        <Line data={chartData} options={options} />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default ModelPrediction
