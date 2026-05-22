import { useEffect, useState } from 'react';
import {
  Award, Filter, Search, Gift, Tag, Ticket, ShoppingBag, Zap, Star, X,
  CheckCircle, MapPin, ChevronRight, Clock, TrendingUp, Sparkles, Rocket,
} from 'lucide-react';
import { supabase, Reward, Business, Household } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

type Props = {
  onNavigate: (page: string) => void;
};

const REWARD_TYPE_CONFIG: Record<string, { label: string; icon: typeof Gift; color: string; bg: string; border: string }> = {
  gift_card:  { label: 'Gift Card',   icon: Gift,        color: 'text-emerald-700', bg: 'bg-emerald-50',  border: 'border-emerald-200' },
  coupon:     { label: 'Coupon',      icon: Tag,         color: 'text-sky-700',     bg: 'bg-sky-50',      border: 'border-sky-200' },
  event_pass: { label: 'Event Pass',  icon: Ticket,      color: 'text-amber-700',   bg: 'bg-amber-50',    border: 'border-amber-200' },
  discount:   { label: 'Discount',    icon: Star,        color: 'text-pink-700',    bg: 'bg-pink-50',     border: 'border-pink-200' },
  freebie:    { label: 'Free Item',   icon: ShoppingBag, color: 'text-teal-700',    bg: 'bg-teal-50',     border: 'border-teal-200' },
};

// Pexels images matched to business categories
const CATEGORY_IMAGES: Record<string, string> = {
  retail:        'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=600',
  education:     'https://images.pexels.com/photos/256455/pexels-photo-256455.jpeg?auto=compress&cs=tinysrgb&w=600',
  entertainment: 'https://images.pexels.com/photos/3874340/pexels-photo-3874340.jpeg?auto=compress&cs=tinysrgb&w=600',
  restaurant:    'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600',
  arts:          'https://images.pexels.com/photos/1148998/pexels-photo-1148998.jpeg?auto=compress&cs=tinysrgb&w=600',
  sports:        'https://images.pexels.com/photos/207666/pexels-photo-207666.jpeg?auto=compress&cs=tinysrgb&w=600',
  outdoor:       'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=600',
  health:        'https://images.pexels.com/photos/703016/pexels-photo-703016.jpeg?auto=compress&cs=tinysrgb&w=600',
  other:         'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=600',
};

type RewardWithBusiness = Reward & { businesses?: Business; is_sponsored?: boolean };

export default function RewardsPage({ onNavigate }: Props) {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<RewardWithBusiness[]>([]);
  const [household, setHousehold] = useState<Household | null>(null);
  const [market, setMarket] = useState<string>('portland');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [selected, setSelected] = useState<RewardWithBusiness | null>(null);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemSuccess, setRedeemSuccess] = useState('');
  const [redeemError, setRedeemError] = useState('');
  const [redemptionCount, setRedemptionCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const { data: hh } = await supabase
        .from('households')
        .select('*')
        .eq('profile_id', user!.id)
        .maybeSingle();
      setHousehold(hh);

      const mkt = hh?.city?.toLowerCase().includes('san') ? 'san_francisco' : 'portland';
      setMarket(mkt);

      const now = new Date().toISOString();
      const [{ data: rewardsData }, { count }, { data: activePromos }] = await Promise.all([
        supabase
          .from('rewards')
          .select('*, businesses(*)')
          .eq('is_active', true)
          .eq('market', mkt)
          .order('is_sponsored', { ascending: false })
          .order('is_promoted', { ascending: false })
          .order('point_cost'),
        supabase
          .from('redemptions')
          .select('*', { count: 'exact', head: true })
          .eq('household_id', hh?.id ?? ''),
        supabase
          .from('reward_promotions')
          .select('reward_id')
          .eq('status', 'active')
          .gt('ends_at', now),
      ]);

      const sponsoredIds = new Set((activePromos ?? []).map((p: { reward_id: string }) => p.reward_id));
      setRewards(
        (rewardsData ?? []).map((r) => ({
          ...r,
          is_sponsored: sponsoredIds.has(r.id),
        })) as RewardWithBusiness[]
      );
      setRedemptionCount(count ?? 0);
      setLoading(false);
    }
    load();
  }, [user]);

  async function handleRedeem() {
    if (!selected || !household) return;
    if ((household.points_balance ?? 0) < selected.point_cost) {
      setRedeemError('Not enough points to redeem this reward.');
      return;
    }
    setRedeeming(true);
    setRedeemError('');

    const code = Math.random().toString(36).substring(2, 10).toUpperCase();

    const { error: rErr } = await supabase.from('redemptions').insert({
      household_id: household.id,
      reward_id: selected.id,
      points_spent: selected.point_cost,
      redemption_code: code,
      status: 'active',
    });

    if (!rErr) {
      const newBalance = (household.points_balance ?? 0) - selected.point_cost;
      await supabase.from('households')
        .update({ points_balance: newBalance })
        .eq('id', household.id);

      await supabase.from('points_ledger').insert({
        household_id: household.id,
        type: 'spent',
        amount: selected.point_cost,
        description: `Redeemed: ${selected.title}`,
      });

      setHousehold((prev) => prev ? { ...prev, points_balance: newBalance } : prev);
      setRedemptionCount((c) => c + 1);
      setRedeemSuccess(code);
    } else {
      setRedeemError('Redemption failed. Please try again.');
    }
    setRedeeming(false);
  }

  const filtered = rewards.filter((r) => {
    if (typeFilter && r.reward_type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const bname = (r.businesses?.business_name ?? '').toLowerCase();
      if (!r.title.toLowerCase().includes(q) && !bname.includes(q)) return false;
    }
    return true;
  });

  const sponsored = filtered.filter((r) => r.is_sponsored);
  const featured = filtered.filter((r) => r.is_promoted && !r.is_sponsored);
  const rest = filtered.filter((r) => !r.is_promoted && !r.is_sponsored);
  const points = household?.points_balance ?? 0;
  const cityLabel = market === 'san_francisco' ? 'San Francisco' : 'Portland';

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rewards</h1>
          <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            {cityLabel} rewards
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          <StatPill icon={Award} value={points.toLocaleString()} label="Points" color="emerald" />
          <StatPill icon={CheckCircle} value={redemptionCount.toString()} label="Redeemed" color="sky" />
          <StatPill icon={TrendingUp} value={rewards.length.toString()} label="Available" color="amber" />
        </div>
      </div>

      {/* Earn more banner */}
      <div
        className="relative mb-6 rounded-2xl overflow-hidden cursor-pointer group"
        onClick={() => onNavigate('checkin')}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-emerald-500" />
        <div className="relative px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">Need more points?</div>
              <div className="text-emerald-100 text-xs">Check in at a local activity to keep earning</div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-white text-sm font-semibold bg-white/20 rounded-xl px-3 py-1.5 group-hover:bg-white/30 transition-colors flex-shrink-0">
            Check In <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rewards or businesses..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm transition-all"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          {Object.entries(REWARD_TYPE_CONFIG).map(([key, { label, icon: Icon, color, bg }]) => (
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
          {(typeFilter || search) && (
            <button
              onClick={() => { setTypeFilter(null); setSearch(''); }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-8">
          {/* Sponsored */}
          {sponsored.length > 0 && (
            <section>
              <SectionHeader icon={Rocket} label="Sponsored" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sponsored.map((r) => (
                  <RewardCard key={r.id} reward={r} points={points} onSelect={() => setSelected(r)} sponsored />
                ))}
              </div>
            </section>
          )}

          {/* Featured */}
          {featured.length > 0 && (
            <section>
              <SectionHeader icon={Sparkles} label="Featured Rewards" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {featured.map((r) => (
                  <RewardCard key={r.id} reward={r} points={points} onSelect={() => setSelected(r)} featured />
                ))}
              </div>
            </section>
          )}

          {/* All rewards */}
          {rest.length > 0 && (
            <section>
              <SectionHeader icon={Gift} label={featured.length > 0 || sponsored.length > 0 ? 'All Rewards' : 'Available Rewards'} />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {rest.map((r) => (
                  <RewardCard key={r.id} reward={r} points={points} onSelect={() => setSelected(r)} />
                ))}
              </div>
            </section>
          )}

          {/* How it works */}
          <section className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-emerald-600" />
              How Rewards Work
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { step: '1', title: 'Earn points', desc: 'Check in at parks, libraries, and kid-friendly spots. You earn points for every hour spent.' },
                { step: '2', title: 'Browse & pick', desc: 'Choose from gift cards, coupons, free items, and event passes from local businesses.' },
                { step: '3', title: 'Redeem & enjoy', desc: 'Show your redemption code at the business and enjoy your reward with your family.' },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex gap-3">
                  <div className="w-6 h-6 bg-emerald-600 text-white rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{step}</div>
                  <div>
                    <div className="text-sm font-bold text-gray-900 mb-0.5">{title}</div>
                    <div className="text-xs text-gray-500 leading-relaxed">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Redemption modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            {redeemSuccess ? (
              <SuccessView
                code={redeemSuccess}
                reward={selected}
                onClose={() => { setSelected(null); setRedeemSuccess(''); }}
              />
            ) : (
              <ConfirmView
                reward={selected}
                points={points}
                redeeming={redeeming}
                error={redeemError}
                onConfirm={handleRedeem}
                onClose={() => { setSelected(null); setRedeemError(''); }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatPill({ icon: Icon, value, label, color }: { icon: typeof Award; value: string; label: string; color: string }) {
  const colors: Record<string, string> = {
    emerald: 'bg-emerald-50 border-emerald-100',
    sky: 'bg-sky-50 border-sky-100',
    amber: 'bg-amber-50 border-amber-100',
  };
  const iconColors: Record<string, string> = {
    emerald: 'text-emerald-600',
    sky: 'text-sky-600',
    amber: 'text-amber-600',
  };
  return (
    <div className={`${colors[color]} border rounded-2xl px-4 py-2.5 flex items-center gap-2.5`}>
      <Icon className={`w-4 h-4 ${iconColors[color]}`} />
      <div>
        <div className="text-base font-bold text-gray-900 leading-none">{value}</div>
        <div className="text-xs text-gray-500 mt-0.5">{label}</div>
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, label }: { icon: typeof Gift; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-4 h-4 text-gray-400" />
      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</span>
    </div>
  );
}

function RewardCard({
  reward, points, onSelect, featured = false, sponsored = false,
}: {
  reward: RewardWithBusiness;
  points: number;
  onSelect: () => void;
  featured?: boolean;
  sponsored?: boolean;
}) {
  const config = REWARD_TYPE_CONFIG[reward.reward_type] ?? REWARD_TYPE_CONFIG.coupon;
  const Icon = config.icon;
  const canAfford = points >= reward.point_cost;
  const biz = reward.businesses;
  const img = CATEGORY_IMAGES[biz?.category ?? 'other'] ?? CATEGORY_IMAGES.other;

  const remaining = reward.quantity_available != null
    ? reward.quantity_available - reward.quantity_redeemed
    : null;
  const lowStock = remaining != null && remaining <= 20;

  const borderClass = sponsored
    ? 'border-orange-200 ring-1 ring-orange-100'
    : featured
      ? 'border-amber-200 ring-1 ring-amber-100'
      : 'border-gray-100 hover:border-gray-200';

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden flex flex-col group transition-all hover:shadow-md ${borderClass}`}>
      {/* Image */}
      <div className="relative h-36 overflow-hidden bg-gray-100 flex-shrink-0">
        <img
          src={img}
          alt={biz?.business_name ?? ''}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        {sponsored && (
          <div className="absolute top-2.5 left-2.5 bg-orange-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Zap className="w-2.5 h-2.5" /> Sponsored
          </div>
        )}
        {!sponsored && featured && (
          <div className="absolute top-2.5 left-2.5 bg-amber-400 text-white text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" /> Featured
          </div>
        )}
        {lowStock && (
          <div className="absolute top-2.5 right-2.5 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {remaining} left
          </div>
        )}
        <div className="absolute bottom-2.5 left-3 right-3">
          <div className="text-white font-bold text-xs truncate">{biz?.business_name}</div>
          <div className="flex items-center gap-1 text-white/70 text-xs">
            <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
            {biz?.city}, {biz?.state}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-bold text-gray-900 text-sm leading-snug flex-1">{reward.title}</h3>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${config.bg} ${config.color} border ${config.border}`}>
            <Icon className="w-3 h-3 inline mr-0.5 -mt-px" />
            {config.label}
          </span>
        </div>
        <p className="text-xs text-gray-500 mb-4 leading-relaxed line-clamp-2 flex-1">{reward.description}</p>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-1 font-bold text-gray-900">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-sm">{reward.point_cost.toLocaleString()}</span>
            <span className="text-xs text-gray-400 font-normal">pts</span>
          </div>
          <button
            onClick={onSelect}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              canAfford
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {canAfford ? 'Redeem' : `Need ${(reward.point_cost - points).toLocaleString()} more`}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmView({
  reward, points, redeeming, error, onConfirm, onClose,
}: {
  reward: RewardWithBusiness;
  points: number;
  redeeming: boolean;
  error: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const canAfford = points >= reward.point_cost;
  const config = REWARD_TYPE_CONFIG[reward.reward_type] ?? REWARD_TYPE_CONFIG.coupon;
  const Icon = config.icon;

  return (
    <>
      <div className="flex items-center justify-between p-5 border-b border-gray-100">
        <h3 className="font-bold text-gray-900">Confirm Redemption</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-5">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">{error}</div>
        )}
        <div className={`rounded-xl p-4 mb-4 ${config.bg} border ${config.border}`}>
          <div className="flex items-start gap-3 mb-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${config.bg} border ${config.border}`}>
              <Icon className={`w-5 h-5 ${config.color}`} />
            </div>
            <div>
              <div className={`font-bold text-sm ${config.color}`}>{reward.title}</div>
              <div className="text-xs text-gray-500 mt-0.5">{reward.businesses?.business_name} · {reward.businesses?.city}</div>
            </div>
          </div>
          <p className="text-xs text-gray-600 mb-3 leading-relaxed">{reward.description}</p>
          <div className="space-y-1.5 text-xs border-t border-white/60 pt-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Cost</span>
              <span className="font-bold text-gray-900 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                {reward.point_cost.toLocaleString()} pts
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Your balance</span>
              <span className={`font-semibold ${canAfford ? 'text-emerald-600' : 'text-red-500'}`}>
                {points.toLocaleString()} pts
              </span>
            </div>
            {canAfford && (
              <div className="flex justify-between border-t border-white/60 pt-1.5">
                <span className="text-gray-500">Remaining after</span>
                <span className="font-semibold text-gray-700">{(points - reward.point_cost).toLocaleString()} pts</span>
              </div>
            )}
          </div>
        </div>
        {reward.terms && (
          <p className="text-xs text-gray-400 mb-4 leading-relaxed">{reward.terms}</p>
        )}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-semibold text-sm hover:border-gray-300 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={redeeming || !canAfford}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white py-3 rounded-xl font-semibold text-sm transition-all"
          >
            {redeeming ? 'Redeeming...' : 'Redeem Now'}
          </button>
        </div>
      </div>
    </>
  );
}

function SuccessView({ code, reward, onClose }: { code: string; reward: RewardWithBusiness; onClose: () => void }) {
  return (
    <div className="p-8 text-center">
      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="w-8 h-8 text-emerald-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-1">Redeemed!</h3>
      <p className="text-gray-500 text-sm mb-5">Show this code at {reward.businesses?.business_name ?? 'the business'}:</p>
      <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl px-6 py-5 mb-2">
        <div className="text-3xl font-mono font-bold text-gray-900 tracking-[0.2em]">{code}</div>
      </div>
      <p className="text-xs text-gray-400 mb-6 leading-relaxed">
        {reward.terms || 'Present this code to the business to claim your reward.'}
      </p>
      <button
        onClick={onClose}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold text-sm transition-colors"
      >
        Done
      </button>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1,2,3,4,5,6].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
          <div className="h-36 bg-gray-200" />
          <div className="p-4 space-y-2.5">
            <div className="h-3.5 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-full" />
            <div className="h-3 bg-gray-200 rounded w-2/3" />
            <div className="flex justify-between items-center pt-1">
              <div className="h-4 bg-gray-200 rounded w-16" />
              <div className="h-7 bg-gray-200 rounded-lg w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
        <Gift className="w-7 h-7 text-gray-400" />
      </div>
      <p className="text-gray-600 font-semibold">No rewards found</p>
      <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
    </div>
  );
}
