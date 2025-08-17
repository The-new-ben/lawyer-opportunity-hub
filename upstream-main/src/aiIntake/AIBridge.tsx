import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FIELD_MAP, REQUIRED_FIELDS, FieldMapKey } from './fieldMap';
import { FieldState } from './useAIAssistedIntake';
import { Zap, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface AIBridgeProps {
  aiFields: Record<string, FieldState>;
  onApplyFields: (fieldsToApply: Record<string, any>) => void;
  onApplyOne?: (fieldKey: string, value: any) => void;
  isLocked?: (formPath: string) => boolean;
}

export default function AIBridge({ 
  aiFields, 
  onApplyFields, 
  onApplyOne, 
  isLocked 
}: AIBridgeProps) {
  
  // Get all approved fields that can be applied
  const getApplicableFields = () => {
    const applicable: Record<string, any> = {};
    
    Object.entries(aiFields).forEach(([aiKey, field]) => {
      const map = (FIELD_MAP as any)[aiKey];
      if (!map) return;
      
      const formPath = map.formPath;
      if (isLocked && isLocked(formPath)) return;
      if (field.status !== 'approved') return;
      
      // Map AI field value to form structure
      switch (aiKey) {
        case 'parties':
          if (field.value) {
            const parsedParties = field.value.split(';').map(p => {
              const [role, name] = p.split(':').map(s => s.trim());
              return { role: role || 'party', name: name || '' };
            }).filter(p => p.role);
            applicable.parties = parsedParties;
          }
          break;
        case 'evidence':
          if (field.value) {
            const parsedEvidence = field.value.split(',').map(e => e.trim()).filter(e => e);
            applicable.evidence = parsedEvidence;
          }
          break;
        default:
          applicable[formPath] = field.value;
      }
    });
    
    return applicable;
  };

  const applyAllFields = () => {
    const fieldsToApply = getApplicableFields();
    if (Object.keys(fieldsToApply).length > 0) {
      onApplyFields(fieldsToApply);
    }
  };

  const applyOneField = (fieldKey: string) => {
    const field = aiFields[fieldKey];
    if (!field || field.status !== 'approved') return;
    
    const map = (FIELD_MAP as any)[fieldKey];
    if (!map) return;
    
    const formPath = map.formPath;
    if (isLocked && isLocked(formPath)) return;
    
    let value: any = field.value;
    
    // Transform value based on field type
    switch (fieldKey) {
      case 'parties':
        if (field.value) {
          value = field.value.split(';').map(p => {
            const [role, name] = p.split(':').map(s => s.trim());
            return { role: role || 'party', name: name || '' };
          }).filter(p => p.role);
        }
        break;
      case 'evidence':
        if (field.value) {
          value = field.value.split(',').map(e => e.trim()).filter(e => e);
        }
        break;
    }
    
    if (onApplyOne) {
      onApplyOne(formPath, value);
    }
  };

  const approvedCount = Object.values(aiFields).filter(f => f.status === 'approved').length;
  const applicableFields = getApplicableFields();
  const applicableCount = Object.keys(applicableFields).length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'pending': return <Clock className="w-3 h-3 text-orange-500" />;
      default: return <AlertCircle className="w-3 h-3 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-lg">AI Field Bridge</h3>
        <Badge variant="secondary">{approvedCount} Ready</Badge>
      </div>
      
      {Object.keys(aiFields).length > 0 && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {Object.entries(aiFields).map(([key, field]) => (
              <div key={key} className="flex items-center gap-2">
                <Badge className={getStatusColor(field.status)}>
                  {getStatusIcon(field.status)}
                  <span className="ml-1 text-xs">{key}</span>
                  {field.confidence && (
                    <span className="ml-1 text-xs opacity-70">
                      {Math.round(field.confidence * 100)}%
                    </span>
                  )}
                </Badge>
                {field.status === 'approved' && onApplyOne && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => applyOneField(key)}
                    className="text-xs px-2 py-1 h-6"
                  >
                    Apply
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {applicableCount > 0 && (
        <div className="flex items-center gap-2 pt-2 border-t">
          <Button 
            onClick={applyAllFields}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            <Zap className="w-4 h-4 mr-2" />
            Apply All AI Fields ({applicableCount})
          </Button>
          <Badge variant="outline" className="text-xs">
            One-Click Apply Ready
          </Badge>
        </div>
      )}
      
      {Object.keys(aiFields).length === 0 && (
        <p className="text-sm text-muted-foreground italic">
          Start chatting with AI to see field suggestions appear here
        </p>
      )}
    </div>
  );
}