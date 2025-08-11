import React from 'react';
import { 
  Plus, 
  FileText, 
  Users, 
  Gavel, 
  Settings, 
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Archive,
  Home
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  casesCount: number;
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, casesCount, isOpen, onToggle }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'לוח בקרה', icon: Home },
    { id: 'new-case', label: 'תיק חדש', icon: Plus, color: 'text-blue-600' },
    { id: 'cases', label: 'תיקים', icon: FileText, count: casesCount },
    { id: 'parties', label: 'צדדים', icon: Users },
    { id: 'hearings', label: 'דיונים', icon: Calendar },
    { id: 'judges', label: 'שופטים', icon: Gavel },
    { id: 'analytics', label: 'דוחות', icon: BarChart3 },
    { id: 'archive', label: 'ארכיון', icon: Archive },
    { id: 'admin', label: 'הגדרות', icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      <div className={`fixed right-0 top-16 h-full bg-white border-l border-gray-200 transition-all duration-300 z-50 ${
        isOpen ? 'w-64' : 'w-16'
      } lg:relative lg:top-0 lg:h-screen lg:z-40`}>
        
        {/* Toggle Button */}
        <button
          onClick={onToggle}
          className="absolute -left-3 top-6 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 shadow-sm hidden lg:flex"
        >
          {isOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-right transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${item.color || 'text-gray-500'} ${!isOpen && 'mx-auto'}`} />
                  {isOpen && (
                    <>
                      <span className="mr-3 font-medium">{item.label}</span>
                      {item.count !== undefined && (
                        <span className="mr-auto bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                          {item.count}
                        </span>
                      )}
                    </>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}