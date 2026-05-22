import { TreePine, LayoutDashboard, MapPin, Award, BarChart2, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type Props = {
  current: string;
  onNavigate: (page: string) => void;
};

const NAV_ITEMS = [
  { page: 'household-dashboard', label: 'Home', icon: LayoutDashboard },
  { page: 'activities', label: 'Activities', icon: MapPin },
  { page: 'checkin', label: 'Check In', icon: TreePine },
  { page: 'rewards', label: 'Rewards', icon: Award },
  { page: 'analytics', label: 'Progress', icon: BarChart2 },
  { page: 'profile', label: 'Profile', icon: User },
];

export default function HouseholdNav({ current, onNavigate }: Props) {
  const { signOut } = useAuth();

  return (
    <>
      {/* Top nav bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 h-14 flex items-center px-4 justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center">
            <TreePine className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-base tracking-tight">OutdoorKids</span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(({ page, label, icon: Icon }) => (
            <button
              key={page}
              onClick={() => onNavigate(page)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                current === page
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>

        <button
          onClick={() => signOut()}
          className="hidden md:flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors px-2 py-1.5 rounded-lg hover:bg-gray-50"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </header>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 flex">
        {NAV_ITEMS.map(({ page, label, icon: Icon }) => (
          <button
            key={page}
            onClick={() => onNavigate(page)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-xs font-medium transition-colors ${
              current === page ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            <Icon className={`w-5 h-5 ${current === page ? 'stroke-[2.5]' : ''}`} />
            {label}
          </button>
        ))}
      </nav>

      {/* Spacers so content isn't hidden behind nav bars */}
      <div className="h-14" />
    </>
  );
}
