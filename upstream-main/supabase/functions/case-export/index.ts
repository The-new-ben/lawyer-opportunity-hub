import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import JSZip from "npm:jszip@3.10.1";
import { PDFDocument } from "npm:pdf-lib@1.17.1";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const url = new URL(req.url);
  const caseId = url.searchParams.get("caseId");
  if (!caseId) {
    return new Response("caseId required", { status: 400 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from("cases")
    .select("id, title, client_id, legal_category, status, priority, estimated_budget, assigned_lawyer_id, notes, opened_at")
    .eq("id", caseId)
    .single();

  if (error || !data) {
    return new Response("case not found", { status: 404 });
  }

  const pdf = await PDFDocument.create();
  const page = pdf.addPage();
  const content = JSON.stringify(data, null, 2);
  page.drawText(content, { x: 40, y: page.getHeight() - 40, size: 12 });
  const pdfBytes = await pdf.save();

  const zip = new JSZip();
  zip.file(`case-${caseId}.pdf`, pdfBytes);
  const zipBytes = await zip.generateAsync({ type: "uint8array" });

  return new Response(zipBytes, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename=case-${caseId}.zip`
    }
  });
});
