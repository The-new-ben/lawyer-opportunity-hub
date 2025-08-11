import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCases } from '@/hooks/useCases';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileText, Calendar, User, DollarSign, Clock, ArrowRight, Edit } from 'lucide-react';
import { MeetingScheduler } from '@/components/MeetingScheduler';
import { RatingDialog } from '@/components/RatingDialog';
import { toast } from '@/components/ui/use-toast';

export default function CaseDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { cases, updateCase, closeCase } = useCases();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    status: '',
    priority: '',
    notes: ''
  });

  const caseData = cases.find(c => c.id === id);

  useEffect(() => {
    if (caseData) {
      setEditData({
        status: caseData.status,
        priority: caseData.priority,
        notes: caseData.notes || ''
      });
    }
  }, [caseData]);

  if (!caseData) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="font-medium mb-2">תיק לא נמצא</h3>
          <p className="text-sm text-muted-foreground mb-4">
            התיק שחיפשת לא קיים במערכת
          </p>
          <Button onClick={() => navigate('/cases')}>
            <ArrowRight className="h-4 w-4 mr-2" />
            חזור לרשימת התיקים
          </Button>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      await updateCase.mutateAsync({
        id: caseData.id,
        values: {
          status: editData.status,
          priority: editData.priority,
          notes: editData.notes
        }
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: 'Error updating case',
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive'
      });
    }
  };

  const handleCloseCase = async () => {
    if (confirm('האם אתה בטוח שברצונך לסגור את התיק?')) {
      try {
        await closeCase.mutateAsync(caseData.id);
        navigate('/cases');
      } catch (error) {
        toast({
          title: 'Error closing case',
          description: error instanceof Error ? error.message : String(error),
          variant: 'destructive'
        });
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="default">פתוח</Badge>
      case "in_progress":
        return <Badge variant="secondary">בתהליך</Badge>
      case "closed":
        return <Badge variant="outline">סגור</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">גבוה</Badge>
      case "medium":
        return <Badge variant="secondary">בינוני</Badge>
      case "low":
        return <Badge variant="outline">נמוך</Badge>
      default:
        return <Badge>{priority}</Badge>
    }
  };

  return (
    <div className="p-6 space-y-6 flex flex-col overflow-x-hidden">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/cases')}
              className="p-0 h-auto"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              חזור לרשימת התיקים
            </Button>
          </div>
          <h1 className="text-3xl font-bold">{caseData.title}</h1>
          <p className="text-muted-foreground">תיק מספר: {caseData.id.slice(0, 8)}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit className="h-4 w-4 mr-2" />
            {isEditing ? 'ביטול עריכה' : 'ערוך תיק'}
          </Button>
          {caseData.status !== 'closed' && (
            <Button 
              variant="destructive" 
              onClick={handleCloseCase}
              disabled={closeCase.isPending}
            >
              {closeCase.isPending ? 'סוגר...' : 'סגור תיק'}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Case Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                פרטי התיק
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">סטטוס</Label>
                  {isEditing ? (
                    <Select value={editData.status} onValueChange={(value) => setEditData({...editData, status: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">פתוח</SelectItem>
                        <SelectItem value="in_progress">בתהליך</SelectItem>
                        <SelectItem value="closed">סגור</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="mt-1">{getStatusBadge(caseData.status)}</div>
                  )}
                </div>
                <div>
                  <Label className="text-sm font-medium">עדיפות</Label>
                  {isEditing ? (
                    <Select value={editData.priority} onValueChange={(value) => setEditData({...editData, priority: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">גבוה</SelectItem>
                        <SelectItem value="medium">בינוני</SelectItem>
                        <SelectItem value="low">נמוך</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="mt-1">{getPriorityBadge(caseData.priority)}</div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">תחום משפטי</Label>
                  <p className="mt-1">{caseData.legal_category}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">תאריך פתיחה</Label>
                  <p className="mt-1">{new Date(caseData.opened_at).toLocaleDateString('he-IL')}</p>
                </div>
              </div>

              {caseData.estimated_budget && (
                <div>
                  <Label className="text-sm font-medium">תקציב משוער</Label>
                  <p className="mt-1 flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    ₪{caseData.estimated_budget.toLocaleString()}
                  </p>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium">הערות</Label>
                {isEditing ? (
                  <Textarea
                    value={editData.notes}
                    onChange={(e) => setEditData({...editData, notes: e.target.value})}
                    className="mt-1"
                    rows={4}
                  />
                ) : (
                  <p className="mt-1 text-muted-foreground">
                    {caseData.notes || 'אין הערות'}
                  </p>
                )}
              </div>

              {isEditing && (
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSave} disabled={updateCase.isPending}>
                    {updateCase.isPending ? 'שומר...' : 'שמור שינויים'}
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    ביטול
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                פעולות
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <MeetingScheduler 
                caseId={caseData.id}
                lawyerId={caseData.assigned_lawyer_id || "default-lawyer"}
                clientId={caseData.client_id}
              />
              
              {caseData.status === 'closed' && (
                <RatingDialog 
                  caseId={caseData.id}
                  lawyerId={caseData.assigned_lawyer_id || "default-lawyer"}
                  clientId={caseData.client_id}
                />
              )}

              <Button variant="outline" className="w-full">
                <User className="h-4 w-4 mr-2" />
                צור חוזה דיגיטלי
              </Button>

              <Button variant="outline" className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                צפה במסמכים
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>סיכום פיננסי</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>תקציב משוער:</span>
                <span>₪{caseData.estimated_budget?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span>תשלומים שהתקבלו:</span>
                <span>₪0</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>יתרה:</span>
                <span>₪{caseData.estimated_budget?.toLocaleString() || '0'}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}