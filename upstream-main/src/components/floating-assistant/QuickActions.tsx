import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Info, 
  Play, 
  HelpCircle, 
  Tag, 
  BarChart3, 
  MessageCircle,
  Zap
} from 'lucide-react';
import { QuickAction } from './types';

interface QuickActionsProps {
  actions: QuickAction[];
  onActionClick: (actionId: string) => void;
  className?: string;
}

const iconMap = {
  FileText,
  Info,
  Play,
  HelpCircle,
  Tag,
  BarChart3,
  MessageCircle,
  Zap
};

export function QuickActions({ 
  actions, 
  onActionClick, 
  className = '' 
}: QuickActionsProps) {
  if (actions.length === 0) return null;

  return (
    <div className={`px-4 py-2 border-t border-border bg-muted/30 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <Zap className="h-3 w-3 text-primary" />
        <span className="text-xs font-medium text-muted-foreground">Quick Actions</span>
      </div>
      
      <ScrollArea className="max-h-20">
        <div className="flex flex-wrap gap-1">
          {actions.map((action) => {
            const IconComponent = iconMap[action.icon as keyof typeof iconMap] || MessageCircle;
            
            return (
              <Button
                key={action.id}
                variant="outline"
                size="sm"
                onClick={() => onActionClick(action.id)}
                className="h-8 px-2 text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
                title={action.description}
              >
                <IconComponent className="h-3 w-3 mr-1" />
                {action.label}
              </Button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}