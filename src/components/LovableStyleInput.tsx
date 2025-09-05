import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Gavel, 
  Scale, 
  Users, 
  MessageSquare, 
  Bot, 
  FileText, 
  Calendar, 
  Shield,
  Brain,
  Network,
  CheckCircle,
  Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSmartConversation } from "@/hooks/useSmartConversation";
import { cn } from "@/lib/utils";

interface Suggestion {
  title: string;
  description: string;
  icon: any;
  path: string;
  keywords: string[];
  public: boolean;
}

const LovableStyleInput = () => {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Import the new smart conversation hook
  const { 
    context, 
    isProcessing, 
    lastResponse, 
    autoConnectedAI, 
    processUserInput,
    getProgressPercentage,
    getNextSteps,
    getSuggestedActions,
    isReadyForNextStep
  } = useSmartConversation();

  const allSuggestions: Suggestion[] = [
    {
      title: "Digital Court",
      description: "AI-powered court for case management and legal decisions",
      icon: Gavel,
      path: "/global-court",
      keywords: ["court", "legal", "case", "trial", "judge", "hearing"],
      public: true
    },
    {
      title: "Smart Case Intake",
      description: "Automated case intake with AI text processing",
      icon: FileText,
      path: "/intake",
      keywords: ["intake", "case", "new", "client", "document", "upload"],
      public: true
    },
    {
      title: "Professional Directory",
      description: "Comprehensive database of lawyers, judges, and legal consultants",
      icon: Users,
      path: "/professionals",
      keywords: ["lawyer", "attorney", "professional", "directory", "expert", "consultant"],
      public: true
    },
    {
      title: "AI Legal Assistant",
      description: "Advanced legal chatbot for consultation and case handling",
      icon: Bot,
      path: "/ai-portal",
      keywords: ["ai", "assistant", "chat", "help", "legal advice", "consultation"],
      public: true
    },
    {
      title: "Admin Dashboard",
      description: "Complete management interface for law firms",
      icon: Shield,
      path: "/dashboard",
      keywords: ["dashboard", "admin", "management", "overview", "statistics"],
      public: false
    },
    {
      title: "Client Management",
      description: "Track clients, appointments, and active cases",
      icon: Users,
      path: "/clients",
      keywords: ["client", "customer", "contact", "management", "database"],
      public: false
    },
    {
      title: "Calendar & Meetings",
      description: "Schedule management, meetings, and hearings",
      icon: Calendar,
      path: "/calendar",
      keywords: ["calendar", "meeting", "schedule", "appointment", "time"],
      public: false
    },
    {
      title: "Payment System",
      description: "Manage invoices, payments, and commissions",
      icon: Scale,
      path: "/payments",
      keywords: ["payment", "invoice", "billing", "money", "commission"],
      public: false
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);
    setIsTyping(true);
    
    // Immediate processing like Lovable
    if (value.trim()) {
      processUserInput(value);
      setShowSuggestions(false);
    } else {
      setSuggestions(allSuggestions);
      setShowSuggestions(true);
    }

    // Stop typing animation quickly
    setTimeout(() => setIsTyping(false), 500);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    if (!suggestion.public && !user) {
      navigate('/auth');
      return;
    }
    navigate(suggestion.path);
  };

  const handleFocus = () => {
    if (!showSuggestions && !lastResponse) {
      setSuggestions(allSuggestions);
      setShowSuggestions(true);
    }
  };

  const handleSmartAction = (action: string) => {
    switch (action) {
      case 'court_simulation':
        navigate('/global-court');
        break;
      case 'create_case':
        navigate('/intake');
        break;
      case 'find_professional':
        navigate('/professionals');
        break;
      case 'continue':
        // Focus back on input for continuing conversation
        textareaRef.current?.focus();
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  return (
    <div className="w-full max-w-5xl mx-auto relative">
      {/* Enhanced Lovable-Style Main Window */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700/50 shadow-2xl">
        {/* Smart Header with Auto-Connected AI */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">AI חכם מחובר</h3>
              <p className="text-xs text-green-400">
                {autoConnectedAI ? "מוכן לקרוא את המחשבות שלך" : "מתחבר..."}
              </p>
            </div>
          </div>
          
          {/* Progress Indicator */}
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
            <span className="text-xs text-slate-400">{getProgressPercentage()}%</span>
          </div>
        </div>

        {/* Main Input Area */}
        <div className="p-6">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onFocus={handleFocus}
              placeholder={
                autoConnectedAI 
                  ? lastResponse
                    ? getNextSteps()[0] || "המשך לספר..."
                    : "ספר לי מה קרה - אני מבין ומנתח מיד..."
                  : "טוען AI חכם..."
              }
              className={cn(
                "min-h-[150px] max-h-[400px] text-lg border-none bg-transparent resize-none focus:ring-0 focus:outline-none text-white placeholder:text-slate-400",
                isTyping && "animate-pulse"
              )}
            />
            
            {/* Enhanced Typing indicator */}
            {(isTyping || isProcessing) && (
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                {isProcessing && (
                  <span className="text-xs text-blue-400 ml-2">AI מעבד...</span>
                )}
              </div>
            )}
          </div>
          
          {/* Smart Response Area */}
          {lastResponse && (
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg border border-blue-500/20">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="h-3 w-3 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm leading-relaxed">{lastResponse.text}</p>
                  
                  {/* Dynamic Action Buttons */}
                  {getSuggestedActions().length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {getSuggestedActions().slice(0, 3).map((action) => (
                        <Button
                          key={action.id}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSmartAction(action.action)}
                          className="bg-blue-600/20 border-blue-500/30 hover:bg-blue-600/30 text-blue-200 text-xs"
                        >
                          <span className="mr-1">{action.icon}</span>
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}
                  
                  {/* Progress indicators */}
                  {isReadyForNextStep() && (
                    <div className="mt-3 p-2 bg-green-900/20 rounded border border-green-500/30">
                      <p className="text-green-400 text-xs">✅ יש לנו מספיק מידע - מוכן לשלב הבא!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Quick Actions for Empty State */}
          {!lastResponse && autoConnectedAI && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button 
                variant="outline"
                onClick={() => handleSmartAction('court_simulation')}
                className="bg-slate-700/30 border-slate-600/50 hover:bg-slate-600/50 text-white"
              >
                <Gavel className="h-4 w-4 mr-2" />
                סימולציית בית משפט
              </Button>
              <Button 
                variant="outline"
                onClick={() => handleSmartAction('create_case')}
                className="bg-slate-700/30 border-slate-600/50 hover:bg-slate-600/50 text-white"
              >
                <FileText className="h-4 w-4 mr-2" />
                פתח תיק חדש
              </Button>
            </div>
          )}
        </div>
      </Card>
      
      {/* Conversation History */}
      {context.conversationHistory.length > 1 && (
        <Card className="mt-4 bg-slate-800/60 border-slate-700/50">
          <div className="p-3 border-b border-slate-700/50">
            <h4 className="font-medium text-white text-sm">היסטוריית השיחה</h4>
          </div>
          <div className="p-3 space-y-2 max-h-60 overflow-y-auto">
            {context.conversationHistory.slice(-4).map((msg, index) => (
              <div key={index} className={cn(
                "p-2 rounded text-xs",
                msg.role === 'user' 
                  ? "bg-blue-900/20 text-blue-200 ml-8" 
                  : "bg-slate-700/30 text-slate-300 mr-8"
              )}>
                <span className="font-medium">{msg.role === 'user' ? 'אתה' : 'AI'}:</span> {msg.content}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Suggestions (only show when no conversation active) */}
      {showSuggestions && !lastResponse && (
        <Card className="mt-4 bg-slate-800/80 border-slate-700/50 shadow-xl">
          <div className="p-4 border-b border-slate-700/50">
            <h4 className="font-semibold text-white">פעולות מהירות</h4>
            <p className="text-sm text-slate-400">או סתם ספר לי מה קרה...</p>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
            {suggestions.slice(0, 6).map((suggestion, index) => {
              const IconComponent = suggestion.icon;
              const canAccess = suggestion.public || user;
              
              return (
                <div
                  key={index}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border",
                    canAccess 
                      ? "bg-slate-700/50 hover:bg-slate-600/50 border-slate-600/50 hover:border-slate-500/50" 
                      : "bg-slate-800/50 border-slate-700/50 opacity-60"
                  )}
                  onClick={() => canAccess && handleSuggestionClick(suggestion)}
                >
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center border border-blue-500/20">
                    <IconComponent className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm">{suggestion.title}</p>
                    <p className="text-xs text-slate-400 truncate">{suggestion.description}</p>
                  </div>
                  {!canAccess && (
                    <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-400">
                      נדרש חשבון
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};

export default LovableStyleInput;