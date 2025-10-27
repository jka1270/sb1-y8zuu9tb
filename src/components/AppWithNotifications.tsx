import { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { CartProvider } from '../contexts/CartContext';
import Header from './Header';
import Hero from './Hero';
import ProductGrid from './ProductGrid';
import ShippingIntegration from './ShippingIntegration';
import Footer from './Footer';
import CartSidebar from './CartSidebar';
import CheckoutPage from './CheckoutPage';
import OrderHistoryPage from './OrderHistoryPage';
import InventoryDashboard from './InventoryDashboard';
import AccountDashboard from './AccountDashboard';
import ResearchProfilePage from './ResearchProfilePage';
import SavedProductsPage from './SavedProductsPage';
import ResearchDocumentationPage from './ResearchDocumentationPage';
import AboutPage from './AboutPage';
import ContactPage from './ContactPage';
import BlogPage from './BlogPage';
import AdminPanel from './AdminPanel';
import PeptideCategoryPage from './PeptideCategoryPage';
import NotificationContainer from './NotificationContainer';
import { ArrowLeft } from 'lucide-react';
import { preloadCriticalResources } from '../lib/performance';
import { CartItem } from '../types';

export default function AppWithNotifications() {
  const [showCheckout, setShowCheckout] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showBlog, setShowBlog] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showPeptideCategory, setShowPeptideCategory] = useState<'therapeutic' | 'cosmetic' | 'research' | 'custom' | null>(null);
  const [accountPage, setAccountPage] = useState('dashboard');
  const { showNotification } = useNotification();

  const handleItemAdded = (item: CartItem, isNewItem: boolean) => {
    if (isNewItem) {
      showNotification({
        type: 'success',
        message: `${item.productName} added to cart!`,
        duration: 3000,
      });
    } else {
      showNotification({
        type: 'success',
        message: `Updated ${item.productName} quantity in cart`,
        duration: 3000,
      });
    }
  };

  useEffect(() => {
    const criticalImages = [
      'https://images.pexels.com/photos/3735747/pexels-photo-3735747.jpeg',
      'https://images.pexels.com/photos/3786126/pexels-photo-3786126.jpeg',
      'https://images.pexels.com/photos/3786157/pexels-photo-3786157.jpeg'
    ];
    preloadCriticalResources(criticalImages);
  }, []);

  const handleHome = () => {
    setShowCheckout(false);
    setShowOrderHistory(false);
    setShowInventory(false);
    setShowAccount(false);
    setShowDocumentation(false);
    setShowAbout(false);
    setShowContact(false);
    setShowBlog(false);
    setShowAdmin(false);
    setShowPeptideCategory(null);
    setAccountPage('dashboard');
  };

  const handlePeptideCategory = (category: 'therapeutic' | 'cosmetic' | 'research' | 'custom') => {
    setShowPeptideCategory(category);
  };

  const handleBackFromPeptideCategory = () => {
    setShowPeptideCategory(null);
  };

  const handleCheckout = () => setShowCheckout(true);
  const handleBackFromCheckout = () => setShowCheckout(false);
  const handleOrderHistory = () => setShowOrderHistory(true);
  const handleBackFromOrderHistory = () => setShowOrderHistory(false);
  const handleInventory = () => setShowInventory(true);
  const handleBackFromInventory = () => setShowInventory(false);
  const handleAccount = () => {
    setShowAccount(true);
    setAccountPage('dashboard');
  };
  const handleBackFromAccount = () => {
    setShowAccount(false);
    setAccountPage('dashboard');
  };
  const handleDocumentation = () => setShowDocumentation(true);
  const handleBackFromDocumentation = () => setShowDocumentation(false);
  const handleAbout = () => setShowAbout(true);
  const handleBackFromAbout = () => setShowAbout(false);
  const handleContact = () => setShowContact(true);
  const handleBackFromContact = () => setShowContact(false);
  const handleBlog = () => setShowBlog(true);
  const handleBackFromBlog = () => setShowBlog(false);
  const handleAdmin = () => setShowAdmin(true);
  const handleBackFromAdmin = () => setShowAdmin(false);

  const handleAccountNavigation = (page: string) => {
    if (page === 'order-history') {
      setShowAccount(false);
      setShowOrderHistory(true);
    } else {
      setAccountPage(page);
    }
  };

  if (showPeptideCategory) {
    return (
      <CartProvider onItemAdded={handleItemAdded}>
        <div className="min-h-screen bg-gray-50">
          <PeptideCategoryPage category={showPeptideCategory} onBack={handleBackFromPeptideCategory} />
          <NotificationContainer />
        </div>
      </CartProvider>
    );
  }

  if (showAdmin) {
    return (
      <CartProvider onItemAdded={handleItemAdded}>
        <div className="min-h-screen bg-gray-50">
          <AdminPanel onBack={handleBackFromAdmin} />
          <NotificationContainer />
        </div>
      </CartProvider>
    );
  }

  if (showCheckout) {
    return (
      <CartProvider onItemAdded={handleItemAdded}>
        <div className="min-h-screen bg-gray-50">
          <CheckoutPage onBack={handleBackFromCheckout} />
          <NotificationContainer />
        </div>
      </CartProvider>
    );
  }

  if (showOrderHistory) {
    return (
      <CartProvider onItemAdded={handleItemAdded}>
        <div className="min-h-screen bg-gray-50">
          <OrderHistoryPage onBack={handleBackFromOrderHistory} />
          <NotificationContainer />
        </div>
      </CartProvider>
    );
  }

  if (showInventory) {
    return (
      <CartProvider onItemAdded={handleItemAdded}>
        <div className="min-h-screen bg-gray-50">
          <div className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <button
                onClick={handleBackFromInventory}
                className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Shop
              </button>
            </div>
          </div>
          <InventoryDashboard />
          <NotificationContainer />
        </div>
      </CartProvider>
    );
  }

  if (showAccount) {
    return (
      <CartProvider onItemAdded={handleItemAdded}>
        <div className="min-h-screen bg-gray-50">
          {accountPage === 'dashboard' && (
            <AccountDashboard onNavigate={handleAccountNavigation} />
          )}
          {accountPage === 'research-profile' && (
            <ResearchProfilePage onBack={handleBackFromAccount} />
          )}
          {accountPage === 'saved-products' && (
            <SavedProductsPage onBack={handleBackFromAccount} />
          )}
          <NotificationContainer />
        </div>
      </CartProvider>
    );
  }

  if (showDocumentation) {
    return (
      <CartProvider onItemAdded={handleItemAdded}>
        <div className="min-h-screen bg-gray-50">
          <ResearchDocumentationPage onBack={handleBackFromDocumentation} />
          <NotificationContainer />
        </div>
      </CartProvider>
    );
  }

  if (showAbout) {
    return (
      <CartProvider onItemAdded={handleItemAdded}>
        <div className="min-h-screen bg-gray-50">
          <AboutPage onBack={handleBackFromAbout} />
          <NotificationContainer />
        </div>
      </CartProvider>
    );
  }

  if (showContact) {
    return (
      <CartProvider onItemAdded={handleItemAdded}>
        <div className="min-h-screen bg-gray-50">
          <ContactPage onBack={handleBackFromContact} />
          <NotificationContainer />
        </div>
      </CartProvider>
    );
  }

  if (showBlog) {
    return (
      <CartProvider onItemAdded={handleItemAdded}>
        <div className="min-h-screen bg-gray-50">
          <BlogPage onBack={handleBackFromBlog} />
          <NotificationContainer />
        </div>
      </CartProvider>
    );
  }

  return (
    <CartProvider onItemAdded={handleItemAdded}>
      <div className="min-h-screen bg-gray-50">
        <Header
          onHome={handleHome}
          onPeptideCategory={handlePeptideCategory}
          onOrderHistory={handleOrderHistory}
          onInventory={handleInventory}
          onAccount={handleAccount}
          onDocumentation={handleDocumentation}
          onAbout={handleAbout}
          onContact={handleContact}
          onBlog={handleBlog}
          onAdmin={handleAdmin}
        />
        <Hero />
        <ProductGrid />
        <ShippingIntegration />
        <Footer onAbout={handleAbout} onContact={handleContact} onBlog={handleBlog} />
        <CartSidebar onCheckout={handleCheckout} />
        <NotificationContainer />
      </div>
    </CartProvider>
  );
}
