import React from 'react'
import { HashRouter as Router, Route, Routes } from 'react-router-dom'
import Header from './layouts/Header.js'
import Footer from './layouts/Footer.js'
import MarketsPage from './pages/page/MarketPage.js'
import EconomicsPage from './pages/page/EconomicsPage.js'
import TrendPage from './pages/page/TrendPage.js'

function App() {
    return (
        <Router>
            <div className="bg-gray-900 min-h-screen text-gray-100 font-sans flex flex-col">
                <Header />
                <main className="flex-grow p-4 sm:p-6 mx-auto w-full max-w-screen-xl">
                    <Routes>
                        <Route path="/" element={<MarketsPage />} />
                        <Route path="/markets" element={<MarketsPage />} />
                        <Route path="/economics" element={<EconomicsPage />} />
                        <Route path="/trend" element={<TrendPage />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    )
}

export default App
