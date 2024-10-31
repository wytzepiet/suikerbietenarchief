import PageTitle, { pageTitle } from "@/components/pageTitle";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  return (
    <main>
      <PageTitle>Dashboard</PageTitle>
      <CardHeader>
        <CardTitle class="text-2xl">{pageTitle()}</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="h-[400px] flex justify-center items-center">
          <p>Hier komen nog dingen</p>
        </div>
      </CardContent>
    </main>
  );
}
