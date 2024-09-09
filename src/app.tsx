import { MetaProvider, Title } from "@solidjs/meta";
import { A, Router, useLocation } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import { ConfirmDialog } from "./components/confirmDialog";
import { ColorModeProvider, ColorModeScript } from "@kobalte/core";
import "./app.css";
import { Card } from "./components/ui/card";
import { buttonVariants } from "./components/ui/button";
import { cn } from "./libs/cn";
import { ToastList, ToastRegion } from "./components/ui/toast";

export default function App() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <Title>Suikerbietenarchief</Title>

          <ColorModeScript />
          <ColorModeProvider>
            <div class="fixed z-50 w-full flex justify-center pt-2 pointer-events-none">
              <Card class="p-1 flex items-center pointer-events-auto">
                <A href="/" class="hidden sm:block">
                  <h1 class="px-4 text-lg">Nationaal Suikerbietenarchief</h1>
                </A>
                <NavItem href="/">Home</NavItem>
                <NavItem href="/archief">Archief</NavItem>
                <NavItem href="/kaart">Kaart</NavItem>
                <NavItem href="/admin">Inloggen</NavItem>
              </Card>
            </div>

            <div id="smooth-wrapper">
              <div id="smooth-content" class="page flex flex-col items-center">
                <Suspense> {props.children} </Suspense>
              </div>
            </div>

            <ToastRegion>
              <ToastList />
            </ToastRegion>
            <ConfirmDialog />
          </ColorModeProvider>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}

function NavItem(props: { href: string; children: any }) {
  const location = useLocation();

  const active = () => location.pathname === props.href;
  const activeClass = () => (active() ? "" : "text-muted-foreground");

  return (
    <A
      class={cn(buttonVariants({ variant: "ghost" }), activeClass())}
      href={props.href}
    >
      {props.children}
    </A>
  );
}
