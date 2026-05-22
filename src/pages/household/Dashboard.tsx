import { useEffect, useState } from 'react';
import { Award, MapPin, Clock, TrendingUp, ChevronRight, TreePine, Zap } from 'lucide-react';
import { supabase, Household, ActivityLog } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

type Props = {
  onNavigate: (page: string) => void;
};

const TYPE_COLORS: Record<string, string> = {
  outdoor: 'bg-emerald-100 text-emerald-700',
  learning: 'bg-sky-100 text-sky-700',
  physical: 'bg-orange-100 text-orange-700',
  cultural: 'bg-amber-100 text-amber-700',
  entertainment: 'bg-pink-100 text-pink-700',
  community: 'bg-teal-100 text-teal-700',
};

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function HouseholdDashboard({ onNavigate }: Props) {
  const { user } = useAuth();
  const [household, setHousehold] = useState<Household | null>(null);
  const [recentLogs, setRecentLogs] = useState<ActivityLog[]>([]);
  const [weeklyMinutes, setWeeklyMinutes] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const { data: hh } = await supabase
        .from('households')
        .select('*')
        .eq('profile_id', user!.id)
        .maybeSingle();
      setHousehold(hh);

      if (hh) {
        const { data: logs } = await supabase
          .from('activity_logs')
          .select('*')
          .eq('household_id', hh.id)
          .order('check_in_at', { ascending: false })
          .limit(5);
        setRecentLogs(logs ?? []);

        const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
        const { data: weekLogs } = await supabase
          .from('activity_logs')
          .select('duration_minutes')
          .eq('household_id', hh.id)
          .gte('check_in_at', weekAgo);
        setWeeklyMinutes((weekLogs ?? []).reduce((sum, l) => sum + (l.duration_minutes ?? 0), 0));
      }
      setLoading(false);
    }
    load();
  }, [user]);

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-5xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="grid grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}
          </div>
        </div>
      </div>
    );
  }

  const points = household?.points_balance ?? 0;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back{household?.household_name ? `, ${household.household_name}` : ''}!
        </h1>
        <p className="text-gray-500 text-sm mt-1">Here's your family's outdoor activity summary.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Award className="w-5 h-5 text-emerald-700" />
            </div>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Balance</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{points.toLocaleString()}</div>
          <div className="text-sm text-gray-500 mt-0.5">Points available</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-sky-700" />
            </div>
            <span className="text-xs font-medium text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">This week</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{formatDuration(weeklyMinutes)}</div>
          <div className="text-sm text-gray-500 mt-0.5">Outdoor time</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-700" />
            </div>
            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Lifetime</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{(household?.total_points_earned ?? 0).toLocaleString()}</div>
          <div className="text-sm text-gray-500 mt-0.5">Total points earned</div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => onNavigate('checkin')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl p-5 text-left transition-all hover:scale-[1.02] flex items-center justify-between group shadow-lg shadow-emerald-100"
        >
          <div>
            <div className="font-bold text-lg mb-1">Check In Now</div>
            <div className="text-emerald-100 text-sm">Log an outdoor activity and earn points</div>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
            <MapPin className="w-6 h-6 text-white" />
          </div>
        </button>

        <button
          onClick={() => onNavigate('rewards')}
          className="bg-white hover:shadow-md border border-gray-100 rounded-2xl p-5 text-left transition-all flex items-center justify-between group"
        >
          <div>
            <div className="font-bold text-lg text-gray-900 mb-1">Redeem Rewards</div>
            <div className="text-gray-500 text-sm">{points > 0 ? `You have ${points} points to spend` : 'Earn points to unlock rewards'}</div>
          </div>
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center group-hover:bg-amber-200 transition-colors">
            <Award className="w-6 h-6 text-amber-700" />
          </div>
        </button>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Recent Check-ins</h2>
          <button
            onClick={() => onNavigate('analytics')}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 transition-colors"
          >
            View all <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {recentLogs.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <TreePine className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm font-medium">No check-ins yet</p>
            <p className="text-gray-400 text-xs mt-1">Head outside and log your first activity!</p>
            <button
              onClick={() => onNavigate('activities')}
              className="mt-4 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Browse activities →
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentLogs.map((log) => (
              <div key={log.id} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <TreePine className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{log.custom_activity_name || 'Activity'}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400">{timeAgo(log.check_in_at)}</span>
                      {log.activity_types?.length > 0 && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[log.activity_types[0]] ?? 'bg-gray-100 text-gray-600'}`}>
                          {log.activity_types[0]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <div>
                    <div className="text-xs text-gray-400">{formatDuration(log.duration_minutes)}</div>
                    <div className="flex items-center gap-1 text-sm font-bold text-emerald-600">
                      <Zap className="w-3 h-3" />
                      +{log.points_earned}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
