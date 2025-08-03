import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLeads } from "@/hooks/useLeads";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Plus, Search, Users, Clock, TrendingUp, Phone, UserPlus, Calendar } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { CreateMeetingDialog } from "@/components/CreateMeetingDialog";
import { leadSchema, type LeadFormValues } from "@/lib/leadSchema";

export default function Leads() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      legalArea: "",
      priority: "",
      budget: undefined,
      notes: "",
    },
    mode: "onChange",
  });

  const { leads, isLoading, error, addLead, convertLeadToClient, getLeadStats } = useLeads();

  const [formMessage, setFormMessage] = useState<
    { type: "success" | "error"; text: string } | null
  >(null);

  const onSubmit = async (values: LeadFormValues) => {
    try {
      await addLead.mutateAsync({
        customer_name: values.name,
        customer_phone: values.phone,
        customer_email: values.email,
        case_description: values.notes || "אין פרטים נוספים",
        legal_category: values.legalArea,
        urgency_level: values.priority,
        estimated_budget: values.budget ? Number(values.budget) : null,
      });

      setFormMessage({ type: "success", text: "הליד נשמר בהצלחה" });
      form.reset();
    } catch (err) {
      toast({
        title: 'Error adding lead',
        description: err instanceof Error ? err.message : String(err),
        variant: 'destructive'
      });
      setFormMessage({ type: "error", text: "שגיאה בשמירת הליד" });
    }
  };

  if (isLoading) return <div className="p-6">טוען לידים...</div>;
  if (error) return <div className="p-6 text-destructive">שגיאה בטעינת לידים: {error.message}</div>;

  const stats = getLeadStats();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-destructive text-destructive-foreground";
      case "medium": return "bg-warning text-warning-foreground";
      case "low": return "bg-success text-success-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-accent text-accent-foreground";
      case "contacted": return "bg-primary text-primary-foreground";
      case "meeting": return "bg-warning text-warning-foreground";
      case "converted": return "bg-success text-success-foreground";
      case "rejected": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (lead.customer_email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.legal_category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || lead.urgency_level === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="p-6 space-y-6 flex flex-col overflow-x-hidden">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">לידים</h1>
          <p className="text-muted-foreground">ניהול ומעקב אחר כל הלידים שלך</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              ליד חדש
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>ליד חדש</DialogTitle>
              <DialogDescription>
                הוסף ליד חדש למערכת
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {formMessage && (
                  <Alert variant={formMessage.type === "error" ? "destructive" : "default"}>
                    <AlertTitle>{formMessage.type === "error" ? "שגיאה" : "הצלחה"}</AlertTitle>
                    <AlertDescription>{formMessage.text}</AlertDescription>
                  </Alert>
                )}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="name">שם מלא *</FormLabel>
                      <FormControl>
                        <Input id="name" placeholder="הזן שם מלא" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="phone">טלפון *</FormLabel>
                      <FormControl>
                        <Input id="phone" placeholder="הזן מספר טלפון" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="email">אימייל</FormLabel>
                      <FormControl>
                        <Input id="email" type="email" placeholder="הזן כתובת אימייל" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="legalArea"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="legalArea">תחום משפטי *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="בחר תחום משפטי" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="אזרחי">משפט אזרחי</SelectItem>
                          <SelectItem value="פלילי">משפט פלילי</SelectItem>
                          <SelectItem value="משפחה">דיני משפחה</SelectItem>
                          <SelectItem value="עבודה">דיני עבודה</SelectItem>
                          <SelectItem value="נדלן">דיני נדלן</SelectItem>
                          <SelectItem value="מסחרי">משפט מסחרי</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="priority">עדיפות *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="בחר עדיפות" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="high">גבוה</SelectItem>
                            <SelectItem value="medium">בינוני</SelectItem>
                            <SelectItem value="low">נמוך</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="budget">תקציב משוער</FormLabel>
                        <FormControl>
                          <Input id="budget" type="number" placeholder="הזן תקציב משוער" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="notes">הערות</FormLabel>
                      <FormControl>
                        <Input id="notes" placeholder="הזן פרטים נוספים" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={addLead.isPending} className="w-full">
                  {addLead.isPending ? "שומר..." : "שמור ליד"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">סך הכל לידים</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLeads}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">לידים חדשים</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newLeads}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">דחיפות גבוהה</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.highPriorityLeads}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">הומרו ללקוחות</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.convertedLeads}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 flex-wrap">
            <div className="flex-1 min-w-full md:min-w-64">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="חיפוש לפי שם, אימייל או תחום משפטי..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="סטטוס" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הסטטוסים</SelectItem>
                <SelectItem value="new">חדש</SelectItem>
                <SelectItem value="contacted">נוצר קשר</SelectItem>
                <SelectItem value="meeting">ממתין לפגישה</SelectItem>
                <SelectItem value="converted">הפך ללקוח</SelectItem>
                <SelectItem value="rejected">לא רלוונטי</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="עדיפות" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל העדיפויות</SelectItem>
                <SelectItem value="high">גבוה</SelectItem>
                <SelectItem value="medium">בינוני</SelectItem>
                <SelectItem value="low">נמוך</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leads List */}
      <div className="grid gap-4">
        {filteredLeads.map((lead) => (
          <Card key={lead.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{lead.customer_name}</h3>
                    <Badge className={getPriorityColor(lead.urgency_level)}>
                      {lead.urgency_level === 'high' ? 'גבוה' : lead.urgency_level === 'medium' ? 'בינוני' : 'נמוך'}
                    </Badge>
                    <Badge className={getStatusColor(lead.status)}>
                      {lead.status === 'new' ? 'חדש' : 
                       lead.status === 'contacted' ? 'נוצר קשר' :
                       lead.status === 'meeting' ? 'ממתין לפגישה' :
                       lead.status === 'converted' ? 'הפך ללקוח' : 'לא רלוונטי'}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><strong>תחום:</strong> {lead.legal_category}</p>
                    <p><strong>טלפון:</strong> {lead.customer_phone}</p>
                    {lead.customer_email && <p><strong>אימייל:</strong> {lead.customer_email}</p>}
                    {lead.case_description && <p><strong>תיאור:</strong> {lead.case_description}</p>}
                    {lead.estimated_budget && <p><strong>תקציב משוער:</strong> ₪{lead.estimated_budget.toLocaleString()}</p>}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {lead.status !== 'converted' && (
                    <Button
                      onClick={() => convertLeadToClient.mutate(lead.id)}
                      disabled={convertLeadToClient.isPending}
                      variant="default"
                      size="sm"
                    >
                      {convertLeadToClient.isPending ? 'ממיר...' : 'הפוך ללקוח'}
                    </Button>
                  )}
                  {lead.assigned_lawyer_id && (
                    <CreateMeetingDialog 
                      leadId={lead.id}
                      lawyerId={lead.assigned_lawyer_id}
                    />
                  )}
                  <div className="text-xs text-muted-foreground">
                    נוצר: {new Date(lead.created_at).toLocaleDateString('he-IL')}
                    {lead.assigned_lawyer_id && (
                      <div>הוקצה לעורך דין</div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLeads.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <UserPlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">לא נמצאו לידים</h3>
              <p className="text-muted-foreground mb-4">
                נסה לשנות את קריטריוני החיפוש או הוסף ליד חדש
              </p>
              <Button onClick={() => setIsOpen(true)}>הוסף ליד חדש</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}