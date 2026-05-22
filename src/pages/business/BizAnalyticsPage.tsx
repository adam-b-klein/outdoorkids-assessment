import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ShoppingBag, Gift, TrendingUp, Eye } from 'lucide-react';
import { supabase, Business, Reward, Redemption } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

type RedemptionWithReward = Redemption & { rewards?: Reward };

export default function BizAnalyticsPage() {
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<RedemptionWithReward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const { data: biz } = await supabase.from('businesses').select('*').eq('profile_id', user!.id).maybeSingle();
      setBusiness(biz);
      if (biz) {
        const { data: rwds } = await supabase.from('rewards').select('*').eq('business_id', biz.id);
        setRewards(rwds ?? []);
        if (rwds && rwds.length > 0) {
          const { data: redeem } = await supabase
            .from('redemptions')
            .select('*, rewards(*)')
            .in('reward_id', rwds.map((r) => r.id))
            .order('redeemed_at', { ascending: false });
          setRedemptions((redeem ?? []) as RedemptionWithReward[]);
        }
      }
      setLoading(false);
    }
    load();
  }, [user]);

  // Monthly redemptions for chart
  const monthlyData = (() => {
    const months: Record<string, { month: string; redemptions: number }> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toLocaleDateString('en-US', { month: 'short' });
      months[key] = { month: key, redemptions: 0 };
    }
    redemptions.forEach((r) => {
      const key = new Date(r.redeemed_at).toLocaleDateString('en-US', { month: 'short' });
      if (months[key]) months[key].redemptions++;
    });
    return Object.values(months);
  })();

  // Per-reward redemption counts
  const rewardStats = rewards.map((r) => ({
    ...r,
    redemptionCount: redemptions.filter((rd) => rd.reward_id === r.id).length,
  })).sort((a, b) => b.redemptionCount - a.redemptionCount);

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 text-sm mt-0.5">Track your rewards performance and family reach</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mb-3">
            <ShoppingBag className="w-5 h-5 text-emerald-700" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{redemptions.length}</div>
          <div className="text-sm text-gray-500 mt-0.5">Total redemptions</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center mb-3">
            <Gift className="w-5 h-5 text-sky-700" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{rewards.filter((r) => r.is_active).length}</div>
          <div className="text-sm text-gray-500 mt-0.5">Active rewards</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5 text-amber-700" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {redemptions.filter((r) => {
              const d = new Date(r.redeemed_at);
              const now = new Date();
              return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }).length}
          </div>
          <div className="text-sm text-gray-500 mt-0.5">This month</div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-sky-600" />
          <h2 className="font-bold text-gray-900 text-sm">Monthly Redemptions</h2>
        </div>
        {redemptions.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px' }}
              />
              <Bar dataKey="redemptions" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-44 flex items-center justify-center text-gray-400 text-sm">
            No redemption data yet
          </div>
        )}
      </div>

      {/* Reward performance */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Reward Performance</h2>
        </div>
        {rewardStats.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">Create rewards to see performance data</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {rewardStats.map((r) => (
              <div key={r.id} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-sky-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Gift className="w-4 h-4 text-sky-700" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{r.title}</div>
                    <div className="text-xs text-gray-400">{r.point_cost} pts · {r.reward_type.replace('_', ' ')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Eye className="w-4 h-4 text-gray-300" />
                  <span className="font-bold text-gray-900">{r.redemptionCount}</span>
                  <span className="text-gray-400 text-xs">redeemed</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent redemptions */}
      {redemptions.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 mt-6">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Recent Redemptions</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {redemptions.slice(0, 10).map((r) => (
              <div key={r.id} className="px-5 py-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-gray-900">{(r as RedemptionWithReward).rewards?.title ?? 'Reward'}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {new Date(r.redeemed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xs font-bold text-gray-400">{r.redemption_code}</div>
                  <div className={`text-xs capitalize mt-0.5 font-medium ${r.status === 'active' ? 'text-emerald-600' : 'text-gray-400'}`}>{r.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
