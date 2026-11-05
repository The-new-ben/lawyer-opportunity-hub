import { useParams, Link } from "react-router-dom"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const CourtSessionDetails = () => {
  const { id } = useParams()
  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Session {id}</CardTitle>
        </CardHeader>
        <CardContent>
          <Link to="/court">
            <Button variant="outline">Back</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

export default CourtSessionDetails;
