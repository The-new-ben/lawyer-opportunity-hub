import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFieldExtraction } from "@/hooks/useFieldExtraction";
import { transcribeVoice } from "@/lib/api";
import { toast } from "sonner";

export function LiveChat() {
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{role: string, content: string}>>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const { fields, isExtracting } = useFieldExtraction(input);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        try {
          const result = await transcribeVoice(audioBlob) as { text: string };
          setInput(prev => prev + " " + result.text);
        } catch (error) {
          toast.error("התמלול נכשל");
        }
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast.error("לא ניתן לגשת למיקרופון");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    
    setChatHistory(prev => [...prev, 
      { role: 'user', content: input },
      { role: 'assistant', content: 'מעבד את המידע...' }
    ]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-background border-l">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-lg">צ׳אט חי עם AI</h3>
        {isExtracting && (
          <Badge variant="secondary" className="mt-2">
            מחלץ מידע...
          </Badge>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.map((msg, idx) => (
          <Card key={idx} className={`p-3 ${msg.role === 'user' ? 'ml-auto bg-primary text-primary-foreground' : 'mr-auto'} max-w-[80%]`}>
            <p className="text-sm">{msg.content}</p>
          </Card>
        ))}
        
        {fields.length > 0 && (
          <Card className="p-3 bg-muted">
            <p className="text-sm font-medium mb-2">שדות שזוהו:</p>
            {fields.map(field => (
              <Badge key={field.name} variant="outline" className="mr-2 mb-1">
                {field.name}: {field.value}
              </Badge>
            ))}
          </Card>
        )}
      </div>
      
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="תאר את הסכסוך שלך..."
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1"
          />
          <Button
            size="icon"
            variant={isRecording ? "destructive" : "outline"}
            onClick={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Button size="icon" onClick={sendMessage}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}