import { useState } from 'react';
import { User, LogOut, Package, Settings, ChevronDown, History } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface UserMenuProps {
  onOrderHistory?: () => void;
  onAccount?: () => void;
}

export default function UserMenu({ onOrderHistory, onAccount }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  if (!user) return null;

  const userDisplayName = user.user_metadata?.first_name 
    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
    : user.email?.split('@')[0] || 'User';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 sm:space-x-2 p-2 text-gray-700 hover:text-blue-600 rounded-lg hover:bg-gray-50 touch-manipulation"
      >
        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
          <User className="h-4 w-4" />
        </div>
        <span className="hidden sm:block font-medium text-sm sm:text-base max-w-24 sm:max-w-none truncate">{userDisplayName}</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-white rounded-lg shadow-lg border z-20">
            <div className="p-3 sm:p-4 border-b">
              <div className="font-medium text-gray-900 text-sm sm:text-base truncate">{userDisplayName}</div>
              <div className="text-xs sm:text-sm text-gray-500 truncate">{user.email}</div>
              {user.user_metadata?.company && (
                <div className="text-xs sm:text-sm text-gray-500 truncate">{user.user_metadata.company}</div>
              )}
            </div>
            
            <div className="py-2">
              <button 
                onClick={() => {
                  onAccount?.();
                  setIsOpen(false);
                }}
                className="w-full px-3 sm:px-4 py-3 text-left text-gray-700 hover:bg-gray-50 flex items-center text-sm sm:text-base touch-manipulation"
              >
                <User className="h-4 w-4 mr-3" />
                Account Dashboard
              </button>
              <button 
                onClick={() => {
                  onOrderHistory?.();
                  setIsOpen(false);
                }}
                className="w-full px-3 sm:px-4 py-3 text-left text-gray-700 hover:bg-gray-50 flex items-center text-sm sm:text-base touch-manipulation"
              >
                <Package className="h-4 w-4 mr-3" />
                Order History
              </button>
            </div>
            
            <div className="border-t py-2">
              <button
                onClick={handleSignOut}
                className="w-full px-3 sm:px-4 py-3 text-left text-red-600 hover:bg-red-50 flex items-center text-sm sm:text-base touch-manipulation"
              >
                <LogOut className="h-4 w-4 mr-3" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}