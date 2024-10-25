export const combineData = (actualData, forecastData) => {
    const sortedActualData = [...actualData].sort((a, b) => new Date(b.DATA_YMD) - new Date(a.DATA_YMD))
    const recentActualData = sortedActualData.slice(0, 12).reverse()
    const combined = [...recentActualData]

    const lastActualDate = new Date(recentActualData[recentActualData.length - 1].DATA_YMD)
    const lastActualValue = recentActualData[recentActualData.length - 1]

    // 실제 데이터의 마지막 값을 예측 데이터의 첫 번째 값으로 사용
    const firstForecastData = { ...lastActualValue }
    Object.keys(firstForecastData).forEach((key) => {
        if (!key.endsWith('_forecast')) {
            firstForecastData[`${key}_forecast`] = firstForecastData[key]
        }
    })
    firstForecastData.isForecast = true
    combined.push(firstForecastData)

    // 나머지 예측 데이터 추가
    forecastData.forEach((item, index) => {
        const forecastDate = new Date(lastActualDate)
        forecastDate.setMonth(forecastDate.getMonth() + (index + 1))
        combined.push({
            ...item,
            DATA_YMD: forecastDate.toISOString().split('T')[0],
            isForecast: true,
        })
    })

    return combined
}

export const calculateStatistics = (data, key, useKorCycle = false) => {
    const validData = data
        .filter((item) => !isNaN(item[key]) && item[key] !== null)
        .map((item) => ({ 
            value: parseFloat(item[key]), 
            date: new Date(item.DATA_YMD),
            economic_phase: useKorCycle ? item.kor : item.economic_phase
        }))
        .sort((a, b) => b.date - a.date)

    if (validData.length === 0) return null

    const current = validData[0].value

    const calculateChange = (current, previous) => {
        if (previous === undefined || previous === null || previous === 0) return null;
        return ((current - previous) / Math.abs(previous)) * 100;
    };

    const oneMonthChange = validData.length > 1 ? calculateChange(current, validData[1].value) : null;
    const threeMonthChange = validData.length > 3 ? calculateChange(current, validData[3].value) : null;
    const sixMonthChange = validData.length > 6 ? calculateChange(current, validData[6].value) : null;

    const expansionData = validData.filter(item => item.economic_phase === 0).map(item => item.value);
    const recessionData = validData.filter(item => item.economic_phase === 1).map(item => item.value);

    const expansionAvg = expansionData.reduce((sum, value) => sum + value, 0) / expansionData.length
    const recessionAvg = recessionData.reduce((sum, value) => sum + value, 0) / recessionData.length
    
    const expansionStdDev = Math.sqrt(expansionData.reduce((acc, val) => acc + Math.pow(val - expansionAvg, 2), 0) / expansionData.length)
    const recessionStdDev = Math.sqrt(recessionData.reduce((acc, val) => acc + Math.pow(val - recessionAvg, 2), 0) / recessionData.length)

    const min = Math.min(...validData.map(item => item.value))
    const max = Math.max(...validData.map(item => item.value))

    return {
        min,
        max,
        current,
        oneMonthChange,
        threeMonthChange,
        sixMonthChange,
        previousMonth: validData.length > 1 ? validData[1].value : null,
        threeMonthsAgo: validData.length > 3 ? validData[3].value : null,
        sixMonthsAgo: validData.length > 6 ? validData[6].value : null,
        expansionAvg,
        recessionAvg,
        expansionStdDev,
        recessionStdDev,
        expansionMin: Math.min(...expansionData),
        expansionMax: Math.max(...expansionData),
        recessionMin: Math.min(...recessionData),
        recessionMax: Math.max(...recessionData)
    }
}


export const formatValue = (value, useThousandsSeparator = false) => {
    if (value === undefined || value === null) return 'N/A'
    
    const fixedValue = Number(value).toFixed(2)
    
    if (useThousandsSeparator) {
        return Number(fixedValue).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })
    }
    
    return fixedValue
}

export const calculateTrend = (data, key) => {
    const validData = data
        .filter((item) => !isNaN(item[key]) && item[key] !== null)
        .map((item) => ({
            value: parseFloat(item[key]),
            date: new Date(item.DATA_YMD)
        }))
        .sort((a, b) => b.date - a.date)  // 날짜 내림차순 정렬

    if (validData.length < 2) return 'neutral'

    const current = validData[0].value
    const previous = validData[1].value
    
    const change = ((current - previous) / Math.abs(previous)) * 100

    if (change > 0) return 'up'
    if (change < 0) return 'down'
    return 'neutral'
}

export const minMaxScaling = (data, key) => {
    const stats = calculateStatistics(data, key)
    const min = stats.min
    const max = stats.max
    return data.map((item) => {
        let scaledValue = isNaN(parseFloat(item[key])) 
            ? item[key] 
            : (parseFloat(item[key]) - min) / (max - min)
        
        // -0.00을 포함한 아주 작은 음수 값을 0.00으로 처리
        if (scaledValue < 0 && scaledValue > -0.009) {
            scaledValue = 0
        }
        
        return scaledValue
    })
}

export const normalizeData = (data) => {
    const keys = Object.keys(data[0]).filter(key => 
        key !== 'DATA_YMD' && key !== 'kor' && key !== 'economic_phase'
    )

    const normalizedData = data.map(item => {
        const normalizedItem = { ...item }
        keys.forEach(key => {
            normalizedItem[key] = null // 초기화
        })
        return normalizedItem
    })

    keys.forEach(key => {
        const scaledValues = minMaxScaling(data, key)
        scaledValues.forEach((value, index) => {
            normalizedData[index][key] = value
        })
    })

    return normalizedData
}

export const winsorizeData = (data, key, zScoreThreshold = 3) => {
    const values = data.map(item => parseFloat(item[key])).filter(value => !isNaN(value));
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const std = Math.sqrt(values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length);

    const upperBound = mean + zScoreThreshold * std;
    const lowerBound = mean - zScoreThreshold * std;

    return data.map(item => {
        const value = parseFloat(item[key]);
        if (isNaN(value)) return { ...item, [key + '_winsorized']: item[key] };
        
        const winsorizedValue = Math.max(lowerBound, Math.min(upperBound, value));
        return { ...item, [key + '_winsorized']: winsorizedValue };
    });
};

export const processData = (data, selectedIndicators, isNormalized) => {
    const indicatorData = {}
    selectedIndicators.forEach((indicator) => {
        const values = data.map((item) => parseFloat(item[indicator])).filter((value) => !isNaN(value))
        if (isNormalized) {
            const min = Math.min(...values)
            const max = Math.max(...values)
            indicatorData[indicator] = {
                values: values.map((value) => (value - min) / (max - min)),
                min,
                max,
            }
        } else {
            indicatorData[indicator] = { values }
        }
    })
    return indicatorData
}

export const createChartData = (data, selectedIndicators, processedData, indicatorColors, indicatorNames) => ({
    labels: data.map((item) => item.DATA_YMD),
    datasets: selectedIndicators.map((indicator, index) => ({
        label: indicatorNames[indicator],
        data: processedData[indicator].values,
        borderColor: indicatorColors[indicator] || `hsl(${index * 137.5 % 360}, 70%, 50%)`,
        backgroundColor: indicatorColors[indicator] || `hsl(${index * 137.5 % 360}, 70%, 50%)`,
        tension: 0.1,
        pointRadius: 1,
        pointHoverRadius: 5,
        pointStyle: 'rectRounded',
        fill: false,
    })),
})

export const createNBERData = (data, useKorCycle) => 
    data.map((item) => ({
        date: item.DATA_YMD,
        isRecession: useKorCycle ? item.kor === 1 : item.economic_phase === 1,
    }))