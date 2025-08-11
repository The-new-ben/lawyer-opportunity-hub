import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <main className="container mx-auto p-6 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">International AI Court</h1>
        <p className="text-muted-foreground max-w-2xl">
          Unified, AI-assisted justice for everyone. Start case intake, summon parties, schedule hearings,
          join live simulation with gamification, and learn how proceedings work.
        </p>
      </header>

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
    </main>
  );
};

export default GlobalCourt;
