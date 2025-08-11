import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import CaseForm from './CaseForm';
import CasesList from './CasesList';
import AdminPanel from './AdminPanel';
import { Case, caseService } from '../services/caseService';

export default function MainApp() {
  const [cases, setCases] = useState<Case[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      const allCases = await caseService.getAllCases();
      setCases(allCases);
    } catch (error) {
      console.error('Error loading cases:', error);
    }
  };

  const handleNewCase = async (caseData: Case) => {
    try {
      await caseService.saveCase(caseData);
      await loadCases();
      setActiveTab('cases');
    } catch (error) {
      console.error('Error saving case:', error);
    }
  };

  const filteredCases = searchTerm
    ? cases.filter(c => 
        [c.description, c.balanced, ...c.opinions.map(o => o.reply)]
          .some(text => text?.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : cases;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard casesCount={cases.length} />;
      case 'new-case':
        return (
          <CaseForm 
            onNewCase={handleNewCase}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        );
      case 'cases':
        return (
          <>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-normal text-gray-900">תיקים משפטיים</h2>
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    placeholder="חיפוש תיקים..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-google"
                  />
                  <button 
                    onClick={() => setActiveTab('new-case')}
                    className="btn-google"
                  >
                    תיק חדש
                  </button>
                </div>
              </div>
            </div>
            <CasesList 
              cases={filteredCases} 
              searchTerm={searchTerm}
              onNewCase={() => setActiveTab('new-case')}
            />
          </>
        );
      case 'admin':
        return <AdminPanel />;
      default:
        return <Dashboard casesCount={cases.length} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-lg font-medium text-gray-700">מעבד תיק משפטי</div>
            <div className="text-sm text-gray-500 mt-1">אנא המתן בזמן עיבוד התיק</div>
          </div>
        </div>
      )}

      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          casesCount={cases.length}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'mr-64' : 'mr-16'} lg:mr-0`}>
          <div className="max-w-5xl mx-auto p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}