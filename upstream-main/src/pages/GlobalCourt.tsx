import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import IntakeAssistant from "@/components/court/IntakeAssistant";
import SummonsForm from "@/components/court/SummonsForm";
import HearingScheduler from "@/components/court/HearingScheduler";
import SimulationArena from "@/components/court/SimulationArena";
import ProcedureGuide from "@/components/court/ProcedureGuide";
import ProfessionalsCatalog from "@/components/court/ProfessionalsCatalog";
import EvidencePrep from "@/components/court/EvidencePrep";
import PartyInterrogation from "@/components/court/PartyInterrogation";
import CaseBuilder from "@/components/court/CaseBuilder";
import RoleMatchFinder from "@/components/court/RoleMatchFinder";
import IntakeFreeform from "@/components/court/IntakeFreeform";
import SmartIntakePortal from "@/components/court/SmartIntakePortal";

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
      
      {/* Header with AI Portal Link */}
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-primary">International AI Court</h1>
          <Button 
            onClick={() => window.location.href = '/ai-portal'} 
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            🤖 צ'אט AI חדש - OpenAI
          </Button>
        </div>
      </div>
      
      {/* Smart Intake Portal - Main Interface */}
      <SmartIntakePortal />
    </div>
  );
};

export default GlobalCourt;
