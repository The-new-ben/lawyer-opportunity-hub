import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Zap, 
  Bot, 
  Activity,
  AlertTriangle,
  Loader2
} from 'lucide-react';

interface TestResult {
  test: string;
  status: 'pending' | 'success' | 'error';
  response?: any;
  error?: string;
  duration?: number;
}

const AIConnectionTest = () => {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testInput, setTestInput] = useState('פתח תיק משפטי על חוזה שנחתם אך לא נמלא');

  const runAITests = async () => {
    setIsRunning(true);
    setTestResults([]);

    const tests: TestResult[] = [
      { test: 'בדיקת חיבור ל-Edge Function', status: 'pending' },
      { test: 'בדיקת AI Intake Extract', status: 'pending' },
      { test: 'בדיקת AI Case Builder', status: 'pending' },
      { test: 'בדיקת AI Party Interrogation', status: 'pending' },
      { test: 'בדיקת AI Role Match', status: 'pending' }
    ];

    setTestResults([...tests]);

    // Test 1: Basic connection to edge function
    try {
      const startTime = Date.now();
      const response = await supabase.functions.invoke('ai-court-orchestrator', {
        body: { action: 'intake', locale: 'he', context: { test: true } }
      });
      const duration = Date.now() - startTime;

      if (response.error) throw response.error;

      tests[0] = { 
        ...tests[0], 
        status: 'success', 
        response: response.data,
        duration 
      };
    } catch (error) {
      tests[0] = { 
        ...tests[0], 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
    setTestResults([...tests]);

    // Test 2: AI Intake Extract
    try {
      const startTime = Date.now();
      const response = await supabase.functions.invoke('ai-court-orchestrator', {
        body: {
          action: 'intake_extract',
          locale: 'he',
          context: {
            history: [
              { role: 'user', content: testInput }
            ],
            required_fields: ['title', 'summary', 'jurisdiction', 'category'],
            current_fields: {}
          }
        }
      });
      const duration = Date.now() - startTime;

      if (response.error) throw response.error;

      tests[1] = { 
        ...tests[1], 
        status: 'success', 
        response: response.data,
        duration 
      };
    } catch (error) {
      tests[1] = { 
        ...tests[1], 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
    setTestResults([...tests]);

    // Test 3: AI Case Builder
    try {
      const startTime = Date.now();
      const response = await supabase.functions.invoke('ai-court-orchestrator', {
        body: {
          action: 'case_builder',
          locale: 'he',
          context: {
            summary: testInput,
            goal: 'פתרון מחלוקת',
            jurisdiction: 'ישראל',
            category: 'חוזים'
          }
        }
      });
      const duration = Date.now() - startTime;

      if (response.error) throw response.error;

      tests[2] = { 
        ...tests[2], 
        status: 'success', 
        response: response.data,
        duration 
      };
    } catch (error) {
      tests[2] = { 
        ...tests[2], 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
    setTestResults([...tests]);

    // Test 4: AI Party Interrogation
    try {
      const startTime = Date.now();
      const response = await supabase.functions.invoke('ai-court-orchestrator', {
        body: {
          action: 'party_interrogation',
          locale: 'he',
          context: {
            summary: testInput,
            parties: [
              { name: 'התובע', role: 'תובע' },
              { name: 'הנתבע', role: 'נתבע' }
            ]
          }
        }
      });
      const duration = Date.now() - startTime;

      if (response.error) throw response.error;

      tests[3] = { 
        ...tests[3], 
        status: 'success', 
        response: response.data,
        duration 
      };
    } catch (error) {
      tests[3] = { 
        ...tests[3], 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
    setTestResults([...tests]);

    // Test 5: AI Role Match
    try {
      const startTime = Date.now();
      const response = await supabase.functions.invoke('ai-court-orchestrator', {
        body: {
          action: 'role_match',
          locale: 'he',
          context: {
            summary: testInput,
            category: 'חוזים',
            location: 'ישראל',
            languages: ['עברית']
          }
        }
      });
      const duration = Date.now() - startTime;

      if (response.error) throw response.error;

      tests[4] = { 
        ...tests[4], 
        status: 'success', 
        response: response.data,
        duration 
      };
    } catch (error) {
      tests[4] = { 
        ...tests[4], 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
    setTestResults([...tests]);

    setIsRunning(false);

    // Show summary toast
    const successCount = tests.filter(t => t.status === 'success').length;
    const totalTests = tests.length;
    
    if (successCount === totalTests) {
      toast({
        title: 'כל הבדיקות עברו בהצלחה!',
        description: `${successCount}/${totalTests} מבחנים הצליחו`,
      });
    } else {
      toast({
        title: 'חלק מהבדיקות נכשלו',
        description: `${successCount}/${totalTests} מבחנים הצליחו`,
        variant: 'destructive'
      });
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-700';
    }
  };

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className="border-b">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <CardTitle>בדיקת חיבור AI</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Bot className="w-4 h-4" />
          <span>בדיקה שהחיבור ל-AI עובד כראוי ומחובר לכל הפונקציות</span>
        </div>

        <div>
          <label className="text-sm font-medium">טקסט לבדיקה:</label>
          <Input
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            placeholder="הכנס טקסט לבדיקת AI..."
            className="mt-1"
          />
        </div>

        <Button
          onClick={runAITests}
          disabled={isRunning || !testInput.trim()}
          className="w-full"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              מריץ בדיקות...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              הרץ בדיקות AI
            </>
          )}
        </Button>

        {testResults.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold">תוצאות בדיקות:</h4>
            
            {testResults.map((result, index) => (
              <div key={index} className={`p-3 rounded-lg border ${getStatusColor(result.status)}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.status)}
                    <span className="font-medium">{result.test}</span>
                  </div>
                  {result.duration && (
                    <Badge variant="outline" className="text-xs">
                      {result.duration}ms
                    </Badge>
                  )}
                </div>
                
                {result.status === 'success' && result.response && (
                  <div className="text-xs bg-white/50 p-2 rounded mt-2">
                    <div className="font-medium mb-1">תגובת AI:</div>
                    <div className="max-h-20 overflow-y-auto">
                      {typeof result.response === 'object' ? (
                        <pre className="whitespace-pre-wrap text-xs">
                          {JSON.stringify(result.response, null, 2)}
                        </pre>
                      ) : (
                        <span>{result.response}</span>
                      )}
                    </div>
                  </div>
                )}
                
                {result.status === 'error' && result.error && (
                  <div className="text-xs bg-white/50 p-2 rounded mt-2 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>שגיאה: {result.error}</span>
                  </div>
                )}
              </div>
            ))}
            
            <div className="mt-4 p-3 bg-slate-50 rounded-lg">
              <div className="text-sm font-medium mb-1">סיכום:</div>
              <div className="text-xs text-muted-foreground">
                {testResults.filter(t => t.status === 'success').length} מתוך {testResults.length} בדיקות הצליחו
              </div>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
};

export default AIConnectionTest;