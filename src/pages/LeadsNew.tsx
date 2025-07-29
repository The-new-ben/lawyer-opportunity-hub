import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Eye, Edit, UserCheck, Phone, Mail, MapPin, Calendar, AlertCircle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLeads } from "@/hooks/useLeads";
import { toast } from "sonner";

export default function Leads() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [newLeadDialogOpen, setNewLeadDialogOpen] = useState(false);
  const [newLead, setNewLead] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    case_description: "",
    legal_category: "",
    urgency_level: "medium",
    preferred_location: "",
    estimated_budget: ""
  });

  const { leads, isLoading, addLead, updateLead, convertLeadToClient, assignLawyer } = useLeads();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-destructive text-destructive-foreground";
      case "medium": return "bg-warning text-warning-foreground";
      case "low": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-accent text-accent-foreground";
      case "assigned": return "bg-primary text-primary-foreground";
      case "in_progress": return "bg-warning text-warning-foreground";
      case "converted": return "bg-success text-success-foreground";
      case "rejected": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = 
      lead.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.case_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.legal_category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || lead.urgency_level === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleAddLead = async () => {
    try {
      await addLead.mutateAsync({
        ...newLead,
        estimated_budget: newLead.estimated_budget ? parseFloat(newLead.estimated_budget) : undefined
      });
      setNewLeadDialogOpen(false);
      setNewLead({
        customer_name: "",
        customer_phone: "",
        customer_email: "",
        case_description: "",
        legal_category: "",
        urgency_level: "medium",
        preferred_location: "",
        estimated_budget: ""
      });
      toast.success('ליד חדש נוסף בהצלחה');
    } catch (error) {
      toast.error('שגיאה בהוספת ליד');
    }
  };

  const handleConvertToClient = async (lead: any) => {
    try {
      await convertLeadToClient.mutateAsync(lead);
    } catch (error) {
      toast.error('שגיאה בהמרת ליד ללקוח');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin ml-2" />
        <span>טוען לידים...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">ניהול לידים</h1>
          <p className="text-muted-foreground">ניהול ומעקב לידים ופניות פוטנציאליות</p>
        </div>
        
        <Dialog open={newLeadDialogOpen} onOpenChange={setNewLeadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              ליד חדש
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>הוספת ליד חדש</DialogTitle>
              <DialogDescription>
                הזן פרטי הליד החדש במערכת
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customer_name">שם הלקוח</Label>
                <Input
                  id="customer_name"
                  value={newLead.customer_name}
                  onChange={(e) => setNewLead({ ...newLead, customer_name: e.target.value })}
                  placeholder="הזן שם מלא"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer_phone">טלפון</Label>
                <Input
                  id="customer_phone"
                  value={newLead.customer_phone}
                  onChange={(e) => setNewLead({ ...newLead, customer_phone: e.target.value })}
                  placeholder="05X-XXXXXXX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer_email">אימייל</Label>
                <Input
                  id="customer_email"
                  type="email"
                  value={newLead.customer_email}
                  onChange={(e) => setNewLead({ ...newLead, customer_email: e.target.value })}
                  placeholder="example@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="legal_category">תחום משפטי</Label>
                <Select value={newLead.legal_category} onValueChange={(value) => setNewLead({ ...newLead, legal_category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר תחום" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="family">דיני משפחה</SelectItem>
                    <SelectItem value="criminal">דיני פלילי</SelectItem>
                    <SelectItem value="property">דיני נדלן</SelectItem>
                    <SelectItem value="labor">דיני עבודה</SelectItem>
                    <SelectItem value="contracts">חוזים</SelectItem>
                    <SelectItem value="corporate">דיני חברות</SelectItem>
                    <SelectItem value="tax">דיני מס</SelectItem>
                    <SelectItem value="other">אחר</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="case_description">תיאור הפנייה</Label>
                <Textarea
                  id="case_description"
                  value={newLead.case_description}
                  onChange={(e) => setNewLead({ ...newLead, case_description: e.target.value })}
                  placeholder="תאר את הבעיה המשפטית..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="urgency_level">רמת דחיפות</Label>
                <Select value={newLead.urgency_level} onValueChange={(value) => setNewLead({ ...newLead, urgency_level: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">נמוכה</SelectItem>
                    <SelectItem value="medium">בינונית</SelectItem>
                    <SelectItem value="high">גבוהה</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimated_budget">תקציב משוער (₪)</Label>
                <Input
                  id="estimated_budget"
                  type="number"
                  value={newLead.estimated_budget}
                  onChange={(e) => setNewLead({ ...newLead, estimated_budget: e.target.value })}
                  placeholder="0"
                />
              </div>
              <Button 
                onClick={handleAddLead} 
                className="w-full"
                disabled={addLead.isPending}
              >
                {addLead.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    שומר...
                  </>
                ) : (
                  'הוסף ליד'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            חיפוס וסינון
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>חיפוש</Label>
              <Input
                placeholder="חפש לפי שם, תיאור או תחום..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label>סטטוס</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל הסטטוסים</SelectItem>
                  <SelectItem value="new">חדש</SelectItem>
                  <SelectItem value="assigned">הוקצה</SelectItem>
                  <SelectItem value="in_progress">בטיפול</SelectItem>
                  <SelectItem value="converted">הומר ללקוח</SelectItem>
                  <SelectItem value="rejected">לא רלוונטי</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>עדיפות</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל העדיפויות</SelectItem>
                  <SelectItem value="high">גבוהה</SelectItem>
                  <SelectItem value="medium">בינונית</SelectItem>
                  <SelectItem value="low">נמוכה</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLeads.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">לא נמצאו לידים</h3>
            <p className="text-sm text-muted-foreground">נסה לשנות את הסינון או הוסף ליד חדש</p>
          </div>
        ) : (
          filteredLeads.map((lead) => (
            <Card key={lead.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{lead.customer_name}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      {lead.legal_category}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getPriorityColor(lead.urgency_level)}>
                      {lead.urgency_level === 'high' ? 'גבוהה' : 
                       lead.urgency_level === 'medium' ? 'בינונית' : 'נמוכה'}
                    </Badge>
                    <Badge className={getStatusColor(lead.status)}>
                      {lead.status === 'new' ? 'חדש' :
                       lead.status === 'assigned' ? 'הוקצה' :
                       lead.status === 'in_progress' ? 'בטיפול' :
                       lead.status === 'converted' ? 'הומר ללקוח' : 'לא רלוונטי'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {lead.case_description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4" />
                    {lead.customer_phone}
                  </div>
                  {lead.customer_email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4" />
                      {lead.customer_email}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    {new Date(lead.created_at).toLocaleDateString('he-IL')}
                  </div>
                  {lead.estimated_budget && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">תקציב:</span>
                      ₪{lead.estimated_budget.toLocaleString()}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 pt-3 border-t">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 ml-1" />
                    צפייה
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="h-4 w-4 ml-1" />
                    עריכה
                  </Button>
                  {lead.status !== 'converted' && (
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleConvertToClient(lead)}
                      disabled={convertLeadToClient.isPending}
                    >
                      <UserCheck className="h-4 w-4 ml-1" />
                      הפוך ללקוח
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}