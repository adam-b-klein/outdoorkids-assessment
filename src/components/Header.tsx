import React from 'react';
import { Link } from 'react-router-dom';
import { Trees, User, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';

export function Header() {
  const { user, signOut } = useAuth();
  const { planName } = useSubscription();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Trees className="w-8 h-8 text-green-600" />
            <span className="text-xl font-bold text-gray-900">OutdoorKids</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/activities" className="text-gray-700 hover:text-gray-900 font-medium">
              Activities
            </Link>
            <Link to="/pricing" className="text-gray-700 hover:text-gray-900 font-medium">
              Pricing
            </Link>
            {user && (
              <Link to="/dashboard" className="text-gray-700 hover:text-gray-900 font-medium">
                Dashboard
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-gray-600" />
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">{user.email}</div>
                    <div className="text-gray-600">{planName}</div>
                  </div>
                </div>
                <button
                  onClick={signOut}
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-gray-900 font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}