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
                <div className="relative group">
                    <div className={`h-14 w-14 rounded-full flex items-center justify-center backdrop-blur-sm cursor-help
                        ${value <= 0.05
                            ? 'bg-green-500 ring-2 ring-green-400 shadow-[0_0_20px_rgba(34,197,94,0.7)] animate-pulse' 
                            : 'bg-green-900/30 ring-1 ring-green-800/50'}`}
                    >
                        <span className="text-[12px] text-gray-100">0%~5%</span>
                    </div>
                    {/* 초록불 툴팁 */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="bg-gray-900 text-gray-100 text-sm rounded-lg p-4 shadow-xl border border-green-500/30">
                            <h4 className="font-bold text-green-400 mb-2">경기 확장기</h4>
                            <p className="text-xs leading-relaxed">
                                경제가 안정적으로 성장하는 시기입니다. 기업들의 실적이 양호하고, 
                                고용시장이 안정적이며, 소비자 신뢰도가 높은 특징을 보입니다.
                            </p>
                        </div>
                        <div className="border-t-8 border-x-8 border-transparent border-t-gray-900 
                            w-0 h-0 absolute left-1/2 transform -translate-x-1/2"></div>
                    </div>
                </div>
                
                {/* 주황불 구역 (5~10%) */}
                <div className="relative group">
                    <div className={`h-14 w-14 rounded-full flex items-center justify-center backdrop-blur-sm cursor-help
                        ${value > 0.05 && value <= 0.10
                            ? 'bg-orange-500 ring-2 ring-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.7)] animate-pulse'
                            : 'bg-orange-900/30 ring-1 ring-orange-800/50'}`}
                    >
                        <span className="text-[12px] text-gray-100">5%~10%</span>
                    </div>
                    {/* 주황불 툴팁 */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="bg-gray-900 text-gray-100 text-sm rounded-lg p-4 shadow-xl border border-orange-500/30">
                            <h4 className="font-bold text-orange-400 mb-2">경기 과도기</h4>
                            <p className="text-xs leading-relaxed">
                                경제 성장세가 둔화되는 시기입니다. 기업 실적과 경제지표들이 
                                혼조세를 보이며, 시장의 불확실성이 증가하는 특징이 있습니다.
                            </p>
                        </div>
                        <div className="border-t-8 border-x-8 border-transparent border-t-gray-900 
                            w-0 h-0 absolute left-1/2 transform -translate-x-1/2"></div>
                    </div>
                </div>
                
                {/* 빨간불 구역 (10~100%) */}
                <div className="relative group">
                    <div className={`h-14 w-14 rounded-full flex items-center justify-center backdrop-blur-sm cursor-help
                        ${value > 0.10 
                            ? 'bg-red-500 ring-2 ring-red-400 shadow-[0_0_20px_rgba(239,68,68,0.7)] animate-pulse' 
                            : 'bg-red-900/30 ring-1 ring-red-800/50'}`}
                    >
                        <span className="text-[11px] text-gray-100">10%~100%</span>
                    </div>
                    {/* 빨간불 툴팁 */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="bg-gray-900 text-gray-100 text-sm rounded-lg p-4 shadow-xl border border-red-500/30">
                            <h4 className="font-bold text-red-400 mb-2">경기 침체기</h4>
                            <p className="text-xs leading-relaxed">
                                경제 활동이 전반적으로 위축되는 시기입니다. 기업 실적이 감소하고,
                                고용시장이 약화되며, 전반적인 경제 지표들이 하락하는 모습을 보입니다.
                            </p>
                        </div>
                        <div className="border-t-8 border-x-8 border-transparent border-t-gray-900 
                            w-0 h-0 absolute left-1/2 transform -translate-x-1/2"></div>
                    </div>
                </div>
            </div>

            {/* 현재 값 표시 */}
            <div className="mt-4 flex flex-col items-center">
                <div className="text-base">현재 경기침체 확률</div>
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
                <h3 className="text-xl font-semibold mb-1">📋 미국 경기침체 예측</h3>
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
