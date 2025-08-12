import { LiveChat } from "@/components/LiveChat";
import { SmartForm } from "@/components/SmartForm";
import { useRTL } from "@/hooks/useRTL";
import { useEffect } from "react";

export default function Intake() {
  const { dir } = useRTL();

  useEffect(() => {
    document.title = "Justice.com - Live Intake";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'AI-powered legal case intake system');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'AI-powered legal case intake system';
      document.head.appendChild(meta);
    }
  }, []);

  return (
    <main className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-background to-muted" dir={dir}>
      <div className="flex-1 border-r">
        <LiveChat />
      </div>
      <div className="flex-1">
        <SmartForm />
      </div>
    </main>
  );
}