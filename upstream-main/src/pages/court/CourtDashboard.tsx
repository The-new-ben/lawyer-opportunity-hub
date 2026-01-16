import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

const CourtDashboard = () => (
  <div className="p-6 space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Court Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <Link to="/court/session/1">
          <Button>View Session</Button>
        </Link>
      </CardContent>
    </Card>
  </div>
)

export default CourtDashboard;
