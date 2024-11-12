import React from 'react'
import { HashRouter as Router, Route, Routes } from 'react-router-dom'
import Header from './layouts/Header.js'
import Footer from './layouts/Footer.js'
import MarketsPage from './pages/markets/MarketPage.js';
import EconomicsPage from './pages/economics/EconomicsPage.js';
import TrendPage from './pages/trend/TrendPage.js';
import TrendPage2 from './pages/trend_ver2/TrendPage.js';

function App() {
    return (
        <Router>
            <div className="bg-gray-900 min-h-screen text-gray-100 font-sans flex flex-col">
                <Header />
                <main className="flex-grow p-4 sm:p-6 w-full mt-16 max-w-[1680px] mx-auto">
                    <div className="px-4 lg:px-8">
                        <Routes>
                            <Route path="/" element={<MarketsPage />} />
                            <Route path="/markets" element={<MarketsPage />} />
                            <Route path="/economics" element={<EconomicsPage />} />
                            <Route path="/trend" element={<TrendPage />} />
                            <Route path="/trend_ver2" element={<TrendPage2 />} />
                        </Routes>
                    </div>
                </main>
                <Footer />
            </div>
        </Router>
    )
}

export default App
