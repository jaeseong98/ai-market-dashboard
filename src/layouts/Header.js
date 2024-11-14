import { Link, useLocation } from 'react-router-dom'
import logo from '../assets/images/fnguide-logo.png'

const Header = () => {
    const location = useLocation();
    
    const isActive = (path) => {
        if (path === '/') {
            return location.pathname === '/' || location.pathname === '/markets';
        }
        return location.pathname === path;
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm text-white shadow-lg border-b border-gray-700/50">
            <div className="container mx-auto flex items-center h-16">
                <Link 
                    to="/" 
                    className="flex items-center flex-shrink-0 hover:opacity-80 ml-4 transition-opacity duration-200"
                >
                    <img src={logo} alt="FnGuide 로고" className="h-10 w-auto mr-4" />
                    <h1 className="text-xl font-bold">미국 경제 대시보드</h1>
                </Link>
                
                <nav className="flex space-x-8 ml-auto mr-12">
                    <Link 
                        to="/markets" 
                        className={`relative py-5 px-1 transition-colors duration-200
                            ${isActive('/markets') 
                                ? 'text-blue-400' 
                                : 'text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        <span>Markets</span>
                        {isActive('/markets') && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"></span>
                        )}
                    </Link>
                    <Link 
                        to="/economics" 
                        className={`relative py-5 px-1 transition-colors duration-200
                            ${isActive('/economics') 
                                ? 'text-blue-400' 
                                : 'text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        <span>Economics</span>
                        {isActive('/economics') && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"></span>
                        )}
                    </Link>
                    {/* <Link 
                        to="/trend" 
                        className={`relative py-5 px-1 transition-colors duration-200
                            ${isActive('/trend') 
                                ? 'text-blue-400' 
                                : 'text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        <span>Trend</span>
                        {isActive('/trend') && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"></span>
                        )}
                    </Link> */}
                    <Link 
                        to="/trend_ver2" 
                        className={`relative py-5 px-1 transition-colors duration-200
                            ${isActive('/trend_ver2') 
                                ? 'text-blue-400' 
                                : 'text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        <span>Trend</span>
                        {isActive('/trend_ver2') && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"></span>
                        )}
                    </Link>
                </nav>
            </div>
        </header>
    )
}

export default Header
