'use client';

import { useState } from 'react';
import { Database, Trash2, RefreshCw, BarChart3, AlertTriangle } from 'lucide-react';

interface DatabaseStats {
  projects: number;
  tasks: number;
  teamMembers: number;
  completedTasks: number;
  inProgressTasks: number;
  notStartedTasks: number;
}

interface DatabaseManagerProps {
  onDataChange?: () => void;
}

export default function DatabaseManager({ onDataChange }: DatabaseManagerProps) {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/database');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch database stats:', error);
    }
  };

  const performAction = async (action: 'clean' | 'seed' | 'reset') => {
    try {
      setLoading(true);
      const response = await fetch('/api/database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        await fetchStats();
        if (onDataChange) {
          onDataChange();
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Database operation failed:', error);
      alert('Operation failed');
    } finally {
      setLoading(false);
      setShowConfirm(null);
    }
  };

  const handleActionClick = (action: 'clean' | 'seed' | 'reset') => {
    setShowConfirm(action);
  };

  const confirmAction = () => {
    if (showConfirm) {
      performAction(showConfirm as 'clean' | 'seed' | 'reset');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Database className="mr-2 h-5 w-5" />
          Database Management
        </h3>
        <button
          onClick={fetchStats}
          className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh Stats
        </button>
      </div>

      {/* Database Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Projects</p>
                <p className="text-2xl font-semibold text-blue-900">{stats.projects}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-green-600 rounded-full"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Total Tasks</p>
                <p className="text-2xl font-semibold text-green-900">{stats.tasks}</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-purple-600 rounded-full"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-600">Team Members</p>
                <p className="text-2xl font-semibold text-purple-900">{stats.teamMembers}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Status Breakdown */}
      {stats && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Task Status Breakdown</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm text-green-700">Completed</span>
              <span className="font-semibold text-green-900">{stats.completedTasks}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-blue-700">In Progress</span>
              <span className="font-semibold text-blue-900">{stats.inProgressTasks}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">Not Started</span>
              <span className="font-semibold text-gray-900">{stats.notStartedTasks}</span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => handleActionClick('seed')}
            disabled={loading}
            className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Seed Sample Data
          </button>

          <button
            onClick={() => handleActionClick('clean')}
            disabled={loading}
            className="flex items-center justify-center px-4 py-3 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clean Database
          </button>

          <button
            onClick={() => handleActionClick('reset')}
            disabled={loading}
            className="flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Reset Database
          </button>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>Seed Sample Data:</strong> Adds comprehensive sample projects and tasks (keeps existing data)</p>
          <p><strong>Clean Database:</strong> Removes all data from the database</p>
          <p><strong>Reset Database:</strong> Cleans database and then adds fresh sample data</p>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Confirm Action</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              {showConfirm === 'clean' && 'This will permanently delete all projects, tasks, and team members from the database.'}
              {showConfirm === 'seed' && 'This will add sample data to the database. Existing data will be preserved.'}
              {showConfirm === 'reset' && 'This will delete all existing data and replace it with fresh sample data.'}
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 ${
                  showConfirm === 'clean' || showConfirm === 'reset'
                    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                    : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                }`}
              >
                {showConfirm === 'clean' && 'Clean Database'}
                {showConfirm === 'seed' && 'Add Sample Data'}
                {showConfirm === 'reset' && 'Reset Database'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-gray-900">Processing...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
