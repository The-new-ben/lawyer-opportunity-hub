import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, AlertCircle, Edit } from "lucide-react";
import { FieldState } from "./useAIAssistedIntake";

interface AIFieldsDisplayProps {
  aiFields: Record<string, FieldState>;
  nextQuestion?: string | null;
  loading?: boolean;
  onApproveField: (key: string) => void;
  onEditField: (key: string, value: string) => void;
  onApplyFields?: () => void;
}

const FIELD_LABELS: Record<string, string> = {
  caseTitle: "Case Title",
  caseSummary: "Case Summary", 
  jurisdiction: "Jurisdiction",
  legalCategory: "Legal Category",
  reliefSought: "Relief Sought",
  parties: "Parties",
  evidence: "Evidence",
  timeline: "Timeline"
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "approved": return <CheckCircle className="w-4 h-4 text-green-600" />;
    case "pending": return <Clock className="w-4 h-4 text-yellow-600" />;
    case "missing": return <AlertCircle className="w-4 h-4 text-red-600" />;
    default: return null;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "approved": return "bg-green-100 text-green-800 border-green-200";
    case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "missing": return "bg-red-100 text-red-800 border-red-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export function AIFieldsDisplay({ 
  aiFields, 
  nextQuestion, 
  loading, 
  onApproveField, 
  onEditField,
  onApplyFields 
}: AIFieldsDisplayProps) {
  const fieldsWithValues = Object.entries(aiFields).filter(([_, field]) => field.value);
  const approvedFields = fieldsWithValues.filter(([_, field]) => field.status === "approved");

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            AI Analysis in Progress...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (fieldsWithValues.length === 0) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>AI Field Analysis</span>
          {approvedFields.length > 0 && onApplyFields && (
            <Button onClick={onApplyFields} size="sm">
              Apply {approvedFields.length} Fields
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {fieldsWithValues.map(([key, field]) => (
          <div key={key} className="flex items-center gap-2 p-3 rounded-lg border bg-card">
            <div className="flex items-center gap-2 flex-1">
              {getStatusIcon(field.status)}
              <span className="font-medium text-sm">{FIELD_LABELS[key] || key}:</span>
              <span className="text-sm text-muted-foreground truncate max-w-xs">
                {field.value}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getStatusColor(field.status)}>
                {Math.round(field.confidence * 100)}%
              </Badge>
              
              {field.status === "pending" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onApproveField(key)}
                >
                  <CheckCircle className="w-3 h-3" />
                </Button>
              )}
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  const newValue = prompt(`Edit ${FIELD_LABELS[key] || key}:`, field.value);
                  if (newValue !== null) {
                    onEditField(key, newValue);
                  }
                }}
              >
                <Edit className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
        
        {nextQuestion && (
          <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">Next Question:</p>
                <p className="text-sm text-blue-700">{nextQuestion}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}