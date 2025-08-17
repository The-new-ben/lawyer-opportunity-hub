import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  Zap, 
  Users, 
  Calendar, 
  FileText, 
  Scale, 
  Shield, 
  UserCheck,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { ActionSuggestion } from './SmartConversationEngine';

interface SmartActionButtonsProps {
  actions: ActionSuggestion[];
  onActionClick: (actionId: string) => void;
  progress: number;
  isAuthenticated?: boolean;
}

const getActionIcon = (iconName: string) => {
  const icons = {
    '📝': <FileText className="w-4 h-4" />,
    '📎': <FileText className="w-4 h-4" />,
    '⚖️': <Scale className="w-4 h-4" />,
    '📅': <Calendar className="w-4 h-4" />,
    '📄': <FileText className="w-4 h-4" />,
    '🔍': <Sparkles className="w-4 h-4" />,
    '🛡️': <Shield className="w-4 h-4" />,
    '👥': <Users className="w-4 h-4" />,
    '🔐': <UserCheck className="w-4 h-4" />
  };
  
  return icons[iconName as keyof typeof icons] || <Zap className="w-4 h-4" />;
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100';
    case 'medium': return 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100';
    case 'low': return 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100';
    default: return 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100';
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'legal': return <Scale className="w-4 h-4" />;
    case 'procedural': return <FileText className="w-4 h-4" />;
    case 'professional': return <UserCheck className="w-4 h-4" />;
    case 'system': return <Sparkles className="w-4 h-4" />;
    default: return <Zap className="w-4 h-4" />;
  }
};

export const SmartActionButtons: React.FC<SmartActionButtonsProps> = ({
  actions,
  onActionClick,
  progress,
  isAuthenticated = false
}) => {
  // Group actions by category
  const groupedActions = actions.reduce((groups, action) => {
    const category = action.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(action);
    return groups;
  }, {} as Record<string, ActionSuggestion[]>);

  const categoryTitles = {
    legal: 'פעולות משפטיות',
    professional: 'מומחים ויעוץ',
    procedural: 'הליכים',
    system: 'מערכת'
  };

  const getProgressMessage = () => {
    if (progress >= 90) return '🎉 התיק מוכן! בואו נתקדם לשלבים הבאים';
    if (progress >= 70) return '🔥 כמעט סיימנו! עוד כמה פרטים';
    if (progress >= 50) return '📈 אנחנו באמצע הדרך';
    if (progress >= 30) return '🏗️ ממשיכים לבנות את התיק';
    return '🚀 בואו נתחיל לבנות את התיק שלך';
  };

  if (actions.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>ברגע שנוסיף עוד מידע, אציע לך פעולות חכמות</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress indicator */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900">
              {getProgressMessage()}
            </span>
          </div>
          <div className="text-sm text-blue-700">
            התקדמות: {progress}% • {actions.filter(a => a.priority === 'high').length} פעולות בעדיפות גבוהה
          </div>
        </CardContent>
      </Card>

      {/* Action groups */}
      {Object.entries(groupedActions).map(([category, categoryActions]) => (
        <Card key={category}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-4">
              {getCategoryIcon(category)}
              <h3 className="font-semibold">
                {categoryTitles[category as keyof typeof categoryTitles] || category}
              </h3>
              <Badge variant="secondary" className="mr-auto">
                {categoryActions.length}
              </Badge>
            </div>
            
            <div className="space-y-3">
              {categoryActions.map((action) => (
                <div key={action.id} className="group">
                  <Button
                    variant="outline"
                    className={`w-full justify-start h-auto p-4 transition-all duration-200 group-hover:scale-[1.02] ${
                      getPriorityColor(action.priority)
                    }`}
                    onClick={() => onActionClick(action.id)}
                    disabled={action.requiresAuth && !isAuthenticated}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <div className="shrink-0 mt-0.5">
                        {getActionIcon(action.icon)}
                      </div>
                      
                      <div className="flex-1 text-right">
                        <div className="flex items-center justify-between mb-1">
                          <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{action.label}</span>
                            {action.priority === 'high' && (
                              <Badge variant="destructive" className="text-xs">
                                דחוף
                              </Badge>
                            )}
                            {action.estimatedTime && (
                              <Badge variant="secondary" className="text-xs gap-1">
                                <Clock className="w-3 h-3" />
                                {action.estimatedTime}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm opacity-80 text-right">
                          {action.description}
                        </p>
                        
                        {action.requiresAuth && !isAuthenticated && (
                          <p className="text-xs text-amber-600 mt-2 text-right">
                            🔒 דרושה הרשמה
                          </p>
                        )}
                      </div>
                    </div>
                  </Button>
                </div>
              ))}
            </div>
            
            {category !== 'system' && categoryActions.length > 0 && (
              <>
                <Separator className="my-4" />
                <div className="text-xs text-muted-foreground text-center">
                  💡 טיפ: פעולות אלו יעזרו לך להתקדם בתיק
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ))}
      
      {/* Quick stats */}
      <Card className="bg-muted/50">
        <CardContent className="pt-4">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>📊 סה״כ פעולות זמינות: {actions.length}</span>
            <span>⚡ פעולות דחופות: {actions.filter(a => a.priority === 'high').length}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};