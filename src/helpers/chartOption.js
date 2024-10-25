import { format, parseISO, isEqual } from 'date-fns'
import { ChartJS } from 'chart.js'

export const createChartOptions = (isNormalized, selectedIndicators, nberData, indicatorNames) => ({
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
            title: {
                display: true,
                text: '날짜',
            },
        },
        y: {
            title: {
                display: true,
                text: isNormalized ? '정규화된 값' : '원래 값',
            },
            min: isNormalized ? 0 : undefined,
            max: isNormalized ? 1 : undefined,
        },
    },
    plugins: {
        tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
                title: function(tooltipItems) {
                    return format(new Date(tooltipItems[0].parsed.x), 'yyyy-MM-dd');
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
            display: true,
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
        },
    },
})
