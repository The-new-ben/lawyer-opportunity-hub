import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRatings } from '@/hooks/useRatings';
import { useCases } from '@/hooks/useCases';

interface LawyerInfo {
  id: string;
  name: string;
}

const Reports = () => {
  const { ratings } = useRatings();
  const { cases } = useCases();

  const { data: lawyers } = useQuery<LawyerInfo[]>({
    queryKey: ['lawyers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lawyers')
        .select('id, profiles(full_name)');
      if (error) throw error;
      return (data || []).map(l => ({ id: l.id, name: l.profiles?.full_name || '' }));
    }
  });

  const leaderboard = useMemo(() => {
    const map = new Map<string, { name: string; caseCount: number; scoreTotal: number; ratingCount: number }>();

    lawyers?.forEach(l => map.set(l.id, { name: l.name, caseCount: 0, scoreTotal: 0, ratingCount: 0 }));

    cases.forEach(c => {
      if (c.assigned_lawyer_id) {
        const entry = map.get(c.assigned_lawyer_id) || { name: c.assigned_lawyer_id, caseCount: 0, scoreTotal: 0, ratingCount: 0 };
        entry.caseCount += 1;
        map.set(c.assigned_lawyer_id, entry);
      }
    });

    ratings?.forEach(r => {
      const entry = map.get(r.lawyer_id) || { name: r.lawyer_id, caseCount: 0, scoreTotal: 0, ratingCount: 0 };
      entry.scoreTotal += r.score;
      entry.ratingCount += 1;
      map.set(r.lawyer_id, entry);
    });

    return Array.from(map.values())
      .map(e => ({
        name: e.name,
        caseCount: e.caseCount,
        averageScore: e.ratingCount ? Math.round((e.scoreTotal / e.ratingCount) * 10) / 10 : 0
      }))
      .sort((a, b) => b.averageScore - a.averageScore);
  }, [lawyers, cases, ratings]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">דוחות</h1>
        <p className="text-muted-foreground">דירוגים ונתוני תיקים</p>
      </div>

      <section>
        <h2 className="text-2xl font-bold mb-4">טבלת מובילים</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="px-4 py-2">עורך דין</th>
                <th className="px-4 py-2">מספר תיקים</th>
                <th className="px-4 py-2">דירוג ממוצע</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((item, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-4 py-2">{item.name}</td>
                  <td className="px-4 py-2">{item.caseCount}</td>
                  <td className="px-4 py-2">{item.averageScore.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Reports;
