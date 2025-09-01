import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gavel, Scale, Users, MessageSquare, Bot, FileText, Calendar, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
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
    
    // Filter suggestions based on input
    if (value.trim()) {
      const filtered = allSuggestions.filter(suggestion =>
        suggestion.keywords.some(keyword => 
          keyword.toLowerCase().includes(value.toLowerCase())
        ) ||
        suggestion.title.toLowerCase().includes(value.toLowerCase()) ||
        suggestion.description.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions(allSuggestions);
      setShowSuggestions(true);
    }

    // Stop typing animation after 1 second
    setTimeout(() => setIsTyping(false), 1000);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    if (!suggestion.public && !user) {
      navigate('/auth');
      return;
    }
    navigate(suggestion.path);
  };

  const handleFocus = () => {
    if (!showSuggestions) {
      setSuggestions(allSuggestions);
      setShowSuggestions(true);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  return (
    <div className="w-full max-w-4xl mx-auto relative">
      <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="p-6">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onFocus={handleFocus}
              placeholder="What legal service do you need? Type here to get started..."
              className={cn(
                "min-h-[120px] max-h-[300px] text-lg border-none bg-transparent resize-none focus:ring-0 focus:outline-none placeholder:text-muted-foreground/60",
                isTyping && "animate-pulse"
              )}
            />
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="absolute bottom-3 right-3 flex space-x-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            )}
          </div>
          
          {input.trim() && (
            <div className="mt-4 flex gap-2">
              <Button 
                onClick={() => {
                  // Default action - navigate to most relevant suggestion
                  const mostRelevant = suggestions[0] || allSuggestions[0];
                  handleSuggestionClick(mostRelevant);
                }}
                className="flex-1"
              >
                Get Started
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setInput("");
                  setSuggestions(allSuggestions);
                }}
              >
                Clear
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Suggestions */}
      {showSuggestions && (
        <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
          {suggestions.slice(0, 6).map((suggestion, index) => {
            const IconComponent = suggestion.icon;
            return (
              <Card 
                key={index}
                className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] border-border/50 bg-card/80 backdrop-blur-sm"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="p-4 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <IconComponent className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-foreground">{suggestion.title}</h4>
                      {!suggestion.public && (
                        <Badge variant="outline" className="text-xs">
                          {user ? "Available" : "Login Required"}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    {suggestion.public ? "Open" : user ? "Enter" : "Login"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      
      {showSuggestions && suggestions.length === 0 && input.trim() && (
        <Card className="mt-4 p-6 text-center border-border/50 bg-card/80">
          <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No matching services found. Try different keywords.</p>
        </Card>
      )}
    </div>
  );
};

export default LovableStyleInput;