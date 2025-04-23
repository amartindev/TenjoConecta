import { Search, Menu, X, Phone } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
            <img src="/link.png" alt="logo" className='max-h-10 px-2' />
              <span className="text-2xl font-bold bg-gradient-to-r from-[#B9021A] via-[#FFD900] to-[#026930] bg-clip-text text-transparent">
                Tenjo Conecta
                </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Buscar negocios, productos, servicios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-96 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <button type="submit" className="absolute right-3 top-2.5" aria-label='Buscar negocios, productos, servicios ...'>
                <Search className="h-5 w-5 text-gray-400 hover:text-yellow-500" />
              </button>
            </form>
            <Link
              to="/register"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-500 hover:bg-yellow-600"
            >
              Registrar Negocio
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center px-4 py-2 bg-green-800 hover:bg-green-900 text-white rounded-lg transition-colors"
            >
              <Phone className="h-4 w-4 mr-2" />
              Contacto
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-yellow-500"
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <form onSubmit={handleSearch} className="relative px-3 py-2">
              <input
                type="text"
                placeholder="Buscar negocios, productos, servicios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <button type="submit" className="absolute right-6 top-4.5" aria-label='Buscar negocios, productos, servicios ...'>
                <Search className="h-5 w-5 text-gray-400 hover:text-yellow-500" />
              </button>
            </form>
            <Link
              to="/register"
              className="block px-3 py-2 rounded-md text-center font-medium text-white bg-yellow-500 hover:bg-yellow-600"
            >
              Registrar Negocio
            </Link>
            <Link
              to="/contact"
              className="block px-3 py-2 rounded-md text-base font-medium text-white bg-green-800 hover:bg-green-900"
            >
              <div className="flex items-center justify-center">
                <Phone className="h-4 w-4 mr-2" />
                Contacto
              </div>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}