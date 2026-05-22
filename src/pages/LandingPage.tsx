import { useState } from 'react';
import { MapPin, Award, Users, Star, ChevronRight, TreePine, BookOpen, Zap, Heart, ArrowRight, Gift, BarChart2, Rocket, Building2, Tag, Check } from 'lucide-react';

type Props = {
  onGetStarted: () => void;
  onSignIn?: () => void;
  onGoToDashboard?: () => void;
};

export default function LandingPage({ onGetStarted, onSignIn, onGoToDashboard }: Props) {
  const [activeTab, setActiveTab] = useState<'families' | 'businesses'>('families');

  const activities = [
    { icon: TreePine, label: 'Parks & Trails', color: 'bg-emerald-100 text-emerald-700' },
    { icon: BookOpen, label: 'Libraries & Museums', color: 'bg-sky-100 text-sky-700' },
    { icon: Zap, label: 'Sports & Fitness', color: 'bg-amber-100 text-amber-700' },
    { icon: Heart, label: 'Community Events', color: 'bg-rose-100 text-rose-700' },
  ];

  const familySteps = [
    { num: '01', title: 'Find an Activity', desc: 'Discover kid-friendly parks, libraries, museums, and community events near you in Portland or San Francisco.' },
    { num: '02', title: 'Check In & Explore', desc: 'Arrive at the location, check in with your phone, and spend quality time doing something meaningful with your kids.' },
    { num: '03', title: 'Earn Points', desc: 'Earn points for every hour of outdoor and enriching activity. The more time outside, the more you earn.' },
    { num: '04', title: 'Redeem Rewards', desc: 'Trade your points for gift cards, discounts, free items, and event passes at local and national brands.' },
  ];

  const businessSteps = [
    { num: '01', title: 'Create Your Profile', desc: 'Sign up, add your business details, category, and location. Your profile appears in the marketplace immediately.' },
    { num: '02', title: 'Build Your Rewards', desc: 'Create gift cards, coupons, event passes, discounts, or free items that families can redeem with their earned points.' },
    { num: '03', title: 'Boost Your Visibility', desc: 'Upgrade to Premium to mark rewards as Featured. Pay per day to Promote a reward to the very top of the marketplace.' },
    { num: '04', title: 'Track & Optimise', desc: 'Monitor redemptions, reward performance, and family engagement through your analytics dashboard.' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <TreePine className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight">OutdoorKids</span>
          </div>
          <div className="flex items-center gap-4">
            {onGoToDashboard ? (
              <button
                onClick={onGoToDashboard}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={onSignIn ?? onGetStarted}
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={onGetStarted}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-emerald-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <MapPin className="w-4 h-4" />
            Now serving Portland & San Francisco
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Turn outdoor time into
            <span className="text-emerald-600"> real rewards</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            OutdoorKids rewards families for getting outside. Check in at parks, libraries, museums, and events — earn points redeemable for gift cards and local experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onGetStarted}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl text-base font-semibold transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
            >
              Start Earning Free
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveTab('businesses')}
              className="border-2 border-gray-200 hover:border-gray-300 text-gray-700 px-8 py-4 rounded-xl text-base font-semibold transition-all flex items-center justify-center gap-2"
            >
              For Businesses
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            {[
              { value: '50+', label: 'Curated spots' },
              { value: '2', label: 'Metro areas' },
              { value: 'Free', label: 'To join' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Activity types */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Activities that count</h2>
            <p className="text-gray-600">Screen-free, enriching time outside the home</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {activities.map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-semibold text-gray-700 text-center">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Two-sided value props */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-center gap-1 mb-10 bg-white p-1 rounded-xl w-fit mx-auto border border-gray-200">
            {(['families', 'businesses'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all ${
                  activeTab === tab
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'families' ? 'For Families' : 'For Businesses'}
              </button>
            ))}
          </div>

          {activeTab === 'families' ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: MapPin, title: 'Discover nearby', desc: 'Find kid-friendly parks, libraries, museums, and events close to home in Portland and San Francisco.' },
                { icon: Award, title: 'Earn points', desc: 'Check in at locations and earn points for every hour of outdoor and enriching activity with your children.' },
                { icon: Star, title: 'Redeem rewards', desc: 'Trade points for gift cards, discounts, and free experiences at local shops, restaurants, and more.' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-emerald-700" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Users, title: 'Reach families', desc: 'Connect with parents and caretakers actively looking for kid-friendly experiences and products in your area.' },
                { icon: Award, title: 'Offer rewards', desc: 'Create gift cards, coupons, and event passes redeemable with the points families earn for outdoor activity.' },
                { icon: Star, title: 'Promote events', desc: 'Boost your events and rewards in the activity feed to reach more households in your target market.' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-sky-700" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How it works</h2>
            <p className="text-gray-600 transition-all">
              {activeTab === 'families'
                ? 'Four simple steps from your couch to your first reward'
                : 'Four simple steps from sign-up to reaching engaged local families'}
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {(activeTab === 'families' ? familySteps : businessSteps).map((step, i, arr) => (
              <div key={step.num} className="relative">
                {i < arr.length - 1 && (
                  <div className="hidden md:block absolute top-5 left-full w-full h-px bg-gray-200 -translate-x-4 z-0" />
                )}
                <div className="relative z-10">
                  <div className={`text-xs font-bold mb-3 tracking-widest ${activeTab === 'families' ? 'text-emerald-600' : 'text-sky-600'}`}>
                    {step.num}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className={`py-20 px-6 transition-colors ${activeTab === 'families' ? 'bg-emerald-50' : 'bg-sky-50'}`}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, honest pricing</h2>
          <p className="text-gray-600 mb-12">
            {activeTab === 'families'
              ? 'Start free. Upgrade when you want an ad-free experience.'
              : 'Start free. Upgrade to unlock Featured and Promoted reward placements.'}
          </p>

          {activeTab === 'families' ? (
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {/* Family Free */}
              <div className="bg-white rounded-2xl p-8 border border-gray-200 text-left">
                <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Free</div>
                <div className="text-4xl font-bold text-gray-900 mb-1">$0</div>
                <div className="text-sm text-gray-500 mb-6">Forever free</div>
                <ul className="space-y-3 text-sm text-gray-700">
                  {[
                    { icon: MapPin,    text: 'Full activity discovery' },
                    { icon: Check,     text: 'Check-ins & points' },
                    { icon: Award,     text: 'Rewards marketplace' },
                    { icon: BarChart2, text: 'Activity analytics' },
                    { icon: Tag,       text: 'Ad-supported' },
                  ].map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-emerald-600" />
                      </div>
                      {text}
                    </li>
                  ))}
                </ul>
                <button onClick={onGetStarted} className="mt-8 w-full border-2 border-gray-200 hover:border-emerald-500 text-gray-700 hover:text-emerald-700 py-3 rounded-xl font-semibold transition-all text-sm">
                  Start Free
                </button>
              </div>
              {/* Family Premium */}
              <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 text-left relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">BEST VALUE</div>
                <div className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Premium</div>
                <div className="text-4xl font-bold text-white mb-1">$1<span className="text-xl font-normal text-gray-400">/mo</span></div>
                <div className="text-sm text-gray-500 mb-6">or $10/year — save 17%</div>
                <ul className="space-y-3 text-sm text-gray-300">
                  {['Everything in Free', 'No ads', 'Priority support', 'Early access to features', 'Annual billing savings'].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-emerald-900 flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <button onClick={onGetStarted} className="mt-8 w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-semibold transition-all text-sm">
                  Start Premium
                </button>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {/* Business Free */}
              <div className="bg-white rounded-2xl p-7 border border-gray-200 text-left">
                <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Free</div>
                <div className="text-4xl font-bold text-gray-900 mb-1">$0</div>
                <div className="text-sm text-gray-500 mb-6">No card required</div>
                <ul className="space-y-2.5 text-sm text-gray-700 mb-6">
                  {[
                    { text: 'Business profile listing', available: true },
                    { text: 'Unlimited reward creation', available: true },
                    { text: 'Redemption tracking', available: true },
                    { text: 'Basic analytics', available: true },
                    { text: 'Featured placement', available: false },
                    { text: 'Promoted / sponsored', available: false },
                  ].map(({ text, available }) => (
                    <li key={text} className={`flex items-center gap-2.5 ${!available ? 'opacity-40' : ''}`}>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${available ? 'bg-sky-100' : 'bg-gray-100'}`}>
                        <div className={`w-2 h-2 rounded-full ${available ? 'bg-sky-600' : 'bg-gray-400'}`} />
                      </div>
                      <span className={!available ? 'line-through' : ''}>{text}</span>
                    </li>
                  ))}
                </ul>
                <button onClick={onGetStarted} className="w-full border-2 border-gray-200 hover:border-sky-500 text-gray-700 hover:text-sky-700 py-3 rounded-xl font-semibold transition-all text-sm">
                  Get Started Free
                </button>
              </div>

              {/* Business Premium */}
              <div className="bg-gray-900 rounded-2xl p-7 border border-gray-800 text-left relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-sky-500 text-white text-xs font-bold px-3 py-1 rounded-full">RECOMMENDED</div>
                <div className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Premium</div>
                <div className="text-4xl font-bold text-white mb-1">$1<span className="text-xl font-normal text-gray-400">/mo</span></div>
                <div className="text-sm text-gray-500 mb-6">or $10/year — save 17%</div>
                <ul className="space-y-2.5 text-sm text-gray-300 mb-6">
                  {[
                    { icon: Building2, text: 'Everything in Free' },
                    { icon: Gift,      text: 'Unlimited reward creation' },
                    { icon: Star,      text: 'Featured reward placement' },
                    { icon: BarChart2, text: 'Full analytics dashboard' },
                    { icon: Users,     text: 'Priority support' },
                  ].map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-sky-900 flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-sky-400" />
                      </div>
                      {text}
                    </li>
                  ))}
                </ul>
                <button onClick={onGetStarted} className="w-full bg-sky-600 hover:bg-sky-500 text-white py-3 rounded-xl font-semibold transition-all text-sm">
                  Start Premium
                </button>
              </div>

              {/* Business Promoted (add-on) */}
              <div className="bg-white rounded-2xl p-7 border border-amber-200 ring-1 ring-amber-100 text-left relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-amber-400 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Rocket className="w-3 h-3" /> ADD-ON
                </div>
                <div className="text-sm font-semibold text-amber-600 uppercase tracking-wide mb-2">Promoted</div>
                <div className="text-4xl font-bold text-gray-900 mb-1">$10<span className="text-xl font-normal text-gray-500">/day</span></div>
                <div className="text-sm text-gray-500 mb-6">Premium subscription required</div>
                <ul className="space-y-2.5 text-sm text-gray-700 mb-6">
                  {[
                    { icon: Rocket, text: 'Top of marketplace placement' },
                    { icon: Zap,    text: '"Sponsored" badge on reward' },
                    { icon: Check,  text: 'Choose days, weeks or months' },
                    { icon: Check,  text: 'Pay only for what you need' },
                    { icon: Check,  text: 'Instant activation via Stripe' },
                  ].map(({ text }) => (
                    <li key={text} className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                      </div>
                      {text}
                    </li>
                  ))}
                </ul>
                <button onClick={onGetStarted} className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-semibold transition-all text-sm">
                  Start & Promote
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {activeTab === 'families' ? 'Ready to get outside?' : 'Ready to reach local families?'}
          </h2>
          <p className="text-gray-600 mb-8">
            {activeTab === 'families'
              ? 'Join families in Portland and San Francisco already earning rewards for time well spent.'
              : 'List your business, create rewards, and connect with engaged families in Portland and San Francisco — free to start.'}
          </p>
          <button
            onClick={onGetStarted}
            className={`text-white px-10 py-4 rounded-xl text-base font-semibold transition-all hover:scale-105 shadow-lg flex items-center gap-2 mx-auto ${
              activeTab === 'families'
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                : 'bg-sky-600 hover:bg-sky-700 shadow-sky-200'
            }`}
          >
            {activeTab === 'families' ? 'Create Your Free Account' : 'List Your Business Free'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-600 rounded flex items-center justify-center">
              <TreePine className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-700 text-sm">OutdoorKids</span>
          </div>
          <p className="text-xs text-gray-400">© 2026 OutdoorKids. Portland, OR & San Francisco, CA.</p>
        </div>
      </footer>
    </div>
  );
}
