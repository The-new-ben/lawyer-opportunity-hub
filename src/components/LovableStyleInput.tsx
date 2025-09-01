import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Gavel, 
  Scale, 
  Users, 
  MessageSquare, 
  Bot, 
  FileText, 
  Calendar, 
  Shield,
  Plus,
  Settings,
  Zap,
  Brain,
  Network,
  ChevronDown,
  CheckCircle,
  Circle,
  Sparkles,
  Globe,
  Code,
  Layers
} from "lucide-react";
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

interface AIAgent {
  id: string;
  name: string;
  description: string;
  icon: any;
  model: string;
  capabilities: string[];
  connected: boolean;
}

interface AIResponse {
  agent: string;
  content: string;
  confidence: number;
  timestamp: Date;
}

const LovableStyleInput = () => {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [connectedAgents, setConnectedAgents] = useState<AIAgent[]>([]);
  const [showConnectors, setShowConnectors] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [aiResponses, setAiResponses] = useState<AIResponse[]>([]);
  const [isAIMode, setIsAIMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Available AI Agents
  const availableAgents: AIAgent[] = [
    {
      id: "gpt-4",
      name: "GPT-4 Legal Expert",
      description: "Advanced legal reasoning and case analysis",
      icon: Brain,
      model: "gpt-4",
      capabilities: ["Legal Analysis", "Case Research", "Document Review"],
      connected: false
    },
    {
      id: "claude",
      name: "Claude Legal Assistant",
      description: "Constitutional law and litigation support",
      icon: Sparkles,
      model: "claude-3-sonnet",
      capabilities: ["Constitutional Law", "Litigation", "Ethics"],
      connected: false
    },
    {
      id: "gemini",
      name: "Gemini Court Advisor",
      description: "Procedural guidance and court protocols",
      icon: Globe,
      model: "gemini-pro",
      capabilities: ["Court Procedures", "Filing", "Scheduling"],
      connected: false
    },
    {
      id: "custom",
      name: "Custom Legal AI",
      description: "Connect your own AI endpoint",
      icon: Code,
      model: "custom",
      capabilities: ["Custom Logic", "Specialized Knowledge"],
      connected: false
    }
  ];

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

  const handleAgentToggle = (agentId: string) => {
    setConnectedAgents(prev => {
      const agent = availableAgents.find(a => a.id === agentId);
      if (!agent) return prev;
      
      const isConnected = prev.some(a => a.id === agentId);
      if (isConnected) {
        return prev.filter(a => a.id !== agentId);
      } else {
        return [...prev, { ...agent, connected: true }];
      }
    });
  };

  const handleAIQuery = async () => {
    if (!input.trim() || connectedAgents.length === 0) return;
    
    setIsProcessing(true);
    setIsAIMode(true);
    setShowSuggestions(false);
    
    try {
      // Import the multi-agent client
      const { queryMultipleAI, getConnectedAgentNames } = await import('@/lib/aiMultiAgent');
      
      // Get connected agent IDs
      const agentIds = getConnectedAgentNames(connectedAgents);
      
      // Create context object
      const context = {
        currentRoute: window.location.pathname,
        userType: user ? 'authenticated' : 'anonymous',
        inputLength: input.length,
        timestamp: new Date().toISOString()
      };
      
      // Query multiple AI agents
      const result = await queryMultipleAI(agentIds, input, context);
      
      if (result.success && result.responses.length > 0) {
        // Convert responses to our format
        const convertedResponses: AIResponse[] = result.responses.map(response => ({
          agent: response.agent,
          content: response.content,
          confidence: response.confidence,
          timestamp: new Date(response.timestamp)
        }));
        
        setAiResponses(convertedResponses);
      } else {
        // Fallback to error message
        const errorResponse: AIResponse = {
          agent: 'System',
          content: result.error || 'Unable to process your request at this time. Please try again later.',
          confidence: 0,
          timestamp: new Date()
        };
        setAiResponses([errorResponse]);
      }
    } catch (error) {
      console.error('AI query failed:', error);
      const errorResponse: AIResponse = {
        agent: 'System',
        content: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment, or contact support if the issue persists.',
        confidence: 0,
        timestamp: new Date()
      };
      setAiResponses([errorResponse]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSmartAction = (action: string) => {
    switch (action) {
      case 'court_simulation':
        navigate('/global-court');
        break;
      case 'summon_defendant':
        navigate('/summons');
        break;
      case 'find_lawyer':
        navigate('/professionals');
        break;
      case 'create_case':
        navigate('/intake');
        break;
      case 'ai_consultation':
        handleAIQuery();
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
        {/* Header with AI Connectors */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">AI Legal Assistant</h3>
              <p className="text-xs text-slate-400">
                {connectedAgents.length > 0 
                  ? `${connectedAgents.length} agents connected` 
                  : "Connect AI agents to get started"
                }
              </p>
            </div>
          </div>
          
          {/* Plus Button for Connectors */}
          <Popover open={showConnectors} onOpenChange={setShowConnectors}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-slate-700/50 border-slate-600 hover:bg-slate-600/50 text-white"
              >
                <Plus className="h-4 w-4 mr-1" />
                Connect
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-slate-800 border-slate-700" align="end">
              <div className="p-4 border-b border-slate-700">
                <h4 className="font-semibold text-white mb-1">AI Connectors</h4>
                <p className="text-sm text-slate-400">Choose AI agents to assist you</p>
              </div>
              <div className="p-2 space-y-2 max-h-80 overflow-y-auto">
                {availableAgents.map((agent) => {
                  const IconComponent = agent.icon;
                  const isConnected = connectedAgents.some(a => a.id === agent.id);
                  return (
                    <div
                      key={agent.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all",
                        isConnected 
                          ? "bg-blue-500/20 border border-blue-500/30" 
                          : "bg-slate-700/50 hover:bg-slate-600/50"
                      )}
                      onClick={() => handleAgentToggle(agent.id)}
                    >
                      <div className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center",
                        isConnected ? "bg-blue-500/20" : "bg-slate-600/50"
                      )}>
                        <IconComponent className={cn(
                          "h-4 w-4",
                          isConnected ? "text-blue-400" : "text-slate-400"
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-white text-sm">{agent.name}</p>
                          {isConnected ? (
                            <CheckCircle className="h-3 w-3 text-blue-400" />
                          ) : (
                            <Circle className="h-3 w-3 text-slate-500" />
                          )}
                        </div>
                        <p className="text-xs text-slate-400 truncate">{agent.description}</p>
                        <div className="flex gap-1 mt-1">
                          {agent.capabilities.slice(0, 2).map((cap, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs py-0 px-1 border-slate-600 text-slate-400">
                              {cap}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
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
                connectedAgents.length > 0 
                  ? "Describe your legal situation and I'll analyze it with multiple AI perspectives..."
                  : "What legal service do you need? Connect AI agents above for enhanced assistance..."
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
                  <span className="text-xs text-blue-400 ml-2">AI processing...</span>
                )}
              </div>
            )}
          </div>
          
          {/* Enhanced Action Buttons */}
          {input.trim() && (
            <div className="mt-4 space-y-3">
              {/* AI Actions */}
              {connectedAgents.length > 0 && (
                <div className="flex gap-2">
                  <Button 
                    onClick={handleAIQuery}
                    disabled={isProcessing}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    {isProcessing ? "Processing..." : `Analyze with ${connectedAgents.length} AI${connectedAgents.length > 1 ? 's' : ''}`}
                  </Button>
                </div>
              )}
              
              {/* Smart Actions */}
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline"
                  onClick={() => handleSmartAction('court_simulation')}
                  className="bg-slate-700/50 border-slate-600 hover:bg-slate-600/50 text-white"
                >
                  <Gavel className="h-4 w-4 mr-2" />
                  Court Simulation
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleSmartAction('create_case')}
                  className="bg-slate-700/50 border-slate-600 hover:bg-slate-600/50 text-white"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Create Case
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleSmartAction('find_lawyer')}
                  className="bg-slate-700/50 border-slate-600 hover:bg-slate-600/50 text-white"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Find Professional
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setInput("");
                    setSuggestions(allSuggestions);
                    setIsAIMode(false);
                    setAiResponses([]);
                  }}
                  className="bg-slate-700/50 border-slate-600 hover:bg-slate-600/50 text-white"
                >
                  Clear
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-4 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span>Workspace</span>
            <span>Supabase</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-400 rounded-full"></div>
            <span>Connected</span>
          </div>
        </div>
      </Card>

      {/* AI Responses */}
      {isAIMode && aiResponses.length > 0 && (
        <Card className="mt-4 bg-slate-900/90 border-slate-700/50">
          <div className="p-4 border-b border-slate-700/50">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <Layers className="h-4 w-4" />
              AI Analysis Results
            </h4>
          </div>
          <div className="space-y-4 p-4">
            {aiResponses.map((response, index) => (
              <div key={index} className="border border-slate-700/50 rounded-lg p-4 bg-slate-800/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded bg-blue-500/20 flex items-center justify-center">
                      <Bot className="h-3 w-3 text-blue-400" />
                    </div>
                    <span className="font-medium text-white text-sm">{response.agent}</span>
                  </div>
                  <Badge variant="outline" className="border-green-500/50 text-green-400">
                    {Math.round(response.confidence * 100)}% confidence
                  </Badge>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{response.content}</p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50">
                    <Scale className="h-3 w-3 mr-1" />
                    Create Case
                  </Button>
                  <Button size="sm" variant="outline" className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50">
                    <Users className="h-3 w-3 mr-1" />
                    Find Lawyer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Suggestions - Only show when not in AI mode */}
      {showSuggestions && !isAIMode && (
        <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
          {suggestions.slice(0, 6).map((suggestion, index) => {
            const IconComponent = suggestion.icon;
            return (
              <Card 
                key={index}
                className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] bg-slate-800/50 border-slate-700/50 backdrop-blur-sm"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="p-4 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <IconComponent className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-white">{suggestion.title}</h4>
                      {!suggestion.public && (
                        <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                          {user ? "Available" : "Login Required"}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-400">{suggestion.description}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-700/50">
                    {suggestion.public ? "Open" : user ? "Enter" : "Login"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      
      {showSuggestions && !isAIMode && suggestions.length === 0 && input.trim() && (
        <Card className="mt-4 p-6 text-center bg-slate-800/50 border-slate-700/50">
          <MessageSquare className="h-8 w-8 text-slate-400 mx-auto mb-2" />
          <p className="text-slate-400">No matching services found. Try different keywords or connect AI agents for intelligent assistance.</p>
        </Card>
      )}
    </div>
  );
};

export default LovableStyleInput;