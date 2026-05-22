import { useEffect, useState, ReactNode } from 'react';
import { useAuth, AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import OnboardingPage from './pages/OnboardingPage';
import HouseholdNav from './components/HouseholdNav';

// Household pages
import HouseholdDashboard from './pages/household/Dashboard';
import ActivitiesPage from './pages/household/ActivitiesPage';
import CheckInPage from './pages/household/CheckInPage';
import RewardsPage from './pages/household/RewardsPage';
import HouseholdAnalyticsPage from './pages/household/AnalyticsPage';
import ProfilePage from './pages/household/ProfilePage';

// Business pages
import BizDashboard from './pages/business/BizDashboard';
import BizRewardsPage from './pages/business/BizRewardsPage';
import BizProfilePage from './pages/business/BizProfilePage';
import BizAnalyticsPage from './pages/business/BizAnalyticsPage';

type Screen = string;

function AppInner() {
  const { user, profile, loading, signOut } = useAuth();
  const [screen, setScreen] = useState<Screen>('landing');
  const [navData, setNavData] = useState<unknown>(undefined);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'success') {
      window.history.replaceState({}, '', '/');
    }
  }, []);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      if (screen !== 'auth-signin' && screen !== 'auth-signup') {
        setScreen('landing');
      }
      return;
    }

    if (!profile || !profile.onboarding_completed) {
      setScreen('onboarding');
      return;
    }

    if (['landing', 'auth-signin', 'auth-signup', 'onboarding'].includes(screen)) {
      setScreen(profile.role === 'business' ? 'biz-dashboard' : 'household-dashboard');
    }
  }, [user, profile, loading]);

  function navigate(page: string, data?: unknown) {
    if (page === 'signout') {
      signOut().then(() => setScreen('landing'));
      return;
    }
    setNavData(data);
    setScreen(page);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (screen === 'landing') {
    return (
      <LandingPage
        onGetStarted={() => setScreen('auth-signup')}
        onSignIn={() => setScreen('auth-signin')}
        onGoToDashboard={user && profile?.onboarding_completed
          ? () => setScreen(profile.role === 'business' ? 'biz-dashboard' : 'household-dashboard')
          : undefined}
      />
    );
  }

  if (screen === 'auth-signin' || screen === 'auth-signup') {
    return (
      <AuthPage
        onBack={() => setScreen('landing')}
        initialMode={screen === 'auth-signup' ? 'signup' : 'signin'}
      />
    );
  }

  if (screen === 'onboarding') {
    return <OnboardingPage />;
  }

  if (profile?.role === 'household') {
    let content: ReactNode;
    switch (screen) {
      case 'activities': content = <ActivitiesPage onNavigate={navigate} />; break;
      case 'checkin': content = <CheckInPage onNavigate={navigate} selectedActivity={navData as never} />; break;
      case 'rewards': content = <RewardsPage onNavigate={navigate} />; break;
      case 'analytics': content = <HouseholdAnalyticsPage />; break;
      case 'profile': content = <ProfilePage />; break;
      default: content = <HouseholdDashboard onNavigate={navigate} />; break;
    }
    return (
      <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
        <HouseholdNav current={screen} onNavigate={navigate} />
        {content}
      </div>
    );
  }

  if (profile?.role === 'business') {
    switch (screen) {
      case 'biz-rewards': return <BizRewardsPage onNavigate={navigate} />;
      case 'biz-profile': return <BizProfilePage />;
      case 'biz-analytics': return <BizAnalyticsPage />;
      default: return <BizDashboard onNavigate={navigate} />;
    }
  }

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
