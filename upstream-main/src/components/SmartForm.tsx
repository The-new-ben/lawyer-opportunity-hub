import { useFieldExtraction } from "@/hooks/useFieldExtraction";
import { useCaseDraft } from "@/hooks/useCaseDraft";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Check, X, MapPin, Users, Scale } from "lucide-react";

export function SmartForm() {
  const { draft } = useCaseDraft();
  const { fields, progress } = useFieldExtraction("");

  const getFieldIcon = (fieldName: string) => {
    switch (fieldName) {
      case 'jurisdiction': return <Scale className="h-4 w-4" />;
      case 'parties': return <Users className="h-4 w-4" />;
      case 'location': return <MapPin className="h-4 w-4" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-500';
      case 'partial': return 'bg-yellow-500';
      case 'pending': return 'bg-gray-300';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="p-4 space-y-4 overflow-y-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>התקדמות הטופס</span>
            <Badge variant="secondary">{Math.round(progress)}%</Badge>
          </CardTitle>
          <Progress value={progress} className="w-full" />
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>שדות שזוהו</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {fields.map((field) => (
            <div key={field.name} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {getFieldIcon(field.name)}
                <div>
                  <p className="font-medium">{field.name}</p>
                  <p className="text-sm text-muted-foreground">{field.value}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(field.status)}`} />
                <span className="text-xs text-muted-foreground">
                  {Math.round(field.confidence * 100)}%
                </span>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-6 w-6">
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-6 w-6">
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {draft.title && (
        <Card>
          <CardHeader>
            <CardTitle>טיוטת התיק</CardTitle>
          </CardHeader>
          <CardContent>
            <h4 className="font-medium">{draft.title}</h4>
            {draft.summary && (
              <p className="text-sm text-muted-foreground mt-2">{draft.summary}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}