import { useEffect } from "react";
import ChatPortal from "@/features/ai/ChatPortal";

const GlobalCourt = () => {
  
  useEffect(() => {
    document.title = "International AI Court | Global Justice Dashboard";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      const m = document.createElement('meta');
      m.name = 'description';
      m.content = 'Global AI-powered court: intake, summons, hearings, simulation & procedure guide.';
      document.head.appendChild(m);
    } else {
      metaDesc.setAttribute('content', 'Global AI-powered court: intake, summons, hearings, simulation & procedure guide.');
    }

    const canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      const link = document.createElement('link');
      link.rel = 'canonical';
      link.href = window.location.href;
      document.head.appendChild(link);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Main AI Chat Portal - First thing users see */}
      <ChatPortal />
    </div>
  );
};

export default GlobalCourt;
