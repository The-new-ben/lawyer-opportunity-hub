import React, { useState } from 'react';
import { Case } from '../services/caseService';
import { Download, ChevronDown, ChevronUp, Copy, Share, Calendar, User, FileText, MoreVertical } from 'lucide-react';
import { highlightText, truncateText } from '../utils/textHighlight';

interface CaseCardProps {
  caseData: Case;
  searchTerm: string;
}

export default function CaseCard({ caseData, searchTerm }: CaseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'pending': return 'status-pending';
      case 'closed': return 'status-closed';
      default: return 'status-active';
    }
  };

  const getCaseTypeColor = (type: string) => {
    switch (type) {
      case 'criminal': return 'case-criminal';
      case 'civil': return 'case-civil';
      case 'commercial': return 'case-commercial';
      case 'family': return 'case-family';
      default: return 'case-civil';
    }
  };

  const downloadCase = () => {
    let fileContent = `דוח תיק משפטי\n${'='.repeat(50)}\n\n`;
    fileContent += `מספר תיק: ${caseData.id}\n`;
    fileContent += `תאריך: ${caseData.timestamp}\n`;
    fileContent += `סוג: ${caseData.caseType || 'כללי'}\n`;
    fileContent += `סטטוס: ${caseData.status || 'פעיל'}\n\n`;
    
    if (caseData.parties) {
      fileContent += `תובע: ${caseData.parties.plaintiff}\n`;
      fileContent += `נתבע: ${caseData.parties.defendant}\n\n`;
    }
    
    fileContent += `${'='.repeat(50)}\nתיאור התיק\n${'='.repeat(50)}\n\n${caseData.description}\n\n`;
    
    caseData.opinions.forEach((opinion, index) => {
      fileContent += `${'='.repeat(50)}\nניתוח ${opinion.system.toUpperCase()}\n${'='.repeat(50)}\n\n${opinion.reply}\n\n`;
    });
    
    fileContent += `${'='.repeat(50)}\nפסק דין סופי\n${'='.repeat(50)}\n\n${caseData.balanced}\n\n`;
    
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `תיק_משפטי_${caseData.id.slice(0,8)}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="card-google">
      {/* Card Header */}
      <div 
        className="flex justify-between items-start p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <span className={getStatusColor(caseData.status || 'active')}>
              {caseData.status === 'active' ? 'פעיל' : caseData.status === 'pending' ? 'ממתין' : 'סגור'}
            </span>
            <span className={`mr-2 ${getCaseTypeColor(caseData.caseType || 'civil')}`}>
              {caseData.caseType === 'civil' ? 'אזרחי' : 
               caseData.caseType === 'criminal' ? 'פלילי' :
               caseData.caseType === 'commercial' ? 'מסחרי' :
               caseData.caseType === 'family' ? 'משפחה' : 'כללי'}
            </span>
          </div>
          
          <h3 className="font-medium text-gray-900 mb-2">
            {caseData.parties ? `${caseData.parties.plaintiff} נגד ${caseData.parties.defendant}` : 'תיק משפטי'}
          </h3>
          
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {truncateText(caseData.description, 150)}
          </p>
          
          <div className="flex items-center text-xs text-gray-500 space-x-4">
            <div className="flex items-center">
              <Calendar className="w-3 h-3 ml-1" />
              {caseData.timestamp}
            </div>
            <div className="flex items-center">
              <FileText className="w-3 h-3 ml-1" />
              {caseData.opinions.length} ניתוחים
            </div>
          </div>
        </div>
        
        <div className="flex items-center mr-4">
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
            
            {showMenu && (
              <div className="absolute left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadCase();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-right text-sm hover:bg-gray-50 flex items-center"
                >
                  <Download className="w-4 h-4 ml-2" />
                  הורד דוח
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(caseData.description);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-right text-sm hover:bg-gray-50 flex items-center"
                >
                  <Copy className="w-4 h-4 ml-2" />
                  העתק תיאור
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (navigator.share) {
                      navigator.share({
                        title: 'תיק משפטי',
                        text: truncateText(caseData.description, 100)
                      });
                    }
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-right text-sm hover:bg-gray-50 flex items-center"
                >
                  <Share className="w-4 h-4 ml-2" />
                  שתף תיק
                </button>
              </div>
            )}
          </div>
          
          <div className="mr-2 text-gray-400">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200">
          <div className="p-4 space-y-6">
            {/* Case Description */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">תיאור התיק</h4>
              <div 
                className="text-gray-700 bg-gray-50 p-3 rounded-lg"
                dangerouslySetInnerHTML={{ __html: highlightText(caseData.description, searchTerm) }}
              />
            </div>

            {/* Legal Opinions */}
            {caseData.opinions.map((opinion, index) => (
              <div key={index}>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full ml-2"></div>
                  ניתוח {opinion.system.charAt(0).toUpperCase() + opinion.system.slice(1)}
                </h4>
                <div 
                  className="text-gray-700 bg-gray-50 p-3 rounded-lg prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: highlightText(opinion.reply, searchTerm) }}
                />
              </div>
            ))}

            {/* Final Judgment */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full ml-2"></div>
                הערכה משפטית סופית
              </h4>
              <div 
                className="text-gray-700 bg-green-50 p-3 rounded-lg prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: highlightText(caseData.balanced, searchTerm) }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}