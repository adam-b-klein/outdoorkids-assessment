import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Gift, Star, X, Save, ToggleLeft, ToggleRight, Zap, Calendar, CheckCircle, Clock, Lock } from 'lucide-react';
import { supabase, Business, Reward, Subscription } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const REWARD_TYPES = ['gift_card', 'coupon', 'event_pass', 'discount', 'freebie'];

const DURATION_OPTIONS = [
  { label: '1 day',    days: 1 },
  { label: '3 days',   days: 3 },
  { label: '7 days',   days: 7 },
  { label: '14 days',  days: 14 },
  { label: '1 month',  days: 30 },
  { label: '3 months', days: 90 },
];

type RewardWithSponsor = Reward & {
  is_sponsored?: boolean;
  activePromotion?: { ends_at: string; days_purchased: number } | null;
};

type RewardForm = {
  title: string;
  description: string;
  reward_type: string;
  point_cost: number;
  quantity_available: number | '';
  terms: string;
  is_promoted: boolean;
  is_active: boolean;
};

const EMPTY_FORM: RewardForm = {
  title: '',
  description: '',
  reward_type: 'coupon',
  point_cost: 100,
  quantity_available: '',
  terms: '',
  is_promoted: false,
  is_active: true,
};

type Props = {
  onNavigate: (page: string) => void;
};

export default function BizRewardsPage({ onNavigate }: Props) {
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [rewards, setRewards] = useState<RewardWithSponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<RewardForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Promotion state
  const [promoteRewardId, setPromoteRewardId] = useState<string | null>(null);
  const [promoteDays, setPromoteDays] = useState(7);
  const [promoteLoading, setPromoteLoading] = useState(false);
  const [promoteError, setPromoteError] = useState('');

  // Success confirmation after Stripe redirect
  const [confirmBanner, setConfirmBanner] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    // Handle Stripe success redirect
    const params = new URLSearchParams(window.location.search);
    const promotionId = params.get('promotion_id');
    const sessionId = params.get('session_id');
    if (promotionId && sessionId) {
      // Strip query params from URL without reload
      window.history.replaceState({}, '', window.location.pathname);
      confirmPromotion(promotionId, sessionId);
    }

    load();
  }, [user]);

  async function confirmPromotion(promotionId: string, sessionId: string) {
    const session = (await supabase.auth.getSession()).data.session;
    const res = await fetch(`${SUPABASE_URL}/functions/v1/promote-reward/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
        'Apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ promotionId, sessionId }),
    });
    const data = await res.json();
    if (data.success) {
      setConfirmBanner(`Promotion activated! Your reward will be sponsored until ${new Date(data.endsAt).toLocaleDateString()}.`);
      setTimeout(() => setConfirmBanner(null), 8000);
    }
  }

  async function load() {
    const { data: biz } = await supabase.from('businesses').select('*').eq('profile_id', user!.id).maybeSingle();
    const { data: sub } = await supabase.from('subscriptions').select('*').eq('profile_id', user!.id).maybeSingle();
    setBusiness(biz);
    setSubscription(sub);

    if (biz) {
      const { data: rewardsData } = await supabase
        .from('rewards')
        .select('*')
        .eq('business_id', biz.id)
        .order('created_at', { ascending: false });

      const now = new Date().toISOString();
      const { data: promos } = await supabase
        .from('reward_promotions')
        .select('reward_id, ends_at, days_purchased')
        .eq('business_id', biz.id)
        .eq('status', 'active')
        .gt('ends_at', now);

      const promoMap = new Map(promos?.map((p) => [p.reward_id, p]) ?? []);

      setRewards(
        (rewardsData ?? []).map((r) => ({
          ...r,
          activePromotion: promoMap.get(r.id) ?? null,
        }))
      );
    }
    setLoading(false);
  }

  function openCreate() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setModalOpen(true);
  }

  function openEdit(r: RewardWithSponsor) {
    setForm({
      title: r.title,
      description: r.description,
      reward_type: r.reward_type,
      point_cost: r.point_cost,
      quantity_available: r.quantity_available ?? '',
      terms: r.terms ?? '',
      is_promoted: r.is_promoted,
      is_active: r.is_active,
    });
    setEditingId(r.id);
    setModalOpen(true);
  }

  async function handleSave() {
    if (!business) return;
    setSaving(true);
    const payload = {
      business_id: business.id,
      title: form.title,
      description: form.description,
      reward_type: form.reward_type,
      point_cost: form.point_cost,
      quantity_available: form.quantity_available === '' ? null : form.quantity_available,
      terms: form.terms,
      is_promoted: form.is_promoted,
      is_active: form.is_active,
      updated_at: new Date().toISOString(),
    };

    if (editingId) {
      const { data } = await supabase.from('rewards').update(payload).eq('id', editingId).select().single();
      if (data) setRewards((prev) => prev.map((r) => r.id === editingId ? { ...r, ...data } : r));
    } else {
      const { data } = await supabase.from('rewards').insert(payload).select().single();
      if (data) setRewards((prev) => [data, ...prev]);
    }

    setSaving(false);
    setModalOpen(false);
  }

  async function handleDelete(id: string) {
    await supabase.from('rewards').delete().eq('id', id);
    setRewards((prev) => prev.filter((r) => r.id !== id));
    setDeleteId(null);
  }

  async function handleStartPromotion() {
    if (!promoteRewardId || !business) return;
    setPromoteLoading(true);
    setPromoteError('');

    const session = (await supabase.auth.getSession()).data.session;
    const origin = window.location.origin;

    const res = await fetch(`${SUPABASE_URL}/functions/v1/promote-reward/create-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
        'Apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        rewardId: promoteRewardId,
        days: promoteDays,
        successUrl: `${origin}/biz/rewards`,
        cancelUrl: `${origin}/biz/rewards`,
      }),
    });

    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      setPromoteError(data.error ?? 'Failed to start checkout. Please try again.');
      setPromoteLoading(false);
    }
  }

  const isPremium = subscription?.plan !== 'free' && subscription?.status === 'active';
  const totalCost = promoteDays * 10;

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-40" />
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-gray-200 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">

      {/* Premium upsell banner for free accounts */}
      {!isPremium && !loading && (
        <div className="mb-5 flex items-center gap-3 bg-sky-50 border border-sky-200 rounded-2xl px-4 py-3">
          <Lock className="w-4 h-4 text-sky-500 flex-shrink-0" />
          <p className="text-sm text-sky-800 flex-1">
            <span className="font-semibold">Free plan</span> — Featured and Promoted placements require a Premium subscription.
          </p>
          <button
            onClick={() => onNavigate('biz-profile')}
            className="text-xs font-bold text-sky-700 hover:text-sky-900 bg-sky-100 hover:bg-sky-200 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap"
          >
            Upgrade
          </button>
        </div>
      )}

      {/* Stripe success banner */}
      {confirmBanner && (
        <div className="mb-4 flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium px-4 py-3 rounded-2xl">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          {confirmBanner}
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Rewards</h1>
          <p className="text-gray-500 text-sm mt-0.5">Create and manage rewards for families to redeem</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Reward
        </button>
      </div>

      {rewards.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Gift className="w-7 h-7 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium mb-1">No rewards yet</p>
          <p className="text-gray-400 text-sm mb-4">Create your first reward to start attracting families</p>
          <button onClick={openCreate} className="text-sky-600 hover:text-sky-700 text-sm font-semibold">
            + Create your first reward
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {rewards.map((reward) => (
            <div key={reward.id} className={`bg-white rounded-2xl border p-5 flex items-center justify-between hover:shadow-sm transition-shadow ${reward.activePromotion ? 'border-amber-200 ring-1 ring-amber-100' : 'border-gray-100'}`}>
              <div className="flex items-center gap-4 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${reward.activePromotion ? 'bg-amber-100' : 'bg-sky-100'}`}>
                  <Gift className={`w-5 h-5 ${reward.activePromotion ? 'text-amber-700' : 'text-sky-700'}`} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-900 text-sm">{reward.title}</span>
                    {reward.is_promoted && (
                      <span className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                        <Star className="w-2.5 h-2.5" /> Featured
                      </span>
                    )}
                    {reward.activePromotion && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                        <Zap className="w-2.5 h-2.5" /> Sponsored
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${reward.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {reward.is_active ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                    <span>{reward.point_cost} pts · {reward.reward_type.replace(/_/g, ' ')} · {reward.quantity_redeemed} redeemed</span>
                    {reward.activePromotion && (
                      <span className="flex items-center gap-1 text-amber-600">
                        <Clock className="w-3 h-3" />
                        Sponsored until {new Date(reward.activePromotion.ends_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {!reward.activePromotion && (
                  isPremium ? (
                    <button
                      onClick={() => { setPromoteRewardId(reward.id); setPromoteDays(7); setPromoteError(''); }}
                      className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-lg transition-all mr-1"
                    >
                      <Zap className="w-3 h-3" />
                      Promote
                    </button>
                  ) : (
                    <span
                      title="Upgrade to Premium to promote rewards"
                      className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg mr-1 cursor-not-allowed"
                    >
                      <Lock className="w-3 h-3" />
                      Promote
                    </span>
                  )
                )}
                <button
                  onClick={() => openEdit(reward)}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteId(reward.id)}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl">
              <h3 className="font-bold text-gray-900">{editingId ? 'Edit Reward' : 'Create Reward'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none text-sm transition-all"
                  placeholder="10% off your next visit"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none text-sm resize-none transition-all"
                  placeholder="Describe the reward and what families get"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
                  <select
                    value={form.reward_type}
                    onChange={(e) => setForm({ ...form, reward_type: e.target.value })}
                    className="w-full px-3 py-3 rounded-xl border border-gray-200 focus:border-sky-500 outline-none text-sm"
                  >
                    {REWARD_TYPES.map((t) => (
                      <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Point cost</label>
                  <input
                    type="number"
                    value={form.point_cost}
                    onChange={(e) => setForm({ ...form, point_cost: parseInt(e.target.value) || 0 })}
                    min={1}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-500 outline-none text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Quantity available <span className="text-gray-400 font-normal">(blank = unlimited)</span></label>
                <input
                  type="number"
                  value={form.quantity_available}
                  onChange={(e) => setForm({ ...form, quantity_available: e.target.value === '' ? '' : parseInt(e.target.value) })}
                  min={1}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-500 outline-none text-sm"
                  placeholder="Unlimited"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Redemption instructions / terms</label>
                <textarea
                  value={form.terms}
                  onChange={(e) => setForm({ ...form, terms: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-500 outline-none text-sm resize-none"
                  placeholder="Show redemption code at checkout. One per visit."
                />
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 pt-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Visibility</p>

                {/* Featured toggle */}
                {isPremium ? (
                  <div className="flex items-center justify-between py-2.5">
                    <div>
                      <div className="text-sm font-medium text-gray-800 flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 text-sky-500" />
                        Featured
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">Show this reward in the Featured section — included with Premium</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, is_promoted: !form.is_promoted })}
                    >
                      {form.is_promoted
                        ? <ToggleRight className="w-8 h-8 text-sky-600" />
                        : <ToggleLeft className="w-8 h-8 text-gray-300" />
                      }
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between py-2.5 opacity-60">
                    <div>
                      <div className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-gray-400" />
                        Featured
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">Upgrade to Premium to use Featured placement</div>
                    </div>
                    <ToggleLeft className="w-8 h-8 text-gray-200" />
                  </div>
                )}

                {/* Promoted / Sponsored — info panel */}
                {isPremium ? (
                  <div className="flex items-start justify-between py-2.5 bg-amber-50 rounded-xl px-3 -mx-1">
                    <div className="flex-1 mr-3">
                      <div className="text-sm font-medium text-amber-900 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        Promoted <span className="text-xs text-amber-600 font-normal">— $10 / day</span>
                      </div>
                      <div className="text-xs text-amber-700 mt-0.5">Sponsored placement at the very top of the marketplace. Paid via Stripe.</div>
                      <div className="text-xs text-amber-600 mt-1">Save the reward first, then click <strong>Promote</strong> on the reward row to set up a paid campaign.</div>
                    </div>
                    <Zap className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  </div>
                ) : (
                  <div className="flex items-start justify-between py-2.5 bg-gray-50 rounded-xl px-3 -mx-1">
                    <div className="flex-1 mr-3">
                      <div className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-gray-400" />
                        Promoted <span className="text-xs text-gray-400 font-normal">— $10 / day</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">Upgrade to Premium to promote rewards to the top of the marketplace.</div>
                    </div>
                  </div>
                )}

                {/* Active toggle */}
                <div className="flex items-center justify-between py-2.5 mt-1">
                  <div>
                    <div className="text-sm font-medium text-gray-800">Active</div>
                    <div className="text-xs text-gray-400 mt-0.5">Visible in the rewards marketplace</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, is_active: !form.is_active })}
                  >
                    {form.is_active
                      ? <ToggleRight className="w-8 h-8 text-emerald-600" />
                      : <ToggleLeft className="w-8 h-8 text-gray-300" />
                    }
                  </button>
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving || !form.title.trim()}
                className="w-full bg-sky-600 hover:bg-sky-700 disabled:bg-gray-200 disabled:text-gray-400 text-white py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Reward'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Promote modal */}
      {promoteRewardId && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-amber-600" />
                </div>
                <h3 className="font-bold text-gray-900">Promote Reward</h3>
              </div>
              <button onClick={() => { setPromoteRewardId(null); setPromoteError(''); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <p className="text-sm text-gray-600">
                Sponsored rewards appear at the <strong>top of the marketplace</strong> with a highlighted badge, giving them maximum visibility with local families.
              </p>

              {/* Duration picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Promotion duration
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {DURATION_OPTIONS.map((opt) => (
                    <button
                      key={opt.days}
                      type="button"
                      onClick={() => setPromoteDays(opt.days)}
                      className={`py-2.5 px-3 rounded-xl text-sm font-semibold border-2 transition-all ${
                        promoteDays === opt.days
                          ? 'border-amber-400 bg-amber-50 text-amber-800'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom days input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Or enter custom days</label>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={promoteDays}
                  onChange={(e) => setPromoteDays(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-sm transition-all"
                />
              </div>

              {/* Cost summary */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Duration</span>
                  <span className="font-medium text-gray-900">{promoteDays} {promoteDays === 1 ? 'day' : 'days'}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Rate</span>
                  <span className="font-medium text-gray-900">$10.00 / day</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 font-bold text-gray-900">
                  <span>Total</span>
                  <span className="text-amber-700">${totalCost.toLocaleString()}.00</span>
                </div>
              </div>

              {promoteError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{promoteError}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => { setPromoteRewardId(null); setPromoteError(''); }}
                  className="flex-1 border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-semibold text-sm hover:border-gray-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartPromotion}
                  disabled={promoteLoading}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-200 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                >
                  <Zap className="w-4 h-4" />
                  {promoteLoading ? 'Redirecting...' : `Pay $${totalCost} & Promote`}
                </button>
              </div>

              <p className="text-xs text-gray-400 text-center">Secure checkout via Stripe. Promotion starts immediately after payment.</p>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-bold text-gray-900 mb-2">Delete reward?</h3>
            <p className="text-sm text-gray-500 mb-5">This cannot be undone. Families who have already redeemed this reward will keep their redemptions.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 border-2 border-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold text-sm">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
