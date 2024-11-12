import React, { useState, useMemo, useCallback } from 'react'
import { Card, CardHeader, CardContent } from '../../../components/Card.js'
import Button from '../../../components/Button.js'
import Input from '../../../components/Input.js'
import { indicatorNames, indicatorCategories, recommendedIndicators } from '../../../helpers/indicators.js'
import { Search, X } from 'lucide-react'

const CompareModal = React.memo(({ isOpen, onClose, onSelectIndicators, selectedIndicators }) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('전체')

    const filteredIndicators = useMemo(() => {
        return Object.keys(indicatorNames).filter(key => {
            const matchesSearch = indicatorNames[key].toLowerCase().includes(searchTerm.toLowerCase())
            const matchesCategory = selectedCategory === '전체' 
                ? true 
                : selectedCategory === '추천' 
                    ? recommendedIndicators.us.includes(key) || recommendedIndicators.kr.includes(key)
                    : indicatorCategories[key] && (
                        Array.isArray(indicatorCategories[key])
                            ? indicatorCategories[key].includes(selectedCategory)
                            : indicatorCategories[key] === selectedCategory
                    )
            return matchesSearch && matchesCategory
        })
    }, [searchTerm, selectedCategory])

    const uniqueCategories = useMemo(() => {
        const categories = new Set(['전체'])
        Object.values(indicatorCategories).forEach(cats => {
            if (Array.isArray(cats)) {
                cats.forEach(cat => categories.add(cat))
            } else if (cats) {
                categories.add(cats)
            }
        })
        const sortedCategories = Array.from(categories).sort((a, b) => a.localeCompare(b))
        return ['추천', '전체', ...sortedCategories.filter(cat => cat !== '전체' && cat !== '추천')]
    }, [])

    const handleSearchChange = useCallback((e) => {
        setSearchTerm(e.target.value)
    }, [])

    const handleCategoryClick = useCallback((category) => {
        setSelectedCategory(category)
    }, [])

    const handleSelectIndicator = useCallback((key) => {
        onSelectIndicators(key)
    }, [onSelectIndicators])

    const renderIndicatorButton = useCallback((key) => (
        <Button
            key={key}
            onClick={() => handleSelectIndicator(key)}
            className={`text-left px-2 py-1 text-sm ${selectedIndicators.includes(key) ? 'bg-blue-600' : 'bg-gray-600'}`}
        >
            {indicatorNames[key]}
        </Button>
    ), [handleSelectIndicator, selectedIndicators])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl bg-gray-800 text-white max-h-[80vh] flex flex-col">
                <CardHeader className="flex justify-between items-center p-4 pb-0">
                    <h2 className="text-xl font-bold">비교할 지표 선택</h2>
                    <Button onClick={onClose} className="p-1">
                        <X size={24} />
                    </Button>
                </CardHeader>
                <CardContent className="p-4 flex-grow overflow-hidden flex flex-col">
                    <div className="mb-4">
                        <div className="flex items-center mb-2 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <Input
                                type="text"
                                placeholder="지표 검색..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="flex-grow pl-10"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {uniqueCategories.map(category => (
                                <Button
                                    key={category}
                                    onClick={() => handleCategoryClick(category)}
                                    className={`px-2 py-1 text-xs ${
                                        category === '추천'
                                            ? 'bg-yellow-600 hover:bg-yellow-700'
                                            : selectedCategory === category
                                            ? 'bg-blue-600'
                                            : 'bg-gray-600 hover:bg-gray-700'
                                    }`}
                                >
                                    {category}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <div className="overflow-y-auto flex-grow pr-2">
                        <div className="grid grid-cols-2 gap-2">
                            {filteredIndicators.map(renderIndicatorButton)}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
})

export default CompareModal
