import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardContent } from '../../../components/Card.js'
import * as XLSX from 'xlsx'
import { GB, US, KR, CN, JP, EU, DE, FR, IT, AU, CA, NZ, CH } from 'country-flag-icons/react/3x2'

// isSameDay 함수 추가
const isSameDay = (date1, date2) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear()
}

// 날짜 파싱 함수 추가
const parseDate = (dateStr) => {
    try {
        // "11.30 (Sat)" 형식에서 날짜 추출
        const [month, day] = dateStr.split(' ')[0].split('.')
        const year = new Date().getFullYear() // 현재 연도 사용
        return new Date(year, parseInt(month) - 1, parseInt(day))
    } catch (error) {
        console.error('날짜 파싱 에러:', error)
        return null
    }
}

// 국가 코드에 따른 국기 컴포넌트 매핑
const countryFlags = {
    'us': US,
    'kr': KR,
    'cn': CN,
    'jp': JP,
    'gb': GB,
    'eu': EU,
    'de': DE,
    'fr': FR,
    'it': IT,
    'au': AU,
    'ca': CA,
    'nz': NZ,
    'ch': CH
}

// 오늘 날짜 체크 함수 추가
const isToday = (date) => {
    const today = new Date()
    return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
}

const EconomicCalendar = () => {
    const [calendarData, setCalendarData] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedDate, setSelectedDate] = useState(null)
    const [showModal, setShowModal] = useState(false)
    
    // 현재 날짜 기준으로 설정
    const now = new Date()
    const currentMonth = new Date(now.getFullYear(), now.getMonth())

    useEffect(() => {
        const xhr = new XMLHttpRequest()
        
        xhr.open('GET', `${process.env.PUBLIC_URL}/economic_calendar.xls`, true)
        xhr.responseType = 'arraybuffer'
        
        xhr.onload = function() {
            if (xhr.status === 200) {
                const arrayBuffer = xhr.response
                const workbook = XLSX.read(arrayBuffer, { type: 'array' })
                const firstSheetName = workbook.SheetNames[0]
                const worksheet = workbook.Sheets[firstSheetName]
                const data = XLSX.utils.sheet_to_json(worksheet, { raw: false })
                console.log('Loaded Data:', data)
                setCalendarData(data)
                setLoading(false)
            } else {
                console.error('엑셀 파일 로딩 오류')
                setLoading(false)
            }
        }

        xhr.onerror = function() {
            console.error('엑셀 파일 로딩 오류')
            setLoading(false)
        }

        xhr.send()
    }, [])

    // 날짜 클릭 핸들러 수정
    const handleDateClick = (dayInfo) => {
        if (dayInfo.hasEvents) {
            setSelectedDate(dayInfo.date)
            setShowModal(true)
        }
    }

    // 이벤트 필터링 함수 수정
    const getEventsForDate = (date) => {
        if (!date) return []
        return calendarData.filter(item => {
            const itemDate = parseDate(item['날짜'])
            return itemDate && isSameDay(itemDate, date)
        })
    }

    // 달력 날짜 생성 함수
    const getDaysInMonth = () => {
        const year = currentMonth.getFullYear()
        const month = currentMonth.getMonth()
        const firstDay = new Date(year, month, 1).getDay()
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        
        const days = []
        // 이전 달의 날짜들
        for (let i = 0; i < firstDay; i++) {
            const prevDate = new Date(year, month, 0 - i)
            days.unshift({ 
                date: prevDate, 
                isCurrentMonth: false,
                hasEvents: calendarData.some(item => {
                    const itemDate = parseDate(item['날짜'])
                    return itemDate && isSameDay(itemDate, prevDate)
                })
            })
        }
        // 현재 달의 날짜들
        for (let i = 1; i <= daysInMonth; i++) {
            const currentDate = new Date(year, month, i)
            days.push({ 
                date: currentDate, 
                isCurrentMonth: true,
                hasEvents: calendarData.some(item => {
                    const itemDate = parseDate(item['날짜'])
                    return itemDate && isSameDay(itemDate, currentDate)
                })
            })
        }
        return days
    }

    if (loading) return <div className="text-center mt-4">Loading calendar...</div>

    return (
        <>
            <Card className="bg-gray-800 border-gray-700 h-[355px]">
                <CardHeader className="bg-gray-900 p-2 border-b border-gray-800">
                    <div className="flex items-center space-x-2">
                        <span className="text-base">📅</span>
                        <h3 className="text-base font-medium text-gray-100">
                            {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월 경제 캘린더
                        </h3>
                    </div>
                </CardHeader>
                <CardContent className="pt-3">
                    <div className="grid grid-cols-7">
                        {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                            <div 
                                key={day} 
                                className={`text-center py-1.5 text-sm
                                    ${index === 0 ? 'text-rose-400' : 
                                      index === 6 ? 'text-blue-400' : 'text-gray-400'}`}
                            >
                                {day}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-[1px]">
                        {getDaysInMonth().map((dayInfo, idx) => (
                            <div
                                key={idx}
                                onClick={() => handleDateClick(dayInfo)}
                                className={`
                                    relative flex flex-col items-center justify-center py-1.5
                                    transition-colors duration-200
                                    ${dayInfo.isCurrentMonth ? 'text-gray-100' : 'text-gray-600'}
                                    ${dayInfo.hasEvents ? 'cursor-pointer hover:bg-gray-800/50' : ''}
                                    ${selectedDate && dayInfo.date.toDateString() === selectedDate.toDateString() 
                                        ? 'bg-gray-800 ring-1 ring-blue-500/50' 
                                        : ''
                                    }
                                    ${isToday(dayInfo.date) ? 'text-emerald-400 font-bold' : ''}
                                `}
                            >
                                <span className={`
                                    text-sm
                                    ${dayInfo.date.getDay() === 0 ? 'text-rose-400' : 
                                      dayInfo.date.getDay() === 6 ? 'text-blue-400' : ''}
                                    ${isToday(dayInfo.date) ? '!text-emerald-400' : ''}
                                `}>
                                    {dayInfo.date.getDate()}
                                </span>
                                {dayInfo.hasEvents && (
                                    <div className="mt-1">
                                        <div className="w-1 h-1 bg-blue-400/80 rounded-full"></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* 모달 */}
            {showModal && selectedDate && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gray-900 rounded-xl w-full max-w-5xl mx-4">
                        {/* 헤더 */}
                        <div className="p-3 border-b border-gray-800 flex justify-between items-center">
                            <h3 className="text-base font-medium text-gray-100 flex items-center gap-2">
                                <span className="text-blue-400">📅</span>
                                {selectedDate.toLocaleDateString()} 경제지표
                            </h3>
                            <button 
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-200 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* 테이블 컨테이너 */}
                        <div className="max-h-[600px] overflow-y-auto">
                            <table className="w-full">
                                <thead className="sticky top-0 bg-gray-900/95 backdrop-blur-sm">
                                    <tr className="text-xs text-gray-400">
                                        <th className="py-2 px-3 text-left">시간</th>
                                        <th className="py-2 px-3 text-left">국가</th>
                                        <th className="py-2 px-3 text-left">경제지표</th>
                                        <th className="py-2 px-3 text-right">실제</th>
                                        <th className="py-2 px-3 text-right">예상</th>
                                        <th className="py-2 px-3 text-right">이전</th>
                                        <th className="py-2 px-3 text-center">중요도</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/50">
                                    {getEventsForDate(selectedDate).map((event, idx) => (
                                        <tr key={idx} className="text-sm hover:bg-gray-800/30">
                                            <td className="py-2 px-3 text-gray-300">{event['시간']}</td>
                                            <td className="py-2 px-3">
                                                <span className="flex items-center gap-1">
                                                    {(() => {
                                                        const FlagComponent = countryFlags[event['국가'].toLowerCase()]
                                                        return FlagComponent ? <FlagComponent className="w-4 h-3" /> : null
                                                    })()}
                                                    <span className="text-gray-300 uppercase">{event['국가']}</span>
                                                </span>
                                            </td>
                                            <td className="py-2 px-3 text-gray-100">{event['경제지표']}</td>
                                            <td className="py-2 px-3 text-right text-gray-100">{event['실제'] || '-'}</td>
                                            <td className="py-2 px-3 text-right text-gray-300">{event['예상'] || '-'}</td>
                                            <td className="py-2 px-3 text-right text-gray-300">{event['이전'] || '-'}</td>
                                            <td className="py-2 px-3">
                                                <div className="flex justify-center">
                                                    <span className={`
                                                        px-2.5 py-1 rounded text-xs 
                                                        ${event['중요도'] === '상' ? 'bg-rose-950/50 text-rose-400 ring-rose-500/50 shadow-rose-500/30 shadow-sm' :
                                                          event['중요도'] === '중' ? 'bg-yellow-950/50 text-yellow-500 ring-yellow-500/50 shadow-yellow-500/30 shadow-sm' :
                                                          'bg-blue-950/50 text-blue-300 ring-blue-500/50 shadow-blue-500/30 shadow-sm'}
                                                    `}>
                                                        {event['중요도']}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default EconomicCalendar 