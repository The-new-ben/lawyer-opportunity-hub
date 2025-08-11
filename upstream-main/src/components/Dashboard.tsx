import React from 'react';
import { FileText, Users, Gavel, TrendingUp, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface DashboardProps {
  casesCount: number;
}

export default function Dashboard({ casesCount }: DashboardProps) {
  const stats = [
    { title: 'סה"כ תיקים', value: casesCount, icon: FileText, color: 'bg-blue-600', bgColor: 'bg-blue-50' },
    { title: 'תיקים פעילים', value: Math.floor(casesCount * 0.7), icon: Clock, color: 'bg-green-600', bgColor: 'bg-green-50' },
    { title: 'תיקים שהושלמו', value: Math.floor(casesCount * 0.3), icon: CheckCircle, color: 'bg-purple-600', bgColor: 'bg-purple-50' },
    { title: 'דיונים השבוע', value: 12, icon: Calendar, color: 'bg-orange-600', bgColor: 'bg-orange-50' },
  ];

  const recentActivity = [
    { action: 'נוצר תיק חדש', case: 'כהן נגד לוי', time: 'לפני 2 שעות', type: 'new', status: 'חדש' },
    { action: 'נקבע דיון', case: 'ישראל נגד רוזן', time: 'לפני 4 שעות', type: 'hearing', status: 'בתהליך' },
    { action: 'הוגש פסק דין', case: 'אברהם נגד דוד', time: 'לפני יום', type: 'verdict', status: 'הושלם' },
    { action: 'עודכן סטטוס', case: 'שרה נגד מרים', time: 'לפני יומיים', type: 'update', status: 'עודכן' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-normal text-gray-900">לוח בקרה</h2>
        <p className="text-gray-600 mt-1">סקירה כללית של המערכת והפעילות האחרונה</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className={`${stat.bgColor} rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow`}>
            <div className="flex items-center">
              <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">פעילות אחרונה</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 px-2 rounded transition-colors">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'new' ? 'bg-blue-100' :
                    activity.type === 'hearing' ? 'bg-green-100' :
                    activity.type === 'verdict' ? 'bg-purple-100' : 'bg-orange-100'
                  }`}>
                    {activity.type === 'new' && <FileText className="w-4 h-4 text-blue-600" />}
                    {activity.type === 'hearing' && <Calendar className="w-4 h-4 text-green-600" />}
                    {activity.type === 'verdict' && <Gavel className="w-4 h-4 text-purple-600" />}
                    {activity.type === 'update' && <AlertCircle className="w-4 h-4 text-orange-600" />}
                  </div>
                  <div className="mr-3">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.case}</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      activity.status === 'חדש' ? 'bg-blue-100 text-blue-800' :
                      activity.status === 'בתהליך' ? 'bg-yellow-100 text-yellow-800' :
                      activity.status === 'הושלם' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">פעולות מהירות</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center font-medium">
              <FileText className="w-4 h-4 ml-2" />
              צור תיק חדש
            </button>
            <button className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center font-medium">
              <Calendar className="w-4 h-4 ml-2" />
              קבע דיון
            </button>
            <button className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center font-medium">
              <Users className="w-4 h-4 ml-2" />
              הוסף צד
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}