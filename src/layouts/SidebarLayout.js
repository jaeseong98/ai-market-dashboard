import React from 'react'

const Sidebar = () => {
    const handleNavClick = (route) => {
        // 여기에 네비게이션 로직을 추가할 수 있습니다.
        console.log(`Navigating to ${route}`)
    }

    return (
        <aside className="bg-gray-800 text-white w-64 min-h-screen p-4">
            <nav>
                <ul>
                    <li>
                        <button
                            onClick={() => handleNavClick('dashboard')}
                            className="w-full text-left block py-2 hover:text-blue-300 focus:outline-none focus:text-blue-300"
                        >
                            대시보드
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => handleNavClick('market')}
                            className="w-full text-left block py-2 hover:text-blue-300 focus:outline-none focus:text-blue-300"
                        >
                            시장 데이터
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => handleNavClick('indicators')}
                            className="w-full text-left block py-2 hover:text-blue-300 focus:outline-none focus:text-blue-300"
                        >
                            경제 지표
                        </button>
                    </li>
                </ul>
            </nav>
        </aside>
    )
}

export default Sidebar
