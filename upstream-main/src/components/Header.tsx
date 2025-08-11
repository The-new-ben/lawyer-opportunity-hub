import React from 'react';
import { Scale, Menu, Search, Settings, User, Bell } from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-full mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Right side - Logo and Menu */}
          <div className="flex items-center">
            <button 
              onClick={onMenuClick}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors ml-2"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-sm">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <h1 className="mr-3 text-xl font-normal text-gray-900">
                פלטפורמת צדק
              </h1>
            </div>
          </div>
          
          {/* Center - Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="חיפוש תיקים, צדדים או פסקי דין..."
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white hover:shadow-sm transition-all"
              />
            </div>
          </div>
          
          {/* Left side - User actions */}
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
            <button className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors shadow-sm">
              <User className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}