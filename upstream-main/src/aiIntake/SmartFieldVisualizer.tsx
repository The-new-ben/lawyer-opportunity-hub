import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Edit3, 
  Zap, 
  Eye,
  EyeOff,
  Sparkles,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

interface FieldUpdate {
  field: string;
  value: any;
  confidence: number;
  source: 'ai' | 'user';
  timestamp: Date;
}

interface SmartFieldVisualizerProps {
  fieldUpdates: Record<string, any>;
  onFieldApprove: (field: string, value: any) => void;
  onFieldEdit: (field: string, value: any) => void;
  progress: { score: number; message: string; completedFields: string[] };
  isVisible?: boolean;
  onToggleVisibility?: () => void;
}

const FIELD_LABELS = {
  title: 'כותרת התיק',
  summary: 'תקציר המקרה',
  jurisdiction: 'תחום שיפוט',
  category: 'קטגוריה משפטית',
  goal: 'מטרת התיק',
  parties: 'הצדדים',
  evidence: 'ראיות',
  timeline: 'ציר זמן',
  location: 'מיקום',
  claimAmount: 'סכום התביעה',
  contractDate: 'תאריך החוזה',
  incidentDate: 'תאריך האירוע'
};

const getFieldIcon = (field: string) => {
  const icons = {
    title: '📝',
    summary: '📋',
    jurisdiction: '⚖️',
    category: '🏷️',
    goal: '🎯',
    parties: '👥',
    evidence: '📎',
    timeline: '⏰',
    location: '📍',
    claimAmount: '💰',
    contractDate: '📅',
    incidentDate: '📅'
  };
  return icons[field as keyof typeof icons] || '📄';
};

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 0.9) return 'text-green-600 bg-green-50 border-green-200';
  if (confidence >= 0.7) return 'text-blue-600 bg-blue-50 border-blue-200';
  if (confidence >= 0.5) return 'text-orange-600 bg-orange-50 border-orange-200';
  return 'text-red-600 bg-red-50 border-red-200';
};

export const SmartFieldVisualizer: React.FC<SmartFieldVisualizerProps> = ({
  fieldUpdates,
  onFieldApprove,
  onFieldEdit,
  progress,
  isVisible = true,
  onToggleVisibility
}) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showAllFields, setShowAllFields] = useState(false);

  const fieldEntries = Object.entries(fieldUpdates);
  const hasUpdates = fieldEntries.length > 0;

  const handleStartEdit = (field: string, currentValue: any) => {
    setEditingField(field);
    setEditValue(String(currentValue || ''));
  };

  const handleSaveEdit = () => {
    if (editingField) {
      onFieldEdit(editingField, editValue);
      setEditingField(null);
      setEditValue('');
    }
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  if (!isVisible) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <Button
            variant="outline"
            onClick={onToggleVisibility}
            className="w-full"
          >
            <Eye className="w-4 h-4 mr-2" />
            הצג שדות שזוהו על ידי AI
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!hasUpdates) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            שדות חכמים
            {onToggleVisibility && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleVisibility}
                className="mr-auto"
              >
                <EyeOff className="w-4 h-4" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              AI מחכה לקלט שלך
            </h3>
            <p className="text-gray-600 text-sm">
              התחל לכתוב על התיק שלך והמערכת תזהה אוטומטית את השדות הרלוונטיים
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayedFields = showAllFields ? fieldEntries : fieldEntries.slice(0, 4);

  return (
    <Card className="border-blue-200 bg-blue-50/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            שדות שזוהו אוטומטית
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {fieldEntries.length}
            </Badge>
          </CardTitle>
          {onToggleVisibility && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleVisibility}
            >
              <EyeOff className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        {/* Progress indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-700 font-medium">{progress.message}</span>
            <span className="text-blue-600">{progress.score}%</span>
          </div>
          <Progress value={progress.score} className="h-2" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {displayedFields.map(([field, value]) => (
          <div
            key={field}
            className="group p-4 border rounded-lg bg-white/70 hover:bg-white transition-all duration-200 hover:shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl shrink-0 mt-1">
                {getFieldIcon(field)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">
                    {FIELD_LABELS[field as keyof typeof FIELD_LABELS] || field}
                  </h4>
                  <div className="flex items-center gap-2">
                    {/* AI confidence indicator */}
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getConfidenceColor(0.85)}`}
                    >
                      AI: 85%
                    </Badge>
                  </div>
                </div>
                
                {editingField === field ? (
                  <div className="space-y-3">
                    {field === 'summary' || field === 'evidence' || field === 'timeline' ? (
                      <Textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="min-h-[100px]"
                        autoFocus
                      />
                    ) : (
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        autoFocus
                      />
                    )}
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveEdit}>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        שמור
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                        ביטול
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-700 text-sm leading-relaxed mb-3 text-right">
                      {String(value)}
                    </p>
                    
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        onClick={() => onFieldApprove(field, value)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        אישור
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStartEdit(field, value)}
                      >
                        <Edit3 className="w-3 h-3 mr-1" />
                        עריכה
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {fieldEntries.length > 4 && (
          <Button
            variant="outline"
            onClick={() => setShowAllFields(!showAllFields)}
            className="w-full"
          >
            {showAllFields ? (
              <>הסתר חלק מהשדות</>
            ) : (
              <>
                הצג עוד {fieldEntries.length - 4} שדות
                <ArrowRight className="w-4 h-4 mr-2" />
              </>
            )}
          </Button>
        )}
        
        {/* Bulk actions */}
        {fieldEntries.length > 1 && (
          <>
            <div className="border-t pt-4 mt-4">
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    fieldEntries.forEach(([field, value]) => {
                      onFieldApprove(field, value);
                    });
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  אשר הכל ({fieldEntries.length})
                </Button>
              </div>
            </div>
            
            <div className="text-xs text-center text-gray-500">
              💡 טיפ: אישור מהיר של כל השדות יזרז את התהליך
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};