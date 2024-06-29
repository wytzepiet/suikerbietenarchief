import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import { ConfirmDialog } from "./components/confirmDialog";
import { Toaster } from "./components/ui/sonner";
import { ColorModeProvider, ColorModeScript } from "@kobalte/core";
import "./app.css";

export default function App() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <Title>Suikerbietenarchief</Title>
          <nav>
            <a href="/">Index</a>
            <a href="/test">About</a>
          </nav>

          <Suspense>
            <ColorModeScript />
            <ColorModeProvider>
              <div class="page">{props.children}</div>
              <Toaster />
              <ConfirmDialog />
            </ColorModeProvider>
          </Suspense>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
