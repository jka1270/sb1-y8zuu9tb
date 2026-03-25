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
import AccountDashboard from './AccountDashboard';
import ResearchProfilePage from './ResearchProfilePage';
import SavedProductsPage from './SavedProductsPage';
import UserProfilePage from './UserProfilePage';
import PreferencesPage from './PreferencesPage';
import ResearchDocumentationPage from './ResearchDocumentationPage';
import AboutPage from './AboutPage';
import ContactPage from './ContactPage';
import BlogPage from './BlogPage';
import AdminPanel from './AdminPanel';
import AminoAcidChainCategoryPage from './PeptideCategoryPage';
import NotificationContainer from './NotificationContainer';
import { ArrowLeft } from 'lucide-react';
import { preloadCriticalResources } from '../lib/performance';
import { CartItem } from '../types';

export default function AppWithNotifications() {
  const [showCheckout, setShowCheckout] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showBlog, setShowBlog] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showAminoAcidChainCategory, setShowAminoAcidChainCategory] = useState<'therapeutic' | 'cosmetic' | 'custom' | null>(null);
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
    setShowAccount(false);
    setShowDocumentation(false);
    setShowAbout(false);
    setShowContact(false);
    setShowBlog(false);
    setShowAdmin(false);
    setShowAminoAcidChainCategory(null);
    setAccountPage('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAminoAcidChainCategory = (category: 'therapeutic' | 'cosmetic' | 'custom') => {
    setShowCheckout(false);
    setShowOrderHistory(false);
    setShowAccount(false);
    setShowDocumentation(false);
    setShowAbout(false);
    setShowContact(false);
    setShowBlog(false);
    setShowAdmin(false);
    setAccountPage('dashboard');
    setShowAminoAcidChainCategory(category);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromAminoAcidChainCategory = () => {
    setShowAminoAcidChainCategory(null);
  };

  const handleCheckout = () => {
    handleHome();
    setShowCheckout(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleBackFromCheckout = () => setShowCheckout(false);
  const handleOrderHistory = () => {
    handleHome();
    setShowOrderHistory(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleBackFromOrderHistory = () => setShowOrderHistory(false);
  const handleAccount = () => {
    handleHome();
    setShowAccount(true);
    setAccountPage('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleBackFromAccount = () => {
    setShowAccount(false);
    setAccountPage('dashboard');
  };
  const handleDocumentation = () => {
    handleHome();
    setShowDocumentation(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleBackFromDocumentation = () => setShowDocumentation(false);
  const handleAbout = () => {
    handleHome();
    setShowAbout(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleBackFromAbout = () => setShowAbout(false);
  const handleContact = () => {
    handleHome();
    setShowContact(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleBackFromContact = () => setShowContact(false);
  const handleBlog = () => {
    handleHome();
    setShowBlog(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleBackFromBlog = () => setShowBlog(false);
  const handleAdmin = () => {
    setShowCheckout(false);
    setShowOrderHistory(false);
    setShowAccount(false);
    setShowDocumentation(false);
    setShowAbout(false);
    setShowContact(false);
    setShowBlog(false);
    setShowAminoAcidChainCategory(null);
    setAccountPage('dashboard');
    setShowAdmin(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
          onAminoAcidChainCategory={handleAminoAcidChainCategory}
          onOrderHistory={handleOrderHistory}
          onAccount={handleAccount}
          onDocumentation={handleDocumentation}
          onAbout={handleAbout}
          onContact={handleContact}
          onBlog={handleBlog}
          onAdmin={handleAdmin}
        />

        {showAminoAcidChainCategory && (
          <AminoAcidChainCategoryPage category={showAminoAcidChainCategory} onBack={handleBackFromAminoAcidChainCategory} />
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

        {showAccount && (
          <>
            {accountPage === 'dashboard' && (
              <AccountDashboard onNavigate={handleAccountNavigation} />
            )}
            {accountPage === 'profile' && (
              <UserProfilePage onBack={handleBackFromAccount} />
            )}
            {accountPage === 'research-profile' && (
              <ResearchProfilePage onBack={handleBackFromAccount} />
            )}
            {accountPage === 'saved-products' && (
              <SavedProductsPage onBack={handleBackFromAccount} />
            )}
            {accountPage === 'preferences' && (
              <PreferencesPage onBack={handleBackFromAccount} />
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

        {!showAminoAcidChainCategory && !showAdmin && !showCheckout && !showOrderHistory && !showAccount && !showDocumentation && !showAbout && !showContact && !showBlog && (
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
