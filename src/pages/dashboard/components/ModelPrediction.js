import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardContent } from '../../../components/Card.js'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import Papa from 'papaparse'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

// 값에 따른 색상을 계산하는 함수 수정
const getColor = (val) => {
    if (val <= 0.05) return '#22c55e'  // 초록색
    if (val <= 0.10) return '#f97316'  // 주황색
    return '#ef4444'  // 빨간색
}

const EconomicIndicator = ({ value, predictionChange }) => {
    const changeColor = predictionChange > 0 ? '#22c55e' : '#ef4444'  // 증가면 빨간색, 감소면 초록색

    return (
        <div className="flex flex-col items-center">
            {/* 신호등 본체 - 가로 배치, 오른쪽 마진 제거 */}
            <div className="relative h-30 w-50 bg-gray-900/90 rounded-2xl p-2 flex flex-row gap-3
                 shadow-lg backdrop-blur-sm">
                {/* 초록불 구역 (0~5%) */}
                <div className="relative">
                    <div className={`h-14 w-14 rounded-full flex items-center justify-center backdrop-blur-sm
                        ${value <= 0.05
                            ? 'bg-green-500 ring-2 ring-green-400 shadow-[0_0_20px_rgba(34,197,94,0.7)] animate-pulse' 
                            : 'bg-green-900/30 ring-1 ring-green-800/50'}`}
                    >
                        <span className="text-[12px] text-gray-100">0%~5%</span>
                    </div>
                </div>
                
                {/* 주황불 구역 (5~10%) */}
                <div className="relative">
                    <div className={`h-14 w-14 rounded-full flex items-center justify-center backdrop-blur-sm
                        ${value > 0.05 && value <= 0.10
                            ? 'bg-orange-500 ring-2 ring-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.7)] animate-pulse'
                            : 'bg-orange-900/30 ring-1 ring-orange-800/50'}`}
                    >
                        <span className="text-[12px] text-gray-100">5%~10%</span>
                    </div>
                </div>
                
                {/* 빨간불 구역 (10~100%) */}
                <div className="relative">
                    <div className={`h-14 w-14 rounded-full flex items-center justify-center backdrop-blur-sm
                        ${value > 0.10 
                            ? 'bg-red-500 ring-2 ring-red-400 shadow-[0_0_20px_rgba(239,68,68,0.7)] animate-pulse' 
                            : 'bg-red-900/30 ring-1 ring-red-800/50'}`}
                    >
                        <span className="text-[11px] text-gray-100">10%~100%</span>
                    </div>
                </div>
            </div>

            {/* 현재 값 표시 */}
            <div className="mt-4 flex flex-col items-center">
                <div className="text-base font-semibold">현재 경기침체 확률</div>
                <div className="text-2xl font-bold mt-1" style={{ color: getColor(value) }}>
                    {(value * 100).toFixed(2)}%
                </div>
                <div className="text-sm mt-2" style={{ color: changeColor }}>
                    {predictionChange > 0 ? '▲' : '▼'} {Math.abs(predictionChange * 100).toFixed(2)}% 전월 대비
                </div>
                <div className="text-xs text-gray-400/90 mt-1">
                    최종 업데이트: {new Date().toLocaleDateString()}
                </div>
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
                <h3 className="text-base font-semibold mb-1">📋 미국 경기침체 예측</h3>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col lg:flex-row items-stretch">
                    <div className="lg:w-1/3 mb-2 lg:mb-0">
                        <div className="h-full flex flex-col justify-center">
                            <EconomicIndicator 
                                value={currentPrediction} 
                                predictionChange={predictionChange}
                            />
                        </div>
                    </div>
                    <div className="lg:w-2/3 h-72">
                        <Line data={chartData} options={options} />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default ModelPrediction
