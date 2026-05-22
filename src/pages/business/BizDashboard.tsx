import { useEffect, useState } from 'react';
import { Gift, ShoppingBag, TrendingUp, Plus, ChevronRight, Building2, Star, Eye } from 'lucide-react';
import { supabase, Business, Reward } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

type Props = {
  onNavigate: (page: string) => void;
};

export default function BizDashboard({ onNavigate }: Props) {
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptionCount, setRedemptionCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const { data: biz } = await supabase.from('businesses').select('*').eq('profile_id', user!.id).maybeSingle();
      setBusiness(biz);
      if (biz) {
        const { data: rwds } = await supabase.from('rewards').select('*').eq('business_id', biz.id).order('created_at', { ascending: false });
        setRewards(rwds ?? []);

        const { count } = await supabase
          .from('redemptions')
          .select('id', { count: 'exact', head: true })
          .in('reward_id', (rwds ?? []).map((r) => r.id));
        setRedemptionCount(count ?? 0);
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

  const activeRewards = rewards.filter((r) => r.is_active);

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
            <Building2 className="w-5 h-5 text-sky-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{business?.business_name ?? 'Business Dashboard'}</h1>
            <p className="text-gray-400 text-xs capitalize">{business?.category} · {business?.city}, {business?.state}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center mb-3">
            <Gift className="w-5 h-5 text-sky-700" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{activeRewards.length}</div>
          <div className="text-sm text-gray-500 mt-0.5">Active rewards</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mb-3">
            <ShoppingBag className="w-5 h-5 text-emerald-700" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{redemptionCount}</div>
          <div className="text-sm text-gray-500 mt-0.5">Total redemptions</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5 text-amber-700" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{rewards.filter((r) => r.is_promoted).length}</div>
          <div className="text-sm text-gray-500 mt-0.5">Promoted rewards</div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => onNavigate('biz-rewards')}
          className="bg-sky-600 hover:bg-sky-700 text-white rounded-2xl p-5 text-left transition-all hover:scale-[1.02] flex items-center justify-between group shadow-lg shadow-sky-100"
        >
          <div>
            <div className="font-bold text-lg mb-1">Add New Reward</div>
            <div className="text-sky-100 text-sm">Create a reward for families to redeem</div>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Plus className="w-6 h-6 text-white" />
          </div>
        </button>

        <button
          onClick={() => onNavigate('biz-analytics')}
          className="bg-white hover:shadow-md border border-gray-100 rounded-2xl p-5 text-left transition-all flex items-center justify-between group"
        >
          <div>
            <div className="font-bold text-lg text-gray-900 mb-1">View Analytics</div>
            <div className="text-gray-500 text-sm">See redemption trends and reach</div>
          </div>
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-amber-700" />
          </div>
        </button>
      </div>

      {/* Recent rewards */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Your Rewards</h2>
          <button
            onClick={() => onNavigate('biz-rewards')}
            className="text-xs text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1"
          >
            Manage all <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {rewards.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Gift className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm font-medium">No rewards yet</p>
            <p className="text-gray-400 text-xs mt-1">Create your first reward to start reaching families</p>
            <button
              onClick={() => onNavigate('biz-rewards')}
              className="mt-4 text-sm text-sky-600 hover:text-sky-700 font-medium"
            >
              Create a reward →
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {rewards.slice(0, 5).map((reward) => (
              <div key={reward.id} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-sky-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Gift className="w-4 h-4 text-sky-700" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{reward.title}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400">{reward.point_cost} pts</span>
                      {reward.is_promoted && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                          <Star className="w-2.5 h-2.5" /> Promoted
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Eye className="w-3 h-3" />
                    {reward.quantity_redeemed} redeemed
                  </div>
                  <div className={`w-2 h-2 rounded-full ${reward.is_active ? 'bg-emerald-400' : 'bg-gray-300'}`} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
