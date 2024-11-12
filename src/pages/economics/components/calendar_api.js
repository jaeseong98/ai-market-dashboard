import React from 'react'
import { Card, CardHeader, CardContent } from '../../../components/Card.js'

const EconomicCalendar = () => {
    return (
        <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="bg-gray-900 p-2 border-b border-gray-800">
                <div className="flex items-center space-x-2">
                    <span className="text-base">📅</span>
                    <h3 className="text-base font-medium text-gray-100">
                        경제 캘린더
                    </h3>
                </div>
            </CardHeader>
            <CardContent className="h-[275px] bg-white">
                <iframe 
                    src="https://asp.zeroin.co.kr/eco/hkd/wei/0601.php"
                    className="w-full h-full border-0"
                    style={{ 
                        backgroundColor: 'white',
                        filter: 'invert(0)',
                        colorScheme: 'light'
                    }}
                    title="Economic Calendar"
                />
            </CardContent>
        </Card>
    )
}

export default EconomicCalendar 