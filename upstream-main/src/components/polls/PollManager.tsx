import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart3, 
  Users, 
  Vote, 
  Plus, 
  Trash2, 
  Eye, 
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react';

interface PollOption {
  id: string;
  text: string;
  votes: number;
  voters: string[];
}

interface Poll {
  id: string;
  question: string;
  description?: string;
  options: PollOption[];
  isActive: boolean;
  allowMultiple: boolean;
  requireAuth: boolean;
  endTime?: Date;
  totalVotes: number;
  createdAt: Date;
}

interface PollManagerProps {
  caseId?: string;
  onPollCreated?: (poll: Poll) => void;
  onVoteSubmitted?: (pollId: string, optionIds: string[]) => void;
  existingPolls?: Poll[];
  canCreatePolls?: boolean;
}

export function PollManager({ 
  caseId, 
  onPollCreated, 
  onVoteSubmitted,
  existingPolls = [],
  canCreatePolls = true 
}: PollManagerProps) {
  const [polls, setPolls] = useState<Poll[]>(existingPolls);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState<string | null>(null);
  const [userVotes, setUserVotes] = useState<Record<string, string[]>>({});
  
  // Poll creation state
  const [newQuestion, setNewQuestion] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newOptions, setNewOptions] = useState<string[]>(['', '']);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [requireAuth, setRequireAuth] = useState(true);
  const [duration, setDuration] = useState<'1h' | '6h' | '24h' | '3d' | 'unlimited'>('24h');
  
  const { toast } = useToast();

  useEffect(() => {
    // Load user votes from localStorage
    const savedVotes = localStorage.getItem('poll_votes');
    if (savedVotes) {
      setUserVotes(JSON.parse(savedVotes));
    }
  }, []);

  const createPoll = () => {
    if (!newQuestion.trim() || newOptions.filter(opt => opt.trim()).length < 2) {
      toast({
        title: 'Invalid Poll',
        description: 'Question and at least 2 options are required',
        variant: 'destructive'
      });
      return;
    }

    const endTime = duration === 'unlimited' ? undefined : new Date(
      Date.now() + (
        duration === '1h' ? 60 * 60 * 1000 :
        duration === '6h' ? 6 * 60 * 60 * 1000 :
        duration === '24h' ? 24 * 60 * 60 * 1000 :
        3 * 24 * 60 * 60 * 1000
      )
    );

    const newPoll: Poll = {
      id: `poll_${Date.now()}`,
      question: newQuestion.trim(),
      description: newDescription.trim() || undefined,
      options: newOptions
        .filter(opt => opt.trim())
        .map((opt, idx) => ({
          id: `option_${idx}`,
          text: opt.trim(),
          votes: 0,
          voters: []
        })),
      isActive: true,
      allowMultiple,
      requireAuth,
      endTime,
      totalVotes: 0,
      createdAt: new Date()
    };

    setPolls([newPoll, ...polls]);
    setIsCreating(false);
    
    // Reset form
    setNewQuestion('');
    setNewDescription('');
    setNewOptions(['', '']);
    setAllowMultiple(false);
    setRequireAuth(true);
    setDuration('24h');

    toast({
      title: 'Poll Created',
      description: 'Your poll is now live for voting',
    });

    onPollCreated?.(newPoll);
  };

  const submitVote = (pollId: string, optionIds: string[]) => {
    const poll = polls.find(p => p.id === pollId);
    if (!poll || !poll.isActive) return;

    if (poll.endTime && new Date() > poll.endTime) {
      toast({
        title: 'Poll Closed',
        description: 'This poll has ended',
        variant: 'destructive'
      });
      return;
    }

    // Update poll with votes
    const updatedPolls = polls.map(p => {
      if (p.id === pollId) {
        const userId = `user_${Date.now()}`; // In real app, use actual user ID
        const updatedOptions = p.options.map(opt => {
          if (optionIds.includes(opt.id)) {
            return {
              ...opt,
              votes: opt.votes + 1,
              voters: [...opt.voters, userId]
            };
          }
          return opt;
        });

        return {
          ...p,
          options: updatedOptions,
          totalVotes: p.totalVotes + 1
        };
      }
      return p;
    });

    setPolls(updatedPolls);
    
    // Save user vote
    const newUserVotes = { ...userVotes, [pollId]: optionIds };
    setUserVotes(newUserVotes);
    localStorage.setItem('poll_votes', JSON.stringify(newUserVotes));

    toast({
      title: 'Vote Submitted',
      description: 'Thank you for your participation!',
    });

    onVoteSubmitted?.(pollId, optionIds);
  };

  const addOption = () => {
    if (newOptions.length < 10) {
      setNewOptions([...newOptions, '']);
    }
  };

  const removeOption = (index: number) => {
    if (newOptions.length > 2) {
      setNewOptions(newOptions.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const updated = [...newOptions];
    updated[index] = value;
    setNewOptions(updated);
  };

  const getTimeRemaining = (endTime?: Date) => {
    if (!endTime) return 'No time limit';
    
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h remaining`;
    }
    
    return hours > 0 ? `${hours}h ${minutes}m remaining` : `${minutes}m remaining`;
  };

  const PollResults = ({ poll }: { poll: Poll }) => {
    const maxVotes = Math.max(...poll.options.map(opt => opt.votes));
    
    return (
      <div className="space-y-3">
        {poll.options.map((option) => {
          const percentage = poll.totalVotes > 0 ? (option.votes / poll.totalVotes) * 100 : 0;
          const isWinning = option.votes === maxVotes && maxVotes > 0;
          
          return (
            <div key={option.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className={`text-sm ${isWinning ? 'font-semibold text-primary' : ''}`}>
                  {option.text}
                </span>
                <div className="flex items-center gap-2">
                  {isWinning && maxVotes > 0 && (
                    <TrendingUp className="w-4 h-4 text-primary" />
                  )}
                  <Badge variant={isWinning ? 'default' : 'secondary'}>
                    {option.votes} votes ({percentage.toFixed(1)}%)
                  </Badge>
                </div>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
          );
        })}
      </div>
    );
  };

  const VotingInterface = ({ poll }: { poll: Poll }) => {
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const hasVoted = userVotes[poll.id];
    
    if (hasVoted) {
      return (
        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
          <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-sm text-green-700 font-medium">You have already voted</p>
          <p className="text-xs text-green-600 mt-1">
            Your choices: {hasVoted.map(id => 
              poll.options.find(opt => opt.id === id)?.text
            ).join(', ')}
          </p>
        </div>
      );
    }

    const isExpired = poll.endTime && new Date() > poll.endTime;
    if (isExpired) {
      return (
        <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
          <XCircle className="w-8 h-8 text-gray-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600 font-medium">Poll has ended</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          {poll.options.map((option) => (
            <label
              key={option.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <input
                type={poll.allowMultiple ? 'checkbox' : 'radio'}
                name={`poll_${poll.id}`}
                value={option.id}
                checked={selectedOptions.includes(option.id)}
                onChange={(e) => {
                  if (poll.allowMultiple) {
                    if (e.target.checked) {
                      setSelectedOptions([...selectedOptions, option.id]);
                    } else {
                      setSelectedOptions(selectedOptions.filter(id => id !== option.id));
                    }
                  } else {
                    setSelectedOptions([option.id]);
                  }
                }}
                className="scale-110"
              />
              <span className="text-sm">{option.text}</span>
            </label>
          ))}
        </div>
        
        <Button
          onClick={() => submitVote(poll.id, selectedOptions)}
          disabled={selectedOptions.length === 0}
          className="w-full"
        >
          <Vote className="w-4 h-4 mr-2" />
          Submit Vote
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Create Poll Section */}
      {canCreatePolls && (
        <Card className="border border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <CardTitle>Create Poll</CardTitle>
              </div>
              {!isCreating && (
                <Button onClick={() => setIsCreating(true)} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Poll
                </Button>
              )}
            </div>
          </CardHeader>
          
          {isCreating && (
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm">Question *</Label>
                <Input
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="What's your question?"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-sm">Description (optional)</Label>
                <Textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Additional context or instructions..."
                  rows={2}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-sm">Options *</Label>
                <div className="space-y-2 mt-1">
                  {newOptions.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                      />
                      {newOptions.length > 2 && (
                        <Button
                          onClick={() => removeOption(index)}
                          variant="outline"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {newOptions.length < 10 && (
                    <Button onClick={addOption} variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Option
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">Allow multiple choices</Label>
                    <p className="text-xs text-muted-foreground">Users can select multiple options</p>
                  </div>
                  <Switch checked={allowMultiple} onCheckedChange={setAllowMultiple} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">Require authentication</Label>
                    <p className="text-xs text-muted-foreground">Only logged-in users can vote</p>
                  </div>
                  <Switch checked={requireAuth} onCheckedChange={setRequireAuth} />
                </div>
              </div>
              
              <div>
                <Label className="text-sm">Duration</Label>
                <Select value={duration} onValueChange={(value: any) => setDuration(value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">1 hour</SelectItem>
                    <SelectItem value="6h">6 hours</SelectItem>
                    <SelectItem value="24h">24 hours</SelectItem>
                    <SelectItem value="3d">3 days</SelectItem>
                    <SelectItem value="unlimited">No time limit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-3">
                <Button onClick={createPoll} className="flex-1">
                  <Vote className="w-4 h-4 mr-2" />
                  Create Poll
                </Button>
                <Button onClick={() => setIsCreating(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Active Polls */}
      <div className="space-y-4">
        {polls.map((poll) => (
          <Card key={poll.id} className="border border-border">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-lg">{poll.question}</CardTitle>
                  {poll.description && (
                    <p className="text-sm text-muted-foreground">{poll.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={poll.isActive ? 'default' : 'secondary'}>
                      {poll.isActive ? 'Active' : 'Closed'}
                    </Badge>
                    {poll.allowMultiple && (
                      <Badge variant="outline">Multiple choice</Badge>
                    )}
                    {poll.requireAuth && (
                      <Badge variant="outline">
                        <Shield className="w-3 h-3 mr-1" />
                        Auth required
                      </Badge>
                    )}
                    <Badge variant="secondary">
                      <Users className="w-3 h-3 mr-1" />
                      {poll.totalVotes} votes
                    </Badge>
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {getTimeRemaining(poll.endTime)}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {selectedPoll === poll.id || poll.totalVotes === 0 ? (
                  <VotingInterface poll={poll} />
                ) : (
                  <div className="space-y-3">
                    <PollResults poll={poll} />
                    <Button
                      onClick={() => setSelectedPoll(selectedPoll === poll.id ? null : poll.id)}
                      variant="outline"
                      size="sm"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {selectedPoll === poll.id ? 'Show Results' : 'Vote'}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {polls.length === 0 && !isCreating && (
        <div className="text-center p-8 bg-muted/50 rounded-lg border border-dashed border-border">
          <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium text-muted-foreground mb-2">No polls yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create a poll to gather opinions and votes from participants
          </p>
          {canCreatePolls && (
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Poll
            </Button>
          )}
        </div>
      )}
    </div>
  );
}