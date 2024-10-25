import { useState } from 'react';
import { Card, CardHeader, CardContent } from '../../../components/Card.js';
import { Tooltip } from '../../../helpers/Tooltip.js';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

const FearGreedIndex = ({ value, timeSeriesData = [] }) => {
    const [showTimeSeries, setShowTimeSeries] = useState(false);
    
    // 가장 최신 데이터 사용
    const latestData = timeSeriesData.length > 0 ? timeSeriesData[0] : null;
    const intValue = latestData ? Math.round(latestData.fear_greed) : null;
    const angle = intValue !== null ? (intValue / 100) * 180 - 180 : -180;

    const calculateNeedlePath = (angle) => {
        const length = 70;
        const widthStart = 4;
        const x1 = 110;
        const y1 = 100;
        const x2 = x1 + length * Math.cos((angle * Math.PI) / 180);
        const y2 = y1 + length * Math.sin((angle * Math.PI) / 180);
        const dx = ((y2 - y1) * widthStart) / (2 * length);
        const dy = ((x1 - x2) * widthStart) / (2 * length);

        return `M${x1 - dx},${y1 - dy} L${x1 + dx},${y1 + dy} L${x2},${y2} Z`;
    };

    const tooltipContent = (
        <div className="bg-gray-800 p-2 rounded-lg shadow-lg">
            <p className="text-sm text-gray-400">현재 값</p>
            <p className="text-lg font-bold text-amber-500">{intValue !== null ? intValue : 'N/A'}</p>
        </div>
    );

    const sortedTimeSeriesData = Array.isArray(timeSeriesData) 
        ? [...timeSeriesData].sort((a, b) => new Date(a.date) - new Date(b.date))
        : [];

    const chartData = {
        labels: sortedTimeSeriesData.map(item => item.date),
        datasets: [
            {
                label: 'Fear & Greed Index',
                data: sortedTimeSeriesData.map(item => Math.round(item.fear_greed)),
                borderColor: 'rgb(255, 165, 0, 1)',
                backgroundColor: 'rgba(255, 165, 0, 1)',
                tension: 0.1,
                pointRadius: 1,
                pointHoverRadius: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                onClick: null, // 범례 클릭 이벤트 비활성화
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
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += Math.round(context.parsed.y);
                        }
                        const dataIndex = context.dataIndex;
                        const rating = sortedTimeSeriesData[dataIndex].fear_greed_rating;
                        if (rating) {
                            label += ` (${rating})`;
                        }
                        return label;
                    }
                }
            },
        },
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: '날짜'
                }
            },
            y: {
                display: true,
                title: {
                    display: true,
                    text: 'Fear & Greed Index'
                },
                suggestedMin: 0,
                suggestedMax: 100,
                ticks: {
                    callback: function(value) {
                        return Math.round(value);
                    }
                }
            }
        }
    };

    return (
        <>
            <Card className="h-full flex flex-col">
                <CardHeader>
                    <h3 className="text-base font-semibold text-white">공포 & 탐욕 지수</h3>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-center">
                    <Tooltip content={tooltipContent}>
                        <div className="relative cursor-pointer" onClick={() => setShowTimeSeries(true)}>
                            <svg viewBox="0 0 220 120" className="w-full h-auto">
                                <defs>
                                    <linearGradient id="gauge-gradient" x1="0" x2="1" y1="0" y2="0">
                                        <stop offset="0%" stopColor="#FF4136" />
                                        <stop offset="25%" stopColor="#FF851B" />
                                        <stop offset="50%" stopColor="#FFDC00" />
                                        <stop offset="75%" stopColor="#2ECC40" />
                                        <stop offset="100%" stopColor="#1F8A70" />
                                    </linearGradient>
                                </defs>
                                <path
                                    d="M20 100 A 80 80 0 0 1 200 100"
                                    fill="none"
                                    stroke="url(#gauge-gradient)"
                                    strokeWidth="5"
                                    strokeLinecap="round"
                                />
                                <path
                                    d={calculateNeedlePath(angle)}
                                    fill="rgba(255, 255, 255, 0.8)"
                                    stroke="rgba(255, 255, 255, 0.6)"
                                    strokeWidth="1"
                                />
                                <circle cx="110" cy="100" r="6" fill="white" />
                                <text x="30" y="115" fill="#FF4136" fontSize="10" textAnchor="middle">
                                    Extreme Fear
                                </text>
                                <text x="55" y="65" fill="#FF851B" fontSize="10" textAnchor="middle">
                                    Fear
                                </text>
                                <text x="110" y="30" fill="#FFDC00" fontSize="10" textAnchor="middle">
                                    Neutral
                                </text>
                                <text x="165" y="65" fill="#2ECC40" fontSize="10" textAnchor="middle">
                                    Greed
                                </text>
                                <text x="185" y="115" fill="#1F8A70" fontSize="10" textAnchor="middle">
                                    Extreme Greed
                                </text>
                            </svg>
                        </div>
                    </Tooltip>
                    <div className="text-center mt-2">
                        <span className="text-3xl font-bold text-[#39d0b3]">{intValue !== null ? intValue : 'N/A'}</span>
                    </div>
                </CardContent>
            </Card>
            {showTimeSeries && (
                <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-75 flex items-center justify-center">
                    <div className="bg-gray-800 p-6 rounded-lg w-full max-w-4xl">
                        <CardHeader className="flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-white">Fear & Greed Index 시계열 그래프</h3>
                            <button onClick={() => setShowTimeSeries(false)} className="text-gray-400 hover:text-white">
                                닫기
                            </button>
                        </CardHeader>
                        <CardContent>
                            <div style={{ height: '400px' }}>
                                <Line data={chartData} options={chartOptions} />
                            </div>
                        </CardContent>
                    </div>
                </div>
            )}
        </>
    );
};

export default FearGreedIndex;
