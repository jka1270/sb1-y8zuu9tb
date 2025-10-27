import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ErrorBoundary from './components/ErrorBoundary';
import AppWithNotifications from './components/AppWithNotifications';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <AppWithNotifications />
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;