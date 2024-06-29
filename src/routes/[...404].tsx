import { Title } from "@solidjs/meta";
import { HttpStatusCode } from "@solidjs/start";
import { Button } from "@/components/ui/button";
import { on, onMount } from "solid-js";
export default function NotFound() {
  return (
    <main class="h-[80vh] flex flex-col justify-center items-center">
      <Title>Not Found</Title>
      <HttpStatusCode code={404} />
      <h1 class="text-6xl text-muted-foreground font-medium">404</h1>
      <p class="mb-4">Pagina niet gevonden</p>
      <Button variant="outline" onClick={() => onMount(() => history.back())}>
        Ga terug
      </Button>
    </main>
  );
}
