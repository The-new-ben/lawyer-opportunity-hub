import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Database, 
  Settings, 
  Activity, 
  Download, 
  Trash2,
  RefreshCw,
  BarChart3,
  Shield,
  AlertTriangle
} from 'lucide-react';

export default function AdminPanel() {
  const [stats, setStats] = useState({
    totalCases: 0,
    activeCases: 0,
    completedCases: 0,
    systemHealth: 'Operational'
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      // Get cases from IndexedDB
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open('GlobalLegalAI_v7', 1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      const transaction = db.transaction('cases', 'readonly');
      const store = transaction.objectStore('cases');
      const request = store.getAll();
      
      request.onsuccess = () => {
        const cases = request.result || [];
        const activeCases = cases.filter((c: any) => c.status === 'active').length;
        const completedCases = cases.filter((c: any) => c.status === 'closed').length;
        
        setStats({
          totalCases: cases.length,
          activeCases,
          completedCases,
          systemHealth: 'Operational'
        });
      };
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats(prev => ({ ...prev, systemHealth: 'Error' }));
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open('GlobalLegalAI_v7', 1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      const transaction = db.transaction('cases', 'readonly');
      const store = transaction.objectStore('cases');
      const request = store.getAll();
      
      request.onsuccess = () => {
        const data = {
          exportDate: new Date().toISOString(),
          system: 'Justice Platform',
          version: '1.0',
          cases: request.result,
          totalCases: request.result.length
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { 
          type: 'application/json' 
        });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Justice_Platform_Backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(link.href);
      };
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const clearAllData = async () => {
    if (confirm('Are you sure you want to delete all system data? This action cannot be undone.')) {
      try {
        const db = await new Promise<IDBDatabase>((resolve, reject) => {
          const request = indexedDB.open('GlobalLegalAI_v7', 1);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });

        const transaction = db.transaction('cases', 'readwrite');
        const store = transaction.objectStore('cases');
        store.clear();
        
        await loadStats();
      } catch (error) {
        console.error('Clear data failed:', error);
      }
    }
  };

  const statCards = [
    {
      title: 'Total Cases',
      value: stats.totalCases,
      icon: Database,
      color: 'bg-blue-50 text-blue-600',
      bgColor: 'bg-blue-600'
    },
    {
      title: 'Active Cases',
      value: stats.activeCases,
      icon: Activity,
      color: 'bg-green-50 text-green-600',
      bgColor: 'bg-green-600'
    },
    {
      title: 'Completed Cases',
      value: stats.completedCases,
      icon: BarChart3,
      color: 'bg-purple-50 text-purple-600',
      bgColor: 'bg-purple-600'
    },
    {
      title: 'System Status',
      value: stats.systemHealth,
      icon: Shield,
      color: 'bg-gray-50 text-gray-600',
      bgColor: 'bg-gray-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-medium text-gray-900">System Administration</h2>
          <p className="text-gray-600 mt-1">Manage system settings and monitor platform performance</p>
        </div>
        <button
          onClick={loadStats}
          disabled={isLoading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">System Actions</h3>
          <p className="text-sm text-gray-600 mt-1">Manage system data and configurations</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={exportData}
              className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-5 h-5 mr-2" />
              Export System Data
            </button>
            
            <button
              onClick={clearAllData}
              className="flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-5 h-5 mr-2" />
              Clear All Data
            </button>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">System Information</h3>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Platform Details</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Version:</strong> Justice Platform v1.0</p>
                <p><strong>Environment:</strong> {import.meta.env.PROD ? 'Production' : 'Development'}</p>
                <p><strong>Database:</strong> IndexedDB (Local Storage)</p>
                <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Features</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Multi-jurisdictional legal analysis</p>
                <p>• Case management and tracking</p>
                <p>• Document generation and export</p>
                <p>• Secure data storage and backup</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}