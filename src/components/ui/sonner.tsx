import { useColorMode } from "@kobalte/core/color-mode";
import { Show, onCleanup, onMount } from "solid-js";
import { createSignal } from "solid-js";
import { Toaster as Sonner } from "solid-sonner";

const [toasterCount, setToasterCount] = createSignal(0);

export const Toaster = (props: Parameters<typeof Sonner>[0]) => {
  const { colorMode } = useColorMode();

  setToasterCount((prev) => prev + 1);
  const index = toasterCount();
  const current = () => index === toasterCount();

  onCleanup(() => setToasterCount((prev) => prev - 1));

  return (
    <Sonner
      theme={colorMode()}
      class="toaster group z-400"
      style={{ visibility: current() ? "visible" : "hidden" }}
      toastOptions={{
        classes: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          closeButton:
            "bg-background hover:!bg-secondary !border-border text-muted-foreground",
        },
      }}
      closeButton
      {...props}
    />
  );
};
