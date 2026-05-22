import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Clock, Award, TreePine, MapPin, TrendingUp, Zap } from 'lucide-react';
import { supabase, ActivityLog, Household } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const TYPE_COLORS: Record<string, string> = {
  outdoor: '#10b981',
  learning: '#0ea5e9',
  physical: '#f97316',
  cultural: '#f59e0b',
  entertainment: '#ec4899',
  community: '#14b8a6',
};

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [household, setHousehold] = useState<Household | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    if (!user) return;
    async function load() {
      const { data: hh } = await supabase.from('households').select('*').eq('profile_id', user!.id).maybeSingle();
      setHousehold(hh);
      if (hh) {
        const { data } = await supabase
          .from('activity_logs')
          .select('*')
          .eq('household_id', hh.id)
          .order('check_in_at', { ascending: false });
        setLogs(data ?? []);
      }
      setLoading(false);
    }
    load();
  }, [user]);

  function getPeriodStart() {
    const now = new Date();
    if (period === 'week') return new Date(now.getTime() - 7 * 86400000);
    if (period === 'month') return new Date(now.getFullYear(), now.getMonth(), 1);
    return new Date(now.getFullYear(), 0, 1);
  }

  const periodLogs = logs.filter((l) => new Date(l.check_in_at) >= getPeriodStart());

  const totalMinutes = periodLogs.reduce((sum, l) => sum + (l.duration_minutes ?? 0), 0);
  const totalPoints = periodLogs.reduce((sum, l) => sum + (l.points_earned ?? 0), 0);
  const totalSessions = periodLogs.length;

  // Bar chart data: group by week
  const weeklyData = (() => {
    const weeks: Record<string, { week: string; minutes: number; points: number }> = {};
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 7 * 86400000);
      const key = `${d.getMonth() + 1}/${d.getDate()}`;
      weeks[key] = { week: key, minutes: 0, points: 0 };
    }
    periodLogs.forEach((l) => {
      const d = new Date(l.check_in_at);
      const weeksAgo = Math.floor((now.getTime() - d.getTime()) / (7 * 86400000));
      if (weeksAgo <= 11) {
        const key = `${d.getMonth() + 1}/${d.getDate()}`;
        if (!weeks[key]) return;
        weeks[key].minutes += l.duration_minutes ?? 0;
        weeks[key].points += l.points_earned ?? 0;
      }
    });
    return Object.values(weeks).slice(-8);
  })();

  // Pie chart: type breakdown
  const typeCounts: Record<string, number> = {};
  periodLogs.forEach((l) => {
    (l.activity_types ?? []).forEach((t: string) => {
      typeCounts[t] = (typeCounts[t] ?? 0) + (l.duration_minutes ?? 0);
    });
  });
  const pieData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));

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

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Activity</h1>
          <p className="text-gray-500 text-sm mt-0.5">Track your family's outdoor time and progress</p>
        </div>
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1">
          {(['week', 'month', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${period === p ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Balance', value: (household?.points_balance ?? 0).toLocaleString(), sub: 'pts', icon: Award, color: 'bg-emerald-100 text-emerald-700' },
          { label: 'Time Outside', value: formatDuration(totalMinutes), sub: 'this period', icon: Clock, color: 'bg-sky-100 text-sky-700' },
          { label: 'Check-ins', value: totalSessions, sub: 'sessions', icon: MapPin, color: 'bg-orange-100 text-orange-700' },
          { label: 'Points Earned', value: totalPoints, sub: 'this period', icon: Zap, color: 'bg-amber-100 text-amber-700' },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="text-xl font-bold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            <div className="text-xs text-gray-400">{sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Bar chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <h2 className="font-bold text-gray-900 text-sm">Weekly Outdoor Time (minutes)</h2>
          </div>
          {weeklyData.some((d) => d.minutes > 0) ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px' }}
                  formatter={(val: number) => [`${val} min`, 'Time']}
                />
                <Bar dataKey="minutes" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-44 flex items-center justify-center text-gray-400 text-sm">
              No data yet — start checking in!
            </div>
          )}
        </div>

        {/* Pie chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-bold text-gray-900 text-sm mb-4">Activity Breakdown</h2>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={TYPE_COLORS[entry.name] ?? '#e5e7eb'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px' }}
                    formatter={(val: number, name: string) => [`${formatDuration(val)}`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-3">
                {pieData.map((d) => (
                  <div key={d.name} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: TYPE_COLORS[d.name] ?? '#e5e7eb' }} />
                    <span className="capitalize text-gray-600 flex-1">{d.name}</span>
                    <span className="font-semibold text-gray-900">{formatDuration(d.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-44 flex items-center justify-center text-gray-400 text-sm text-center">
              Log activities to see your breakdown
            </div>
          )}
        </div>
      </div>

      {/* Recent logs */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Check-in History</h2>
        </div>
        {logs.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <TreePine className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">No check-ins yet. Get outside!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {logs.slice(0, 20).map((log) => (
              <div key={log.id} className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <TreePine className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{log.custom_activity_name || 'Activity'}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(log.check_in_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">{formatDuration(log.duration_minutes)}</div>
                  <div className="text-sm font-bold text-emerald-600">+{log.points_earned} pts</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
