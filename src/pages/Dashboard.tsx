import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, Calendar, MapPin, Star } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';

export function Dashboard() {
  const { user } = useAuth();
  const { subscription, isActive, planName } = useSubscription();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h1>
          <Link to="/login" className="text-blue-600 hover:text-blue-500">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
          <p className="text-gray-600 mt-2">Here's what's happening with your OutdoorKids account</p>
        </div>

        {/* Subscription Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Crown className={`w-6 h-6 ${isActive ? 'text-yellow-500' : 'text-gray-400'}`} />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Subscription Status</h2>
                <p className="text-gray-600">Current plan: {planName}</p>
              </div>
            </div>
            {!isActive && (
              <Link
                to="/pricing"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Upgrade Plan
              </Link>
            )}
          </div>
          
          {subscription && isActive && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <p className="text-green-800 text-sm">
                Your subscription is active and will renew automatically.
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/activities"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <MapPin className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Find Activities</h3>
            <p className="text-gray-600 text-sm">Discover amazing outdoor activities near you</p>
          </Link>

          <Link
            to="/calendar"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <Calendar className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">My Calendar</h3>
            <p className="text-gray-600 text-sm">View your scheduled activities and events</p>
          </Link>

          <Link
            to="/favorites"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <Star className="w-8 h-8 text-yellow-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Favorites</h3>
            <p className="text-gray-600 text-sm">Your saved activities and locations</p>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="text-center py-8 text-gray-500">
            <p>No recent activity to show</p>
            <Link to="/activities" className="text-blue-600 hover:text-blue-500 mt-2 inline-block">
              Start exploring activities
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}