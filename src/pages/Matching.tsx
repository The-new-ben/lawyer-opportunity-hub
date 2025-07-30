import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, Users, FileText, DollarSign, Clock, TrendingUp } from 'lucide-react';
import { useLeads } from '@/hooks/useLeads';
import { useQuotes } from '@/hooks/useQuotes';
import { useContracts } from '@/hooks/useContracts';
import { MatchingEngine } from '@/components/MatchingEngine';
import { DigitalContractComponent } from '@/components/DigitalContract';
import { StatsCard } from '@/components/StatsCard';

export default function Matching() {
  const { leads } = useLeads();
  const { quotes, getQuoteStats } = useQuotes();
  const { contracts, getContractStats } = useContracts();
  const [selectedLead, setSelectedLead] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const quoteStats = getQuoteStats();
  const contractStats = getContractStats();

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.legal_category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      'new': 'bg-blue-100 text-blue-800',
      'matched': 'bg-green-100 text-green-800',
      'quoted': 'bg-yellow-100 text-yellow-800',
      'contracted': 'bg-purple-100 text-purple-800',
      'completed': 'bg-gray-100 text-gray-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">מערכת התאמות ותרמילים</h1>
        <p className="text-muted-foreground">
          מנוע התאמות חכם להתאמת עורכי דין ללקוחות, עם מערכת הצעות מחיר וחוזים דיגיטליים
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="סה״כ הצעות מחיר"
          value={quoteStats.totalQuotes.toString()}
          change={`${quoteStats.pendingQuotes} ממתינות לאישור`}
          icon={FileText}
        />
        <StatsCard
          title="הצעות מאושרות"
          value={quoteStats.acceptedQuotes.toString()}
          change={`₪${quoteStats.totalAmount.toLocaleString()}`}
          icon={TrendingUp}
        />
        <StatsCard
          title="חוזים דיגיטליים"
          value={contractStats.totalContracts.toString()}
          change={`${contractStats.signedContracts} חתומים`}
          icon={FileText}
        />
        <StatsCard
          title="עמלות"
          value={`₪${contractStats.totalCommissions.toLocaleString()}`}
          change="סה״כ עמלות"
          icon={DollarSign}
        />
      </div>

      <Tabs defaultValue="matching" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="matching">מנוע התאמות</TabsTrigger>
          <TabsTrigger value="quotes">הצעות מחיר</TabsTrigger>
          <TabsTrigger value="contracts">חוזים דיגיטליים</TabsTrigger>
          <TabsTrigger value="commissions">עמלות</TabsTrigger>
        </TabsList>

        <TabsContent value="matching" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lead Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  בחירת ליד
                </CardTitle>
                <CardDescription>
                  בחר ליד כדי למצוא עורכי דין מתאימים
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="search">חיפוש</Label>
                  <Input
                    id="search"
                    placeholder="חפש לפי שם או תחום משפטי..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">סטטוס</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="בחר סטטוס" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">כל הסטטוסים</SelectItem>
                      <SelectItem value="new">חדש</SelectItem>
                      <SelectItem value="matched">מותאם</SelectItem>
                      <SelectItem value="quoted">עם הצעה</SelectItem>
                      <SelectItem value="contracted">עם חוזה</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedLead === lead.id 
                          ? 'bg-primary/10 border-primary' 
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => setSelectedLead(lead.id)}
                    >
                      <div className="space-y-1">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-sm">{lead.customer_name}</h4>
                          <Badge className={getStatusBadge(lead.status || 'new')}>
                            {lead.status || 'חדש'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{lead.legal_category}</p>
                        {lead.estimated_budget && (
                          <p className="text-xs text-muted-foreground">
                            תקציב: ₪{lead.estimated_budget.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {filteredLeads.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">לא נמצאו לידים</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Matching Engine */}
            <div className="lg:col-span-2">
              {selectedLead ? (
                <MatchingEngine
                  leadId={selectedLead}
                  legalCategory={leads.find(l => l.id === selectedLead)?.legal_category || ''}
                />
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="font-medium mb-2">בחר ליד להתחלת ההתאמה</h3>
                    <p className="text-sm text-muted-foreground">
                      בחר ליד מהרשימה כדי למצוא עורכי דין מתאימים
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="quotes">
          <Card>
            <CardHeader>
              <CardTitle>הצעות מחיר</CardTitle>
              <CardDescription>
                ניהול והצגה של הצעות מחיר שנשלחו על ידי עורכי דין
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quotes.map((quote) => (
                  <div key={quote.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">הצעת מחיר #{quote.id.slice(0, 8)}</h4>
                        <p className="text-sm text-muted-foreground">{quote.service_description}</p>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-lg">₪{quote.quote_amount.toLocaleString()}</p>
                        <Badge className={getStatusBadge(quote.status)}>
                          {quote.status}
                        </Badge>
                      </div>
                    </div>
                    
                    {quote.estimated_duration_days && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>זמן ביצוע משוער: {quote.estimated_duration_days} ימים</span>
                      </div>
                    )}

                    {quote.payment_terms && (
                      <div>
                        <h5 className="font-medium text-sm mb-1">תנאי תשלום:</h5>
                        <p className="text-sm text-muted-foreground">{quote.payment_terms}</p>
                      </div>
                    )}
                  </div>
                ))}

                {quotes.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>אין הצעות מחיר עדיין</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contracts">
          <div className="space-y-6">
            {contracts.map((contract) => (
              <DigitalContractComponent
                key={contract.id}
                contract={contract}
                userRole="lawyer" // This should be determined based on current user
              />
            ))}

            {contracts.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="font-medium mb-2">אין חוזים דיגיטליים עדיין</h3>
                  <p className="text-sm text-muted-foreground">
                    חוזים יווצרו לאחר אישור הצעות מחיר
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="commissions">
          <Card>
            <CardHeader>
              <CardTitle>ניהול עמלות</CardTitle>
              <CardDescription>
                מעקב אחר עמלות מחוזים חתומים
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>מערכת העמלות תפותח בהמשך</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}