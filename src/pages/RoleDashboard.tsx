import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { useRole } from "@/hooks/useRole"

export default function RoleDashboard() {
  const { role, loading } = useRole()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return
    if (role === "admin") navigate("/dashboard/admin", { replace: true })
    else if (role === "lawyer") navigate("/dashboard/lawyer", { replace: true })
    else if (role === "client") navigate("/cases", { replace: true })
    else if (role === "supplier") navigate("/supplier/leads", { replace: true })
    else navigate("/landing", { replace: true })
  }, [role, loading, navigate])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}
