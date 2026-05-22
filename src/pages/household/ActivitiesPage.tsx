import { useEffect, useState } from 'react';
import { MapPin, Filter, Search, Clock, DollarSign, TreePine, BookOpen, Zap, Music, Users, Leaf, Star } from 'lucide-react';
import { supabase, Activity } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

type Props = {
  onNavigate: (page: string, data?: unknown) => void;
};

const TYPE_CONFIG: Record<string, { label: string; icon: typeof TreePine; color: string; bg: string }> = {
  outdoor:       { label: 'Outdoor',      icon: TreePine,  color: 'text-emerald-700', bg: 'bg-emerald-100' },
  learning:      { label: 'Learning',     icon: BookOpen,  color: 'text-sky-700',     bg: 'bg-sky-100' },
  physical:      { label: 'Physical',     icon: Zap,       color: 'text-orange-700',  bg: 'bg-orange-100' },
  cultural:      { label: 'Cultural',     icon: Music,     color: 'text-amber-700',   bg: 'bg-amber-100' },
  community:     { label: 'Community',    icon: Users,     color: 'text-teal-700',    bg: 'bg-teal-100' },
  entertainment: { label: 'Fun',          icon: Star,      color: 'text-pink-700',    bg: 'bg-pink-100' },
};

const MARKETS = [
  { value: 'portland', label: 'Portland, OR' },
  { value: 'san_francisco', label: 'San Francisco, CA' },
];

export default function ActivitiesPage({ onNavigate }: Props) {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [market, setMarket] = useState('portland');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [freeOnly, setFreeOnly] = useState(false);

  useEffect(() => {
    if (!user) return;
    async function loadMarket() {
      const { data: hh } = await supabase
        .from('households')
        .select('city')
        .eq('profile_id', user!.id)
        .maybeSingle();
      if (hh?.city) {
        setMarket(hh.city.toLowerCase().includes('san') ? 'san_francisco' : 'portland');
      }
    }
    loadMarket();
  }, [user]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      let query = supabase
        .from('activities')
        .select('*')
        .eq('is_active', true)
        .eq('market', market)
        .order('is_curated', { ascending: false })
        .order('name');

      if (freeOnly) query = query.eq('is_free', true);
      const { data } = await query;
      setActivities(data ?? []);
      setLoading(false);
    }
    load();
  }, [market, freeOnly]);

  const filtered = activities.filter((a) => {
    if (typeFilter && !a.activity_type.includes(typeFilter)) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.city.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activities</h1>
          <p className="text-gray-500 text-sm mt-0.5">Find outdoor, educational, and cultural experiences nearby</p>
        </div>
        <button
          onClick={() => onNavigate('checkin')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors self-start"
        >
          <MapPin className="w-4 h-4" />
          Check In
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search activities..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm transition-all"
            />
          </div>
          <select
            value={market}
            onChange={(e) => setMarket(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm font-medium transition-all"
          >
            {MARKETS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          {Object.entries(TYPE_CONFIG).map(([key, { label, icon: Icon, color, bg }]) => (
            <button
              key={key}
              onClick={() => setTypeFilter(typeFilter === key ? null : key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                typeFilter === key ? `${bg} ${color} ring-1 ring-current` : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-3 h-3" />
              {label}
            </button>
          ))}
          <button
            onClick={() => setFreeOnly(!freeOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              freeOnly ? 'bg-green-100 text-green-700 ring-1 ring-current' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <DollarSign className="w-3 h-3" />
            Free Only
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
              <div className="h-40 bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Leaf className="w-7 h-7 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">No activities found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} onSelect={() => onNavigate('activity-detail', activity)} />
          ))}
        </div>
      )}
    </div>
  );
}

function ActivityCard({ activity, onSelect }: { activity: Activity; onSelect: () => void }) {
  const primaryType = activity.activity_type?.[0] ?? 'outdoor';
  const config = TYPE_CONFIG[primaryType] ?? TYPE_CONFIG.outdoor;
  const Icon = config.icon;

  return (
    <button
      onClick={onSelect}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-gray-200 transition-all text-left group"
    >
      <div className="relative h-44 overflow-hidden">
        {activity.image_url ? (
          <img
            src={activity.image_url}
            alt={activity.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <Icon className="w-10 h-10 text-gray-300" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {activity.is_curated && (
            <span className="bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">Curated</span>
          )}
          {activity.is_free && (
            <span className="bg-white/90 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">Free</span>
          )}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1">{activity.name}</h3>
        <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{activity.city}, {activity.state}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex gap-1 flex-wrap">
            {activity.activity_type.slice(0, 2).map((t) => {
              const c = TYPE_CONFIG[t];
              if (!c) return null;
              return (
                <span key={t} className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.bg} ${c.color}`}>
                  {c.label}
                </span>
              );
            })}
          </div>
          <div className="flex items-center gap-1 text-xs text-amber-600 font-semibold flex-shrink-0">
            <Clock className="w-3 h-3" />
            {activity.points_per_hour}pts/hr
          </div>
        </div>
      </div>
    </button>
  );
}
