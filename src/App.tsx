import { useState } from 'react';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import ShippingIntegration from './components/ShippingIntegration';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import CheckoutPage from './components/CheckoutPage';
import OrderHistoryPage from './components/OrderHistoryPage';
import InventoryDashboard from './components/InventoryDashboard';
import AccountDashboard from './components/AccountDashboard';
import ResearchProfilePage from './components/ResearchProfilePage';
import SavedProductsPage from './components/SavedProductsPage';
import RealTimeInventoryWidget from './components/RealTimeInventoryWidget';
import ResearchDocumentationPage from './components/ResearchDocumentationPage';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import BlogPage from './components/BlogPage';
import AdminPanel from './components/AdminPanel';
import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';
import { preloadCriticalResources } from './lib/performance';

function App() {
  const [showCheckout, setShowCheckout] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showBlog, setShowBlog] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [accountPage, setAccountPage] = useState('dashboard');

  // Preload critical resources on app start
  useEffect(() => {
    const criticalImages = [
      'https://images.pexels.com/photos/3735747/pexels-photo-3735747.jpeg',
      'https://images.pexels.com/photos/3786126/pexels-photo-3786126.jpeg',
      'https://images.pexels.com/photos/3786157/pexels-photo-3786157.jpeg'
    ];
    preloadCriticalResources(criticalImages);
  }, []);

  const handleCheckout = () => {
    setShowCheckout(true);
  };

  const handleBackFromCheckout = () => {
    setShowCheckout(false);
  };

  const handleOrderHistory = () => {
    setShowOrderHistory(true);
  };

  const handleBackFromOrderHistory = () => {
    setShowOrderHistory(false);
  };

  const handleInventory = () => {
    setShowInventory(true);
  };

  const handleBackFromInventory = () => {
    setShowInventory(false);
  };

  const handleAccount = () => {
    setShowAccount(true);
    setAccountPage('dashboard');
  };

  const handleBackFromAccount = () => {
    setShowAccount(false);
    setAccountPage('dashboard');
  };

  const handleDocumentation = () => {
    setShowDocumentation(true);
  };

  const handleBackFromDocumentation = () => {
    setShowDocumentation(false);
  };

  const handleAbout = () => {
    setShowAbout(true);
  };

  const handleBackFromAbout = () => {
    setShowAbout(false);
  };

  const handleContact = () => {
    setShowContact(true);
  };

  const handleBackFromContact = () => {
    setShowContact(false);
  };

  const handleBlog = () => {
    setShowBlog(true);
  };

  const handleBackFromBlog = () => {
    setShowBlog(false);
  };

  const handleAdmin = () => {
    setShowAdmin(true);
  };

  const handleBackFromAdmin = () => {
    setShowAdmin(false);
  };

  const handleAccountNavigation = (page: string) => {
    if (page === 'order-history') {
      setShowAccount(false);
      setShowOrderHistory(true);
    } else {
      setAccountPage(page);
    }
  };
  if (showCheckout) {
  if (showAdmin) {
    return (
      <ErrorBoundary>
        <AuthProvider>
          <CartProvider>
            <div className="min-h-screen bg-gray-50">
              <AdminPanel onBack={handleBackFromAdmin} />
            </div>
          </CartProvider>
        </AuthProvider>
      </ErrorBoundary>
    );
  }

    return (
      <ErrorBoundary>
        <AuthProvider>
          <CartProvider>
          <div className="min-h-screen bg-gray-50">
            <CheckoutPage onBack={handleBackFromCheckout} />
          </div>
          </CartProvider>
        </AuthProvider>
      </ErrorBoundary>
    );
  }

  if (showOrderHistory) {
    return (
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-gray-50">
            <OrderHistoryPage onBack={handleBackFromOrderHistory} />
          </div>
        </CartProvider>
      </AuthProvider>
    );
  }

  if (showInventory) {
    return (
      <AuthProvider>
        <CartProvider>
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
          </div>
        </CartProvider>
      </AuthProvider>
    );
  }

  if (showAccount) {
    return (
      <AuthProvider>
        <CartProvider>
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
          </div>
        </CartProvider>
      </AuthProvider>
    );
  }

  if (showDocumentation) {
    return (
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-gray-50">
            <ResearchDocumentationPage onBack={handleBackFromDocumentation} />
          </div>
        </CartProvider>
      </AuthProvider>
    );
  }

  if (showAbout) {
    return (
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-gray-50">
            <AboutPage onBack={handleBackFromAbout} />
          </div>
        </CartProvider>
      </AuthProvider>
    );
  }

  if (showContact) {
    return (
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-gray-50">
            <ContactPage onBack={handleBackFromContact} />
          </div>
        </CartProvider>
      </AuthProvider>
    );
  }

  if (showBlog) {
    return (
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-gray-50">
            <BlogPage onBack={handleBackFromBlog} />
          </div>
        </CartProvider>
      </AuthProvider>
    );
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-gray-50">
            <Header 
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
          </div>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;