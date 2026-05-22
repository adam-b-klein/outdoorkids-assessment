import { useEffect, useState } from 'react';
import { MapPin, Clock, Play, Square, ChevronLeft, Search, TreePine, Zap, Plus, CheckCircle, X } from 'lucide-react';
import { supabase, Activity, Household } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

type Props = {
  selectedActivity?: Activity;
  onNavigate: (page: string) => void;
};

const TYPE_OPTIONS = ['outdoor', 'learning', 'physical', 'cultural', 'community', 'entertainment'];

export default function CheckInPage({ selectedActivity, onNavigate }: Props) {
  const { user } = useAuth();
  const [household, setHousehold] = useState<Household | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [chosenActivity, setChosenActivity] = useState<Activity | null>(selectedActivity ?? null);
  const [showList, setShowList] = useState(!selectedActivity);
  const [customName, setCustomName] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    selectedActivity?.activity_type?.length ? selectedActivity.activity_type : ['outdoor']
  );
  const [search, setSearch] = useState('');

  // Sync when selectedActivity prop changes (e.g. navigating from Activities page)
  useEffect(() => {
    if (selectedActivity) {
      setChosenActivity(selectedActivity);
      setShowList(false);
      setIsCustom(false);
      if (selectedActivity.activity_type?.length) {
        setSelectedTypes(selectedActivity.activity_type);
      }
    }
  }, [selectedActivity]);
  const [notes, setNotes] = useState('');

  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [logId, setLogId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const { data: hh } = await supabase.from('households').select('*').eq('profile_id', user!.id).maybeSingle();
      setHousehold(hh);
      if (hh) {
        const mkt = hh.city.toLowerCase().includes('san') ? 'san_francisco' : 'portland';
        const { data } = await supabase.from('activities').select('*').eq('is_active', true).eq('market', mkt).order('name');
        setActivities(data ?? []);
      }
    }
    load();
  }, [user]);

  useEffect(() => {
    if (!isCheckedIn || !checkInTime) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - checkInTime.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isCheckedIn, checkInTime]);

  function formatElapsed(secs: number) {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function toggleType(t: string) {
    setSelectedTypes((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
  }

  async function handleCheckIn() {
    if (!household) return;
    setSaving(true);
    const name = isCustom ? customName : (chosenActivity?.name ?? 'Activity');
    const activityId = isCustom ? null : (chosenActivity?.id ?? null);
    const pph = chosenActivity?.points_per_hour ?? 50;

    const { data, error } = await supabase
      .from('activity_logs')
      .insert({
        household_id: household.id,
        activity_id: activityId,
        custom_activity_name: name,
        activity_types: selectedTypes,
        check_in_at: new Date().toISOString(),
        notes,
      })
      .select()
      .single();

    if (!error && data) {
      setLogId(data.id);
      setIsCheckedIn(true);
      setCheckInTime(new Date());
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__checkinPPH = pph;
    }
    setSaving(false);
  }

  async function handleCheckOut() {
    if (!logId || !checkInTime || !household) return;
    setSaving(true);
    const durationMinutes = Math.max(1, Math.floor((Date.now() - checkInTime.getTime()) / 60000));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pph = (window as any).__checkinPPH ?? 50;
    const points = Math.round((durationMinutes / 60) * pph);

    const { error: logError } = await supabase
      .from('activity_logs')
      .update({ check_out_at: new Date().toISOString(), duration_minutes: durationMinutes, points_earned: points })
      .eq('id', logId);

    if (!logError) {
      // Update household points
      await supabase
        .from('households')
        .update({
          points_balance: (household.points_balance ?? 0) + points,
          total_points_earned: (household.total_points_earned ?? 0) + points,
        })
        .eq('id', household.id);

      // Points ledger entry
      await supabase.from('points_ledger').insert({
        household_id: household.id,
        type: 'earned',
        amount: points,
        description: `Check-in: ${isCustom ? customName : (chosenActivity?.name ?? 'Activity')}`,
        activity_log_id: logId,
      });

      setEarnedPoints(points);
      setDone(true);
    }
    setSaving(false);
  }

  const filteredActivities = activities.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) || a.city.toLowerCase().includes(search.toLowerCase())
  );

  if (done) {
    return (
      <div className="p-6 md:p-8 max-w-lg mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Activity Complete!</h2>
        <p className="text-gray-500 mb-4">Great job getting outside with your kids.</p>
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-8 py-5 mb-8">
          <div className="text-4xl font-bold text-emerald-600 mb-1">+{earnedPoints}</div>
          <div className="text-sm text-emerald-700 font-medium">Points earned</div>
        </div>
        <div className="flex gap-3 w-full max-w-xs">
          <button
            onClick={() => onNavigate('rewards')}
            className="flex-1 border-2 border-gray-200 hover:border-emerald-500 text-gray-700 hover:text-emerald-700 py-3 rounded-xl font-semibold text-sm transition-all"
          >
            View Rewards
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold text-sm transition-all"
          >
            Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      <button onClick={() => onNavigate('activities')} className="flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">Check In</h1>
      <p className="text-gray-500 text-sm mb-6">Log an outdoor activity and start earning points</p>

      {/* Active check-in timer */}
      {isCheckedIn && (
        <div className="bg-emerald-600 text-white rounded-2xl p-6 mb-6 text-center">
          <div className="text-xs font-semibold uppercase tracking-widest text-emerald-200 mb-2">Checked In</div>
          <div className="text-5xl font-mono font-bold mb-2">{formatElapsed(elapsed)}</div>
          <div className="text-emerald-100 text-sm mb-6">
            {isCustom ? customName : (chosenActivity?.name ?? 'Activity')}
          </div>
          <button
            onClick={handleCheckOut}
            disabled={saving}
            className="bg-white text-emerald-700 hover:bg-emerald-50 px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 mx-auto transition-colors disabled:opacity-60"
          >
            <Square className="w-4 h-4" />
            {saving ? 'Checking out...' : 'Check Out'}
          </button>
        </div>
      )}

      {!isCheckedIn && (
        <>
          {/* Choose activity */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
            <h2 className="font-bold text-gray-900 mb-3 text-sm">1. Choose your activity</h2>

            {/* Selected activity display */}
            {!isCustom && chosenActivity && !showList && (
              <div className="mb-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TreePine className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-gray-900 truncate">{chosenActivity.name}</div>
                    <div className="text-xs text-emerald-700">{chosenActivity.city}, {chosenActivity.state} &middot; {chosenActivity.points_per_hour}pts/hr</div>
                  </div>
                  <button
                    onClick={() => { setChosenActivity(null); setShowList(true); }}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-white"
                    title="Change activity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setShowList(true)}
                    className="flex-1 py-2 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
                  >
                    Change Place
                  </button>
                  <button
                    onClick={() => { setIsCustom(true); setChosenActivity(null); setShowList(false); }}
                    className="flex-1 py-2 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Custom Instead
                  </button>
                </div>
              </div>
            )}

            {/* Mode toggle (when nothing selected) */}
            {!chosenActivity && !isCustom && (
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => { setIsCustom(false); setShowList(true); }}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold bg-emerald-600 text-white transition-all"
                >
                  Browse Places
                </button>
                <button
                  onClick={() => { setIsCustom(true); setChosenActivity(null); setShowList(false); }}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all flex items-center justify-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Custom Activity
                </button>
              </div>
            )}

            {/* Custom mode toggle (when in custom mode) */}
            {isCustom && (
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => { setIsCustom(false); setShowList(true); }}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
                >
                  Browse Places
                </button>
                <button
                  className="flex-1 py-2 rounded-lg text-xs font-semibold bg-emerald-600 text-white transition-all flex items-center justify-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Custom Activity
                </button>
              </div>
            )}

            {isCustom ? (
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Describe your activity (e.g. Bike ride at Waterfront Park)"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm"
              />
            ) : showList || !chosenActivity ? (
              <>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search locations..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm"
                  />
                </div>
                <div className="space-y-1.5 max-h-56 overflow-y-auto">
                  {filteredActivities.slice(0, 20).map((a) => (
                    <button
                      key={a.id}
                      onClick={() => { setChosenActivity(a); setShowList(false); if (a.activity_type?.length) setSelectedTypes(a.activity_type); }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${chosenActivity?.id === a.id ? 'bg-emerald-50 border border-emerald-200' : 'hover:bg-gray-50 border border-transparent'}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${chosenActivity?.id === a.id ? 'bg-emerald-600' : 'bg-emerald-100'}`}>
                        <TreePine className={`w-4 h-4 ${chosenActivity?.id === a.id ? 'text-white' : 'text-emerald-700'}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-gray-900 truncate">{a.name}</div>
                        <div className="text-xs text-gray-400">{a.city}, {a.state}</div>
                      </div>
                      <div className="ml-auto flex-shrink-0 text-xs text-amber-600 font-semibold">
                        {a.points_per_hour}pts/hr
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : null}
          </div>

          {/* Activity types */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
            <h2 className="font-bold text-gray-900 mb-3 text-sm">2. Tag the activity type(s)</h2>
            <div className="flex flex-wrap gap-2">
              {TYPE_OPTIONS.map((t) => (
                <button
                  key={t}
                  onClick={() => toggleType(t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
                    selectedTypes.includes(t) ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
            <h2 className="font-bold text-gray-900 mb-3 text-sm">3. Notes (optional)</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="What did you do? How was it?"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-sm resize-none"
            />
          </div>

          <button
            onClick={handleCheckIn}
            disabled={saving || (!chosenActivity && !customName.trim()) || selectedTypes.length === 0}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
          >
            <Play className="w-5 h-5" />
            {saving ? 'Checking in...' : 'Start Check-In'}
          </button>

          {(!chosenActivity && !isCustom) && (
            <p className="text-center text-xs text-gray-400 mt-3">Select an activity or create a custom one to check in</p>
          )}

          <div className="mt-4 flex items-center gap-2 text-xs text-gray-400 justify-center">
            <Clock className="w-3.5 h-3.5" />
            Points are calculated based on time spent at the activity
          </div>

          <div className="mt-2 flex items-center gap-2 text-xs text-gray-400 justify-center">
            <Zap className="w-3.5 h-3.5" />
            {chosenActivity ? `${chosenActivity.points_per_hour} points per hour` : 'Earn 50 points per hour (custom activities)'}
          </div>
        </>
      )}
    </div>
  );
}
