import { useEffect, useState } from 'react';
import { User, Home, Baby, Plus, Trash2, Save, CreditCard, Sparkles, ArrowUpCircle, ArrowDownCircle, AlertTriangle, Pencil, X, Check, MapPin } from 'lucide-react';
import { supabase, Household, Child, Subscription } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const PRICE_MONTHLY = import.meta.env.VITE_STRIPE_PRICE_MONTHLY as string;
const PRICE_ANNUAL = import.meta.env.VITE_STRIPE_PRICE_ANNUAL as string;

const AGE_RANGES = ['infant', 'toddler', 'preschool', 'school-age', 'tween'];

const MARKETS = [
  { value: 'portland',      label: 'Portland, OR',      city: 'Portland',      state: 'OR' },
  { value: 'san_francisco', label: 'San Francisco, CA', city: 'San Francisco', state: 'CA' },
] as const;

type MarketValue = typeof MARKETS[number]['value'];

export default function HouseholdProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [household, setHousehold] = useState<Household | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [editingChildId, setEditingChildId] = useState<string | null>(null);
  const [editChildName, setEditChildName] = useState('');
  const [editChildAge, setEditChildAge] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Form state
  const [fullName, setFullName] = useState('');
  const [householdName, setHouseholdName] = useState('');
  const [selectedMarket, setSelectedMarket] = useState<MarketValue>('portland');
  const [newChildren, setNewChildren] = useState<{ name: string; age_range: string }[]>([]);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const { data: hh } = await supabase.from('households').select('*').eq('profile_id', user!.id).maybeSingle();
      const { data: kids } = hh
        ? await supabase.from('children').select('*').eq('household_id', hh.id)
        : { data: [] };
      const { data: sub } = await supabase.from('subscriptions').select('*').eq('profile_id', user!.id).maybeSingle();

      setHousehold(hh);
      setChildren(kids ?? []);
      setSubscription(sub);
      setFullName(profile?.full_name ?? '');
      setHouseholdName(hh?.household_name ?? '');
      const mkt: MarketValue = hh?.city?.toLowerCase().includes('san') ? 'san_francisco' : 'portland';
      setSelectedMarket(mkt);
      setLoading(false);
    }
    load();
  }, [user, profile]);

  async function handleUpgrade(plan: 'paid_monthly' | 'paid_annual') {
    setCheckoutLoading(plan);
    try {
      const priceId = plan === 'paid_monthly' ? PRICE_MONTHLY : PRICE_ANNUAL;
      const origin = window.location.origin;
      const session = (await supabase.auth.getSession()).data.session;
      const res = await fetch(`${SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
          'Apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          price_id: priceId,
          success_url: `${origin}/profile?checkout=success`,
          cancel_url: `${origin}/profile?checkout=cancel`,
          mode: 'subscription',
        }),
      });
      const { url, error } = await res.json();
      if (error) throw new Error(error);
      window.location.href = url;
    } catch {
      setCheckoutLoading(null);
    }
  }

  async function handleManageBilling() {
    setPortalLoading(true);
    try {
      const origin = window.location.origin;
      const session = (await supabase.auth.getSession()).data.session;
      const res = await fetch(`${SUPABASE_URL}/functions/v1/stripe-checkout/create-portal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
          'Apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ returnUrl: `${origin}/profile` }),
      });
      const { url, error } = await res.json();
      if (error) throw new Error(error);
      window.location.href = url;
    } catch {
      setPortalLoading(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleteLoading(true);
    setDeleteError('');
    try {
      const session = (await supabase.auth.getSession()).data.session;
      const res = await fetch(`${SUPABASE_URL}/functions/v1/delete-account`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Apikey': SUPABASE_ANON_KEY,
        },
      });
      const { error } = await res.json();
      if (error) throw new Error(error);
      await supabase.auth.signOut();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete account');
      setDeleteLoading(false);
    }
  }

  async function handleSave() {
    if (!user || !household) return;
    setSaving(true);

    const mktData = MARKETS.find((m) => m.value === selectedMarket)!;
    await supabase.from('profiles').update({ full_name: fullName, city: mktData.city, state: mktData.state, updated_at: new Date().toISOString() }).eq('id', user.id);
    await supabase.from('households').update({ household_name: householdName, city: mktData.city, state: mktData.state, updated_at: new Date().toISOString() }).eq('id', household.id);
    setHousehold((prev) => prev ? { ...prev, city: mktData.city, state: mktData.state } : prev);

    // Add new children
    const valid = newChildren.filter((c) => c.name.trim());
    if (valid.length > 0) {
      await supabase.from('children').insert(valid.map((c) => ({ household_id: household.id, first_name: c.name, age_range: c.age_range })));
      const { data: kids } = await supabase.from('children').select('*').eq('household_id', household.id);
      setChildren(kids ?? []);
      setNewChildren([]);
    }

    await refreshProfile();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function startEditChild(child: Child) {
    setEditingChildId(child.id);
    setEditChildName(child.first_name);
    setEditChildAge(child.age_range);
  }

  async function handleSaveChild(childId: string) {
    if (!editChildName.trim()) return;
    await supabase
      .from('children')
      .update({ first_name: editChildName.trim(), age_range: editChildAge })
      .eq('id', childId);
    setChildren((prev) =>
      prev.map((c) => c.id === childId ? { ...c, first_name: editChildName.trim(), age_range: editChildAge } : c)
    );
    setEditingChildId(null);
  }

  async function handleDeleteChild(childId: string) {
    await supabase.from('children').delete().eq('id', childId);
    setChildren((prev) => prev.filter((c) => c.id !== childId));
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-2xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-32" />
          <div className="h-48 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile & Settings</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage your household information</p>
      </div>

      {/* Account info */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
            <User className="w-4 h-4 text-gray-600" />
          </div>
          <h2 className="font-bold text-gray-900">Account</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              value={user?.email ?? ''}
              disabled
              className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-400 text-sm cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Household info */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
            <Home className="w-4 h-4 text-gray-600" />
          </div>
          <h2 className="font-bold text-gray-900">Household</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Household name</label>
            <input
              type="text"
              value={householdName}
              onChange={(e) => setHouseholdName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm transition-all"
              placeholder="The Smith Family"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MARKETS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setSelectedMarket(m.value)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                    selectedMarket === m.value
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    selectedMarket === m.value ? 'bg-emerald-600' : 'bg-gray-100'
                  }`}>
                    <MapPin className={`w-4 h-4 ${selectedMarket === m.value ? 'text-white' : 'text-gray-500'}`} />
                  </div>
                  <div>
                    <div className={`text-sm font-semibold ${selectedMarket === m.value ? 'text-emerald-900' : 'text-gray-700'}`}>
                      {m.label}
                    </div>
                    <div className="text-xs text-gray-400">Rewards &amp; activities</div>
                  </div>
                  {selectedMarket === m.value && (
                    <Check className="w-4 h-4 text-emerald-600 ml-auto flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">This sets which city's activities and rewards you see throughout the app.</p>
          </div>
        </div>
      </div>

      {/* Children */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
            <Baby className="w-4 h-4 text-gray-600" />
          </div>
          <h2 className="font-bold text-gray-900">Children</h2>
        </div>

        <div className="space-y-2 mb-3">
          {children.map((child) =>
            editingChildId === child.id ? (
              <div key={child.id} className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-2">
                <input
                  type="text"
                  value={editChildName}
                  onChange={(e) => setEditChildName(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-emerald-200 focus:border-emerald-500 outline-none text-sm bg-white"
                  placeholder="Name"
                  autoFocus
                />
                <select
                  value={editChildAge}
                  onChange={(e) => setEditChildAge(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-emerald-200 outline-none text-sm capitalize bg-white"
                >
                  {AGE_RANGES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <button
                  onClick={() => handleSaveChild(child.id)}
                  disabled={!editChildName.trim()}
                  className="text-emerald-600 hover:text-emerald-700 disabled:text-gray-300 transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => setEditingChildId(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div key={child.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                <div>
                  <span className="text-sm font-semibold text-gray-900">{child.first_name}</span>
                  <span className="text-xs text-gray-400 ml-2 capitalize">{child.age_range}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => startEditChild(child)} className="text-gray-300 hover:text-emerald-500 transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteChild(child.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          )}
          {newChildren.map((child, i) => (
            <div key={`new-${i}`} className="flex items-center gap-2 bg-emerald-50 rounded-xl p-2">
              <input
                type="text"
                value={child.name}
                onChange={(e) => {
                  const updated = [...newChildren];
                  updated[i].name = e.target.value;
                  setNewChildren(updated);
                }}
                placeholder="Name"
                className="flex-1 px-3 py-2 rounded-lg border border-emerald-200 focus:border-emerald-500 outline-none text-sm bg-white"
              />
              <select
                value={child.age_range}
                onChange={(e) => {
                  const updated = [...newChildren];
                  updated[i].age_range = e.target.value;
                  setNewChildren(updated);
                }}
                className="px-3 py-2 rounded-lg border border-emerald-200 outline-none text-sm capitalize bg-white"
              >
                {AGE_RANGES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <button
                onClick={() => setNewChildren(newChildren.filter((_, idx) => idx !== i))}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => setNewChildren([...newChildren, { name: '', age_range: 'school-age' }])}
          className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add child
        </button>
      </div>

      {/* Subscription */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-gray-600" />
          </div>
          <h2 className="font-bold text-gray-900">Subscription</h2>
        </div>

        {/* Current plan badge */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">
                {subscription?.plan === 'free' ? 'Free Plan' : subscription?.plan === 'paid_monthly' ? 'Premium Monthly' : 'Premium Annual'}
              </span>
              {subscription?.plan !== 'free' && <Sparkles className="w-4 h-4 text-emerald-500" />}
            </div>
            <div className="text-xs text-gray-400 mt-0.5 capitalize">
              {subscription?.plan === 'free' ? 'Includes ads' : 'Ad-free'} · {subscription?.status ?? 'active'}
            </div>
          </div>
          {subscription?.plan === 'free' ? (
            <span className="text-xs bg-gray-100 text-gray-500 font-medium px-2.5 py-1 rounded-full">Free</span>
          ) : (
            <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-2.5 py-1 rounded-full">Premium</span>
          )}
        </div>

        {/* Free user: upgrade options */}
        {subscription?.plan === 'free' && (
          <div className="space-y-3">
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
              <p className="text-xs text-emerald-700 font-medium mb-2">Upgrade to Premium to remove all ads</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleUpgrade('paid_monthly')}
                  disabled={checkoutLoading !== null}
                  className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white text-xs font-semibold py-2.5 rounded-lg transition-all"
                >
                  <ArrowUpCircle className="w-3.5 h-3.5" />
                  {checkoutLoading === 'paid_monthly' ? 'Loading...' : '$1 / month'}
                </button>
                <button
                  onClick={() => handleUpgrade('paid_annual')}
                  disabled={checkoutLoading !== null}
                  className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white text-xs font-semibold py-2.5 rounded-lg transition-all relative"
                >
                  <ArrowUpCircle className="w-3.5 h-3.5" />
                  {checkoutLoading === 'paid_annual' ? 'Loading...' : '$10 / year'}
                  <span className="absolute -top-2 -right-1 bg-amber-400 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">SAVE 17%</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Premium user: manage billing + downgrade */}
        {subscription?.plan !== 'free' && (
          <div className="space-y-2">
            <button
              onClick={handleManageBilling}
              disabled={portalLoading}
              className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 text-sm font-semibold py-2.5 rounded-xl transition-all"
            >
              <CreditCard className="w-4 h-4" />
              {portalLoading ? 'Loading...' : 'Manage Billing'}
            </button>
            <button
              onClick={handleManageBilling}
              disabled={portalLoading}
              className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-gray-600 text-xs py-2 transition-colors"
            >
              <ArrowDownCircle className="w-3.5 h-3.5" />
              Downgrade to Free (with ads)
            </button>
          </div>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
          saved ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
        }`}
      >
        {saved ? (
          <><Save className="w-4 h-4" /> Saved!</>
        ) : saving ? (
          'Saving...'
        ) : (
          <><Save className="w-4 h-4" /> Save Changes</>
        )}
      </button>

      {/* Danger zone */}
      <div className="mt-8 border border-red-100 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <h2 className="font-bold text-red-600 text-sm">Danger Zone</h2>
        </div>
        <p className="text-xs text-gray-500 mb-4">Permanently delete your account and all associated data. This cannot be undone.</p>
        <button
          onClick={() => { setShowDeleteModal(true); setDeleteConfirmText(''); setDeleteError(''); }}
          className="text-sm font-semibold text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 hover:bg-red-50 px-4 py-2 rounded-xl transition-all"
        >
          Delete Account
        </button>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !deleteLoading && setShowDeleteModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Delete Account</h3>
                <p className="text-xs text-gray-500 mt-0.5">This action is permanent and cannot be undone</p>
              </div>
            </div>

            <ul className="text-xs text-gray-600 space-y-1 mb-5 bg-gray-50 rounded-xl p-3">
              <li>Your profile and household data will be erased</li>
              <li>All activity logs and points will be lost</li>
              <li>Active subscriptions will not be automatically cancelled</li>
            </ul>

            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Type <span className="font-bold text-red-600">DELETE</span> to confirm
            </label>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              disabled={deleteLoading}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none text-sm transition-all mb-4"
              placeholder="DELETE"
            />

            {deleteError && (
              <p className="text-xs text-red-600 mb-3">{deleteError}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || deleteLoading}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-200 disabled:text-red-400 text-white text-sm font-semibold transition-all"
              >
                {deleteLoading ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
