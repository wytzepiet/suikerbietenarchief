import PageTitle, { pageTitle } from "@/components/pageTitle";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Tijdlijn() {
  return (
    <main>
      <PageTitle>Tijdlijn</PageTitle>
      <CardHeader>
        <CardTitle class="text-2xl">{pageTitle()}</CardTitle>
      </CardHeader>
      <CardContent>
        <div>hoi</div>
      </CardContent>
    </main>
  );
}
