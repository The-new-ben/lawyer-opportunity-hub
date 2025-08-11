import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getCaseResearch } from '@/lib/aiService';

interface CaseCardProps {
  caseId: string;
  title: string;
  summary?: string;
}

export function CaseCard({ caseId, title, summary }: CaseCardProps) {
  const [research, setResearch] = useState<Array<{ source: string; url: string; summary: string }>>([]);

  useEffect(() => {
    getCaseResearch(caseId, title).then((res) => setResearch(res?.results || []));
  }, [caseId, title]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{title}</h2>
      <Tabs defaultValue="summary">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="research">Research</TabsTrigger>
        </TabsList>
        <TabsContent value="summary">
          <p>{summary}</p>
        </TabsContent>
        <TabsContent value="research">
          <ul className="list-disc ml-6">
            {research.map((r, idx) => (
              <li key={idx}>
                <a href={r.url} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">
                  {r.source}
                </a>: {r.summary}
              </li>
            ))}
          </ul>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default CaseCard;
