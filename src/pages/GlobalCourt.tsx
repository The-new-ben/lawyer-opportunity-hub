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
  const [showAdditionalTools, setShowAdditionalTools] = useState(false);
  
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
      
      {/* Smart Intake Portal - Main Interface */}
      <SmartIntakePortal />
      
      {/* Toggle for Additional Tools */}
      <div className="container mx-auto p-6">
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => setShowAdditionalTools(!showAdditionalTools)}
            className="mb-6"
          >
            {showAdditionalTools ? (
              <>
                <ChevronUp className="w-4 h-4 mr-2" />
                הסתר כלים נוספים
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                הצג כלים נוספים
              </>
            )}
          </Button>
        </div>

        {showAdditionalTools && (
          <div className="space-y-8">
            <header className="text-center space-y-2">
              <h2 className="text-3xl font-bold">כלים נוספים</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                כלים מתקדמים נוספים להכנת תיקים ודיונים משפטיים
              </p>
            </header>

            <section className="mb-6">
              <IntakeFreeform />
            </section>

            <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Case Intake Assistant</CardTitle>
          </CardHeader>
          <CardContent>
            <IntakeAssistant />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summon Parties</CardTitle>
          </CardHeader>
          <CardContent>
            <SummonsForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schedule Hearing</CardTitle>
          </CardHeader>
          <CardContent>
            <HearingScheduler />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Simulation Arena (Gamified)</CardTitle>
          </CardHeader>
          <CardContent>
            <SimulationArena />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evidence Preparation (Collaborative)</CardTitle>
          </CardHeader>
          <CardContent>
            <EvidencePrep />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Professionals Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfessionalsCatalog />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>How Proceedings Work</CardTitle>
          </CardHeader>
          <CardContent>
            <ProcedureGuide />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Party Interrogation (AI)</CardTitle>
          </CardHeader>
          <CardContent>
            <PartyInterrogation />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Case Builder (IRAC + Timeline)</CardTitle>
          </CardHeader>
          <CardContent>
            <CaseBuilder />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Role Match Finder (AI)</CardTitle>
          </CardHeader>
          <CardContent>
            <RoleMatchFinder />
          </CardContent>
        </Card>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalCourt;
