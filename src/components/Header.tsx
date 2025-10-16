import { Search, ShoppingCart, User, Menu } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';
import UserMenu from './UserMenu';

interface HeaderProps {
  onOrderHistory?: () => void;
  onInventory?: () => void;
  onAccount?: () => void;
  onDocumentation?: () => void;
  onAbout?: () => void;
  onContact?: () => void;
  onBlog?: () => void;
  onAdmin?: () => void;
}

export default function Header({ onOrderHistory, onInventory, onAccount, onDocumentation, onAbout, onContact, onBlog, onAdmin }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { toggleCart, getTotalItems } = useCart();
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Desktop Navigation */}
          <nav className="hidden xl:flex space-x-4">
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium text-sm lg:text-base">Therapeutic Peptides</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium text-sm lg:text-base">Cosmetic Peptides</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium text-sm lg:text-base">Research Peptides</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium text-sm lg:text-base">Custom Synthesis</a>
            <button 
              onClick={onBlog}
              className="text-gray-700 hover:text-blue-600 font-medium text-sm lg:text-base"
            >
              Research Hub
            </button>
            <button 
              onClick={onDocumentation}
              className="text-gray-700 hover:text-blue-600 font-medium text-sm lg:text-base"
            >
              Documentation
            </button>
            <button 
              onClick={onAbout}
              className="text-gray-700 hover:text-blue-600 font-medium text-sm lg:text-base"
            >
              About
            </button>
            <button 
              onClick={onContact}
              className="text-gray-700 hover:text-blue-600 font-medium text-sm lg:text-base"
            >
              Contact
            </button>
            {user && (
              <button 
                onClick={onInventory}
                className="text-gray-700 hover:text-blue-600 font-medium text-sm lg:text-base"
              >
                Inventory
              </button>
            )}
            {user && (
              <button 
                onClick={onAdmin}
                className="text-gray-700 hover:text-blue-600 font-medium text-sm lg:text-base"
              >
                Admin
              </button>
            )}
          </nav>

          {/* Search and Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button 
              onClick={toggleCart}
              className="p-2 sm:p-3 text-gray-400 hover:text-blue-600 relative touch-manipulation"
            >
              <ShoppingCart className="h-5 w-5" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </button>
            {user ? (
              <UserMenu onOrderHistory={onOrderHistory} onAccount={onAccount} />
            ) : (
              <button 
                onClick={() => setAuthModalOpen(true)}
                className="p-2 sm:p-3 text-gray-400 hover:text-blue-600 touch-manipulation"
              >
                <User className="h-5 w-5" />
              </button>
            )}
            <button 
              className="xl:hidden p-2 sm:p-3 text-gray-400 hover:text-blue-600 touch-manipulation"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="xl:hidden bg-white border-t shadow-lg">
          <div className="px-4 py-3 space-y-1">
            <a href="#" className="block py-3 px-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors touch-manipulation">Therapeutic Peptides</a>
            <a href="#" className="block py-3 px-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors touch-manipulation">Cosmetic Peptides</a>
            <a href="#" className="block py-3 px-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors touch-manipulation">Research Peptides</a>
            <a href="#" className="block py-3 px-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors touch-manipulation">Custom Synthesis</a>
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