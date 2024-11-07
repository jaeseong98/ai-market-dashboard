import React, { useState } from 'react'
import { Card, CardHeader, CardContent } from '../../../components/Card.js'
import Button from '../../../components/Button.js'

const NewsSummary = ({ data }) => {
    const [activeCategory, setActiveCategory] = useState(data[0]?.category)

    return (
        <Card>
            <CardHeader>
                <h3 className="text-xl font-semibold mb-6">Refinitiv 최신 뉴스 요약</h3>
            </CardHeader>
            <CardContent>
                <div className="flex space-x-2 mb-2 overflow-x-auto pb-2">
                    {data.map((item) => (
                        <Button
                            key={item.category}
                            className={`${
                                activeCategory === item.category
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                            onClick={() => setActiveCategory(item.category)}
                        >
                            {item.category}
                        </Button>
                    ))}
                </div>
                <div className="bg-gray-800 p-4 rounded-lg max-h-96 overflow-y-auto">
                    {data
                        .find((item) => item.category === activeCategory)
                        ?.content.split('\n')
                        .map((line, index) => (
                            <p key={index} className="text-sm text-gray-300 mb-2 last:mb-0">
                                {line}
                            </p>
                        ))}
                </div>
            </CardContent>
        </Card>
    )
}

export default NewsSummary
