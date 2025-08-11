import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const LegalConsultation = () => {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch("/functions/v1/legal-consultation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question })
    })
    const data = await res.json()
    setAnswer(data.answer || "")
    setLoading(false)
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>התייעצות משפטית</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <Textarea value={question} onChange={e => setQuestion(e.target.value)} placeholder="כתוב שאלה" />
            <Button type="submit" disabled={loading}>{loading ? "שולח..." : "שלח"}</Button>
          </form>
          {answer && <div className="mt-4 whitespace-pre-wrap">{answer}</div>}
        </CardContent>
      </Card>
    </div>
  )
}

export default LegalConsultation
