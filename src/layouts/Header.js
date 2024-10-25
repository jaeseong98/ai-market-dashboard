import { Link } from 'react-router-dom'
import logo from '../assets/images/fnguide-logo.png'

const Header = () => (
    <header className="bg-gray-900 text-white p-4 shadow-lg border-b border-gray-700">
        <div className="container mx-auto flex items-center">
            <div className="flex items-center flex-shrink-0">
                <img src={logo} alt="FnGuide 로고" className="h-12 w-auto mr-4" />
                <h1 className="text-2xl font-bold">미국 경제 대시보드</h1>
            </div>
            <nav className="flex space-x-6 ml-auto">
                <Link to="/" className="text-gray-300 hover:text-white">Markets</Link>
                <Link to="/economics" className="text-gray-300 hover:text-white">Economics</Link>
                <Link to="/news" className="text-gray-300 hover:text-white">News</Link>
            </nav>
        </div>
    </header>
)

export default Header
