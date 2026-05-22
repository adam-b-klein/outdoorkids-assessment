import { ReactNode, useState } from 'react';
import { TreePine, LayoutDashboard, MapPin, Award, BarChart2, User, LogOut, Menu, X, Building2, Gift, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type Page = string;

type Props = {
  children: ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
};

export default function Layout({ children, currentPage, onNavigate }: Props) {
  const { profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isHousehold = profile?.role === 'household';

  const householdNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'activities', label: 'Activities', icon: MapPin },
    { id: 'rewards', label: 'Rewards', icon: Award },
    { id: 'analytics', label: 'My Activity', icon: BarChart2 },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const businessNav = [
    { id: 'biz-dashboard', label: 'Dashboard', icon: Building2 },
    { id: 'biz-rewards', label: 'My Rewards', icon: Gift },
    { id: 'biz-analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'biz-profile', label: 'Profile', icon: User },
  ];

  const navItems = isHousehold ? householdNav : businessNav;

  function NavContent() {
    return (
      <>
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2.5 px-4 py-5 border-b border-gray-100 w-full hover:bg-gray-50 transition-colors"
        >
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <TreePine className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-base tracking-tight">OutdoorKids</span>
        </button>

        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { onNavigate(id); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                currentPage === id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <div className="px-3 py-2 mb-1">
            <div className="text-xs font-semibold text-gray-900 truncate">{profile?.full_name || profile?.email}</div>
            <div className="text-xs text-gray-500 capitalize">{profile?.role}</div>
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-100 fixed inset-y-0 left-0 z-30">
        <NavContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <TreePine className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-gray-900 text-sm">OutdoorKids</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-0.5">
              {navItems.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => { onNavigate(id); setMobileOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    currentPage === id
                      ? 'bg-emerald-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </nav>
            <div className="p-3 border-t border-gray-100">
              <button
                onClick={signOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Mobile topbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-100 h-14 flex items-center px-4 gap-3">
        <button onClick={() => setMobileOpen(true)} className="text-gray-600 hover:text-gray-900">
          <Menu className="w-5 h-5" />
        </button>
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-6 h-6 bg-emerald-600 rounded flex items-center justify-center">
            <TreePine className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-sm">OutdoorKids</span>
        </button>
      </div>

      {/* Main content */}
      <main className="flex-1 md:ml-56 pt-14 md:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
