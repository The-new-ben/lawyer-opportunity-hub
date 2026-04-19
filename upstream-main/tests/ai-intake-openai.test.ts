import { describe, it, expect, vi } from "vitest"

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { functions: { invoke: vi.fn() } }
}))
import { runIntake } from "../src/aiIntake/openaiIntakeClient"
import { supabase } from "@/integrations/supabase/client"

describe("ai-intake-openai", () => {
  it("parses structured JSON", async () => {
    const sample = {
      caseTitle: "t",
      caseSummary: "s",
      jurisdiction: "j",
      legalCategory: "l",
      reliefSought: "r",
      parties: [{ role: "plaintiff", name: "p" }],
      evidence: ["e"],
      timeline: "tl",
      nextQuestion: "n",
      confidence: { caseTitle: 0.9 }
    }
    ;(supabase.functions.invoke as any).mockResolvedValue({ data: JSON.stringify(sample), error: null })
    const result = await runIntake([{ role: "user", content: "hi" }])
    expect(result).toEqual(sample)
    expect(supabase.functions.invoke).toHaveBeenCalledWith("ai-intake-openai", { body: { messages: [{ role: "user", content: "hi" }] } })
  })

  it("throws on invalid JSON", async () => {
    ;(supabase.functions.invoke as any).mockResolvedValue({ data: "oops", error: null })
    await expect(runIntake([{ role: "user", content: "hi" }])).rejects.toThrow("Invalid AI response format")
  })
})
