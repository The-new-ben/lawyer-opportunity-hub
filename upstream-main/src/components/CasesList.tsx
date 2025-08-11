import React from 'react';
import { Case } from '../services/caseService';
import CaseCard from './CaseCard';
import { FileText, Plus } from 'lucide-react';

interface CasesListProps {
  cases: Case[];
  searchTerm: string;
  onNewCase?: () => void;
}

export default function CasesList({ cases, searchTerm, onNewCase }: CasesListProps) {
  if (cases.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">אין תיקים משפטיים עדיין</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          התחל ביצירת התיק המשפטי הראשון שלך כדי לראות ניתוח מקיף ותיעוד כאן.
        </p>
        <button 
          onClick={onNewCase}
          className="btn-google flex items-center mx-auto"
        >
          <Plus className="w-4 h-4 ml-2" />
          צור תיק חדש
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {searchTerm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            מציג {cases.length} תוצא{cases.length !== 1 ? 'ות' : 'ה'} עבור "{searchTerm}"
          </p>
        </div>
      )}
      
      {cases.slice().reverse().map(caseItem => (
        <CaseCard 
          key={caseItem.id} 
          caseData={caseItem} 
          searchTerm={searchTerm} 
        />
      ))}
    </div>
  );
}