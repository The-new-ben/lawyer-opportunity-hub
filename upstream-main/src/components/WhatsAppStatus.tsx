import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, CheckCircle, XCircle, Clock, Settings } from "lucide-react";
import { getWhatsAppStatus } from "@/lib/whatsappService";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

interface WhatsAppStatusData {
  enabled: boolean;
  configured: boolean;
  withinBusinessHours: boolean;
  settings: {
    hasToken: boolean;
    hasPhoneId: boolean;
    autoRespond: boolean;
    businessHoursEnabled: boolean;
  };
}

const WhatsAppStatus = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<WhatsAppStatusData | null>(null);

  useEffect(() => {
    const loadStatus = () => {
      try {
        const whatsappStatus = getWhatsAppStatus();
        setStatus(whatsappStatus);
      } catch (error) {
        console.error('Error loading WhatsApp status:', error);
      }
    };

    loadStatus();
    // Refresh status every 30 seconds
    const interval = setInterval(loadStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  if (!status) {
    return null;
  }

  const getStatusBadge = () => {
    if (!status.configured) {
      return <Badge variant="destructive">לא מוגדר</Badge>;
    }
    if (!status.enabled) {
      return <Badge variant="secondary">מושבת</Badge>;
    }
    if (!status.withinBusinessHours && status.settings.businessHoursEnabled) {
      return <Badge variant="outline">מחוץ לשעות פעילות</Badge>;
    }
    return <Badge variant="default">פעיל</Badge>;
  };

  const getStatusIcon = () => {
    if (!status.configured || !status.enabled) {
      return <XCircle className="h-4 w-4 text-destructive" />;
    }
    if (!status.withinBusinessHours && status.settings.businessHoursEnabled) {
      return <Clock className="h-4 w-4 text-warning" />;
    }
    return <CheckCircle className="h-4 w-4 text-success" />;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <CardTitle className="text-lg">סטטוס WhatsApp</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
        <CardDescription>
          מצב שירות WhatsApp Business
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="text-sm font-medium">
                {status.configured && status.enabled ? 
                  (status.withinBusinessHours || !status.settings.businessHoursEnabled ? 'פעיל ומוכן' : 'מחוץ לשעות פעילות') :
                  (!status.configured ? 'דרוש הגדרה' : 'מושבת')
                }
              </span>
            </div>
          </div>

          <div className="grid gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">API Token</span>
              <span className={status.settings.hasToken ? "text-success" : "text-destructive"}>
                {status.settings.hasToken ? "מוגדר ✓" : "חסר ✗"}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Phone Number ID</span>
              <span className={status.settings.hasPhoneId ? "text-success" : "text-destructive"}>
                {status.settings.hasPhoneId ? "מוגדר ✓" : "חסר ✗"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">מענה אוטומטי</span>
              <span className={status.settings.autoRespond ? "text-success" : "text-muted-foreground"}>
                {status.settings.autoRespond ? "פעיל ✓" : "כבוי"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">שעות פעילות</span>
              <span className={status.settings.businessHoursEnabled ? "text-success" : "text-muted-foreground"}>
                {status.settings.businessHoursEnabled ? "מוגדר ✓" : "לא מוגדר"}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/settings')}
            className="w-full"
          >
            <Settings className="h-4 w-4 mr-2" />
            הגדרות WhatsApp
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WhatsAppStatus;