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
  const [showPeptideCategory, setShowPeptideCategory] = useState<'therapeutic' | 'cosmetic' | 'research' | 'custom' | 'libraries' | null>(null);
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
    setHomeCategory('');
    setAccountPage('dashboard');
  };

  const handlePeptideCategory = (category: 'therapeutic' | 'cosmetic' | 'research' | 'custom' | 'libraries') => {
    setShowCheckout(false);
    setShowOrderHistory(false);
    setShowInventory(false);
    setShowAccount(false);
    setShowDocumentation(false);
    setShowAbout(false);
    setShowContact(false);
    setShowBlog(false);
    setShowAdmin(false);
    setAccountPage('dashboard');
    setShowPeptideCategory(category);
  };

  const handleBackFromPeptideCategory = () => {
    setShowPeptideCategory(null);
  };

  const handleCheckout = () => {
    handleHome();
    setShowCheckout(true);
  };
  const handleBackFromCheckout = () => setShowCheckout(false);
  const handleOrderHistory = () => {
    handleHome();
    setShowOrderHistory(true);
  };
  const handleBackFromOrderHistory = () => setShowOrderHistory(false);
  const handleInventory = () => {
    handleHome();
    setShowInventory(true);
  };
  const handleBackFromInventory = () => setShowInventory(false);
  const handleAccount = () => {
    handleHome();
    setShowAccount(true);
    setAccountPage('dashboard');
  };
  const handleBackFromAccount = () => {
    setShowAccount(false);
    setAccountPage('dashboard');
  };
  const handleDocumentation = () => {
    handleHome();
    setShowDocumentation(true);
  };
  const handleBackFromDocumentation = () => setShowDocumentation(false);
  const handleAbout = () => {
    handleHome();
    setShowAbout(true);
  };
  const handleBackFromAbout = () => setShowAbout(false);
  const handleContact = () => {
    handleHome();
    setShowContact(true);
  };
  const handleBackFromContact = () => setShowContact(false);
  const handleBlog = () => {
    handleHome();
    setShowBlog(true);
  };
  const handleBackFromBlog = () => setShowBlog(false);
  const handleAdmin = () => {
    handleHome();
    setShowAdmin(true);
  };
  const handleBackFromAdmin = () => setShowAdmin(false);

  const handleAccountNavigation = (page: string) => {
    if (page === 'order-history') {
      setShowAccount(false);
      setShowOrderHistory(true);
    } else {
      setAccountPage(page);
    }
  };

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

        {showPeptideCategory && (
          <PeptideCategoryPage category={showPeptideCategory} onBack={handleBackFromPeptideCategory} />
        )}

        {showAdmin && (
          <AdminPanel onBack={handleBackFromAdmin} />
        )}

        {showCheckout && (
          <CheckoutPage onBack={handleBackFromCheckout} />
        )}

        {showOrderHistory && (
          <OrderHistoryPage onBack={handleBackFromOrderHistory} />
        )}

        {showInventory && (
          <InventoryDashboard />
        )}

        {showAccount && (
          <>
            {accountPage === 'dashboard' && (
              <AccountDashboard onNavigate={handleAccountNavigation} />
            )}
            {accountPage === 'research-profile' && (
              <ResearchProfilePage onBack={handleBackFromAccount} />
            )}
            {accountPage === 'saved-products' && (
              <SavedProductsPage onBack={handleBackFromAccount} />
            )}
          </>
        )}

        {showDocumentation && (
          <ResearchDocumentationPage onBack={handleBackFromDocumentation} />
        )}

        {showAbout && (
          <AboutPage onBack={handleBackFromAbout} />
        )}

        {showContact && (
          <ContactPage onBack={handleBackFromContact} />
        )}

        {showBlog && (
          <BlogPage onBack={handleBackFromBlog} />
        )}

        {!showPeptideCategory && !showAdmin && !showCheckout && !showOrderHistory && !showInventory && !showAccount && !showDocumentation && !showAbout && !showContact && !showBlog && (
          <>
            <Hero onResearchGuide={handleDocumentation} />
            <ProductGrid />
            <ShippingIntegration />
          </>
        )}

        <Footer onAbout={handleAbout} onContact={handleContact} onBlog={handleBlog} />
        <CartSidebar onCheckout={handleCheckout} />
        <NotificationContainer />
      </div>
    </CartProvider>
  );
}
