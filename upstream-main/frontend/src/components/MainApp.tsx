import React, { useState, useEffect } from 'react';
import Header from './Header';
import CaseForm from './CaseForm';
import CasesList from './CasesList';
import AdminPanel from './AdminPanel';
import { Case, caseService } from '../services/caseService';

export default function MainApp() {
  const [cases, setCases] = useState<Case[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('cases');

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    const allCases = await caseService.getAllCases();
    setCases(allCases);
  };

  const handleNewCase = async (caseData: Case) => {
    await caseService.saveCase(caseData);
    await loadCases();
  };

  const handleClearAll = async () => {
    if (confirm('האם למחוק את כל הדיונים לצמיתות?')) {
      await caseService.clearAllCases();
      setCases([]);
    }
  };

  const filteredCases = searchTerm
    ? cases.filter(c => 
        [c.description, c.balanced, ...c.opinions.map(o => o.reply)]
          .some(text => text?.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : cases;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className={`${isLoading ? 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50' : 'hidden'}`}>
        <div className="bg-white rounded-lg p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl">מעבד...</div>
        </div>
      </div>

      <Header />
      
      <main className="flex-1 p-6 max-w-6xl mx-auto w-full">
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('cases')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'cases'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              דיונים משפטיים
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'admin'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              ניהול מערכת
            </button>
          </nav>
        </div>

        {activeTab === 'cases' && (
          <>
            <CaseForm 
              onNewCase={handleNewCase}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
            
            <div className="mt-6 flex gap-4 items-center">
              <input
                type="text"
                placeholder="חיפוש בדיונים..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleClearAll}
                className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                נקה הכל
              </button>
            </div>

            <CasesList cases={filteredCases} searchTerm={searchTerm} />
          </>
        )}

        {activeTab === 'admin' && (
          <AdminPanel />
        )}
      </main>
    </div>
  );
}