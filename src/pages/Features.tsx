import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { features } from "@/data/features";

const Features = () => {
  return (
    <div className="p-6 space-y-6 flex flex-col overflow-x-hidden">
      <div>
        <h1 className="text-3xl font-bold mb-4">Business Features</h1>
        <p className="text-muted-foreground">Key technologies and capabilities that can enhance the platform.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle className="text-base font-semibold">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Features;
