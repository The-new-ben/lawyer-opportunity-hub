import React, { useState } from 'react';
import { aiService } from '../services/aiService';
import { Case } from '../services/caseService';
import { Upload, Users, Gavel, FileText, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

interface CaseFormProps {
  onNewCase: (caseData: Case) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export default function CaseForm({ onNewCase, isLoading, setIsLoading }: CaseFormProps) {
  const [description, setDescription] = useState('');
  const [selectedSystems, setSelectedSystems] = useState<string[]>(['common law']);
  const [caseType, setCaseType] = useState('civil');
  const [parties, setParties] = useState({ plaintiff: '', defendant: '' });
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  const systems = [
    { value: 'common law', label: 'משפט אנגלו-אמריקאי', flag: '🇺🇸' },
    { value: 'civil law', label: 'משפט קונטיננטלי', flag: '🇪🇺' },
    { value: 'islamic law', label: 'משפט אסלאמי', flag: '☪️' },
    { value: 'jewish law', label: 'הלכה יהודית', flag: '✡️' },
    { value: 'customary law', label: 'משפט מנהגי', flag: '🌍' },
    { value: 'mixed systems', label: 'מערכות מעורבות', flag: '🌐' }
  ];

  const caseTypes = [
    { value: 'civil', label: 'תיק אזרחי' },
    { value: 'criminal', label: 'תיק פלילי' },
    { value: 'commercial', label: 'תיק מסחרי' },
    { value: 'family', label: 'תיק משפחה' },
    { value: 'administrative', label: 'תיק מנהלי' }
  ];

  const handleSystemChange = (systemValue: string) => {
    setSelectedSystems(prev => 
      prev.includes(systemValue)
        ? prev.filter(s => s !== systemValue)
        : [...prev, systemValue]
    );
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      setError('נא להזין תיאור התיק.');
      return;
    }

    if (selectedSystems.length === 0) {
      setError('נא לבחור לפחות מערכת משפט אחת.');
      return;
    }

    if (!parties.plaintiff.trim() || !parties.defendant.trim()) {
      setError('נא להזין שמות התובע והנתבע.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      // שלב 1: יצירת התיק
      const caseId = crypto.randomUUID();
      
      // שלב 2: ניתוח משפטי
      const opinions = await Promise.all(
        selectedSystems.map(async (system) => {
          const systemName = systems.find(s => s.value === system)?.label || system;
          const prompt = `נתח תיק ${caseTypes.find(t => t.value === caseType)?.label} זה מנקודת המבט של ${systemName}. ספק ניתוח משפטי מקיף.`;
          
          const reply = await aiService.chat([
            { role: 'system', content: `אתה מומחה משפטי המתמחה ב${systemName}. ${prompt}` },
            { role: 'user', content: `תיק: ${description}\nתובע: ${parties.plaintiff}\nנתבע: ${parties.defendant}` }
          ]);

          return { system, reply };
        })
      );

      // שלב 3: פסק דין מאוזן
      const balanced = selectedSystems.length > 1 
        ? await aiService.chat([
            { 
              role: 'system', 
              content: 'אתה שופט בלתי תלוי בבית המשפט העליון. ספק פסק דין מאוזן ומנומק המתחשב בכל נקודות המבט המשפטיות.' 
            },
            { 
              role: 'user', 
              content: `תיק: ${description}\n\nניתוח התיק:\n\n${opinions.map(o => `${systems.find(s => s.value === o.system)?.label}:\n${o.reply}`).join('\n\n---\n\n')}`
            }
          ])
        : opinions[0].reply;

      const caseData: Case = {
        id: caseId,
        description,
        opinions,
        balanced,
        timestamp: new Date().toLocaleString('he-IL'),
        parties,
        caseType,
        status: 'active',
        priority: 'medium',
        tags: [caseType, ...selectedSystems]
      };

      onNewCase(caseData);
      setDescription('');
      setParties({ plaintiff: '', defendant: '' });
      setSelectedSystems(['common law']);
      setCaseType('civil');
      setCurrentStep(1);

    } catch (err: any) {
      setError(err.message || 'אירעה שגיאה במהלך העיבוד.');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && !description.trim()) {
      setError('נא להזין תיאור התיק.');
      return;
    }
    if (currentStep === 2 && (!parties.plaintiff.trim() || !parties.defendant.trim())) {
      setError('נא להזין שמות שני הצדדים.');
      return;
    }
    setError('');
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-medium text-gray-900">יצירת תיק משפטי חדש</h2>
        <p className="text-sm text-gray-600 mt-1">עקוב אחר השלבים ליצירת הליך משפטי חדש</p>
      </div>

      {/* Progress Steps */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {[
            { step: 1, title: 'פרטי התיק', icon: FileText },
            { step: 2, title: 'צדדים', icon: Users },
            { step: 3, title: 'מערכות משפט', icon: Gavel },
            { step: 4, title: 'סקירה ושליחה', icon: CheckCircle }
          ].map(({ step, title, icon: Icon }) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className={`mr-2 text-sm font-medium ${
                currentStep >= step ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {title}
              </span>
              {step < 4 && <div className="w-12 h-px bg-gray-300 mx-4" />}
            </div>
          ))}
        </div>
      </div>

      <div className="p-6">
        {/* Step 1: Case Details */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                סוג התיק
              </label>
              <select
                value={caseType}
                onChange={(e) => setCaseType(e.target.value)}
                className="input-google"
                disabled={isLoading}
              >
                {caseTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                תיאור התיק
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="ספק תיאור מפורט של התיק המשפטי, כולל עובדות רלוונטיות, נסיבות ונושאים משפטיים..."
                className="input-google min-h-[120px] resize-y"
                disabled={isLoading}
              />
            </div>
          </div>
        )}

        {/* Step 2: Parties */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  תובע
                </label>
                <input
                  type="text"
                  value={parties.plaintiff}
                  onChange={(e) => setParties(prev => ({ ...prev, plaintiff: e.target.value }))}
                  placeholder="הזן שם התובע"
                  className="input-google"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  נתבע
                </label>
                <input
                  type="text"
                  value={parties.defendant}
                  onChange={(e) => setParties(prev => ({ ...prev, defendant: e.target.value }))}
                  placeholder="הזן שם הנתבע"
                  className="input-google"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">השלבים הבאים</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• בחירת מערכות משפט רלוונטיות לניתוח</li>
                <li>• בחירת ייצוג משפטי (אופציונלי)</li>
                <li>• תיאום דיונים עם שופטים זמינים</li>
                <li>• הגשת התיק לבדיקה משפטית</li>
              </ul>
            </div>
          </div>
        )}

        {/* Step 3: Legal Systems */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                בחר מערכות משפט לניתוח
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {systems.map(system => (
                  <label key={system.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSystems.includes(system.value)}
                      onChange={() => handleSystemChange(system.value)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 ml-3"
                      disabled={isLoading}
                    />
                    <span className="text-xl ml-3">{system.flag}</span>
                    <span className="text-sm text-gray-700">{system.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">סיכום התיק</h4>
              <div className="space-y-2 text-sm">
                <p><strong>סוג:</strong> {caseTypes.find(t => t.value === caseType)?.label}</p>
                <p><strong>תובע:</strong> {parties.plaintiff}</p>
                <p><strong>נתבע:</strong> {parties.defendant}</p>
                <p><strong>מערכות משפט:</strong> {selectedSystems.length} נבחרו</p>
                <p><strong>תיאור:</strong> {description.substring(0, 100)}...</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={prevStep}
            disabled={currentStep === 1 || isLoading}
            className="btn-google-secondary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            הקודם
          </button>
          
          <div className="flex space-x-3">
            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                disabled={isLoading}
                className="btn-google flex items-center"
              >
                הבא
                <ArrowLeft className="w-4 h-4 mr-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="btn-google flex items-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                    מעבד...
                  </>
                ) : (
                  'הגש תיק'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}