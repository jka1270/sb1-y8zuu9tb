import { Search, ShoppingCart, User, Menu, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';
import UserMenu from './UserMenu';

interface HeaderProps {
  onHome?: () => void;
  onPeptideCategory?: (category: 'therapeutic' | 'cosmetic' | 'research' | 'custom') => void;
  onOrderHistory?: () => void;
  onInventory?: () => void;
  onAccount?: () => void;
  onDocumentation?: () => void;
  onAbout?: () => void;
  onContact?: () => void;
  onBlog?: () => void;
  onAdmin?: () => void;
}

export default function Header({ onHome, onPeptideCategory, onOrderHistory, onInventory, onAccount, onDocumentation, onAbout, onContact, onBlog, onAdmin }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isPeptidesOpen, setIsPeptidesOpen] = useState(false);
  const { toggleCart, getTotalItems } = useCart();
  const { user } = useAuth();

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 xl:bg-white shadow-sm border-b border-blue-500 border-opacity-30 xl:border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-14 sm:h-16 relative">
          {/* Mobile Menu Button - Left Side */}
          <div className="absolute left-0 xl:hidden">
            <button
              className="p-2 sm:p-3 text-white hover:text-blue-200 touch-manipulation"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex space-x-4">
            <button
              onClick={onHome}
              className="text-black hover:text-blue-600 font-medium text-sm lg:text-base"
            >
              Home
            </button>
            <div className="relative" onMouseLeave={() => setIsPeptidesOpen(false)}>
              <button
                onMouseEnter={() => setIsPeptidesOpen(true)}
                className="text-black hover:text-blue-600 font-medium text-sm lg:text-base flex items-center"
              >
                Peptides Catalog
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>
              {isPeptidesOpen && (
                <div className="absolute left-0 top-full mt-1 w-56 bg-white shadow-lg rounded-lg border py-2 z-50">
                  <button onClick={() => { onPeptideCategory?.('therapeutic'); setIsPeptidesOpen(false); }} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600">Therapeutic Peptides</button>
                  <button onClick={() => { onPeptideCategory?.('cosmetic'); setIsPeptidesOpen(false); }} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600">Cosmetic Peptides</button>
                  <button onClick={() => { onPeptideCategory?.('research'); setIsPeptidesOpen(false); }} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600">Research Peptides</button>
                  <button onClick={() => { onPeptideCategory?.('custom'); setIsPeptidesOpen(false); }} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600">Custom Synthesis</button>
                </div>
              )}
            </div>
            <button
              onClick={onBlog}
              className="text-black hover:text-blue-600 font-medium text-sm lg:text-base"
            >
              Research Hub
            </button>
            <button
              onClick={onDocumentation}
              className="text-black hover:text-blue-600 font-medium text-sm lg:text-base"
            >
              Documentation
            </button>
            <button
              onClick={onAbout}
              className="text-black hover:text-blue-600 font-medium text-sm lg:text-base"
            >
              About
            </button>
            <button
              onClick={onContact}
              className="text-black hover:text-blue-600 font-medium text-sm lg:text-base"
            >
              Contact
            </button>
            {user && (
              <button
                onClick={onInventory}
                className="text-black hover:text-blue-600 font-medium text-sm lg:text-base"
              >
                Inventory
              </button>
            )}
            {user && (
              <button
                onClick={onAdmin}
                className="text-black hover:text-blue-600 font-medium text-sm lg:text-base"
              >
                Admin
              </button>
            )}
          </nav>

          {/* Cart and Account - Right Side */}
          <div className="absolute right-0 flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={toggleCart}
              className="p-2 sm:p-3 text-white xl:text-black hover:text-blue-200 xl:hover:text-blue-600 relative touch-manipulation"
            >
              <ShoppingCart className="h-5 w-5" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-white xl:bg-blue-600 text-blue-600 xl:text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-semibold">
                  {getTotalItems()}
                </span>
              )}
            </button>
            {user ? (
              <UserMenu onOrderHistory={onOrderHistory} onAccount={onAccount} />
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="p-2 sm:p-3 text-white xl:text-black hover:text-blue-200 xl:hover:text-blue-600 touch-manipulation"
              >
                <User className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="xl:hidden bg-white border-t shadow-lg">
          <div className="px-4 py-3 space-y-1">
            <button
              onClick={onHome}
              className="block py-3 px-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors w-full text-left touch-manipulation"
            >
              Home
            </button>
            <div className="py-2">
              <button
                onClick={() => setIsPeptidesOpen(!isPeptidesOpen)}
                className="flex items-center justify-between w-full py-3 px-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors touch-manipulation"
              >
                Peptides Catalog
                <ChevronDown className={`h-4 w-4 transition-transform ${isPeptidesOpen ? 'rotate-180' : ''}`} />
              </button>
              {isPeptidesOpen && (
                <div className="ml-4 mt-1 space-y-1">
                  <button onClick={() => { onPeptideCategory?.('therapeutic'); setIsMenuOpen(false); setIsPeptidesOpen(false); }} className="block py-2 px-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors touch-manipulation w-full text-left">Therapeutic Peptides</button>
                  <button onClick={() => { onPeptideCategory?.('cosmetic'); setIsMenuOpen(false); setIsPeptidesOpen(false); }} className="block py-2 px-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors touch-manipulation w-full text-left">Cosmetic Peptides</button>
                  <button onClick={() => { onPeptideCategory?.('research'); setIsMenuOpen(false); setIsPeptidesOpen(false); }} className="block py-2 px-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors touch-manipulation w-full text-left">Research Peptides</button>
                  <button onClick={() => { onPeptideCategory?.('custom'); setIsMenuOpen(false); setIsPeptidesOpen(false); }} className="block py-2 px-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors touch-manipulation w-full text-left">Custom Synthesis</button>
                </div>
              )}
            </div>
            <button
              onClick={onBlog}
              className="block py-3 px-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors w-full text-left touch-manipulation"
            >
              Research Hub
            </button>
            <button
              onClick={onDocumentation}
              className="block py-3 px-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors w-full text-left touch-manipulation"
            >
              Documentation
            </button>
            <button
              onClick={onAbout}
              className="block py-3 px-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors w-full text-left touch-manipulation"
            >
              About
            </button>
            <button
              onClick={onContact}
              className="block py-3 px-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors w-full text-left touch-manipulation"
            >
              Contact
            </button>
            {user && (
              <button
                onClick={onInventory}
                className="block py-3 px-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors w-full text-left touch-manipulation"
              >
                Inventory
              </button>
            )}
            {user && (
              <button
                onClick={onAdmin}
                className="block py-3 px-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors w-full text-left touch-manipulation"
              >
                Admin
              </button>
            )}
          </div>
        </div>
      )}

      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </header>
  );
}