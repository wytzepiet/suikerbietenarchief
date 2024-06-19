import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { Button, buttonVariants } from "./ui/button";
import { VariantProps } from "class-variance-authority";

const defaults = {
  title: "Bevestig",
  description: "Weet je het zeker?",
  confirm: "Doorgaan",
  cancel: "Annuleren",
};

const defaultOptions = {
  variant: "default" as VariantProps<typeof buttonVariants>["variant"],
};

const [messages, setMessages] = createStore<Partial<typeof defaults>>({});
const message = (key: keyof typeof defaults) => messages[key] ?? defaults[key];

const [options, setOptions] =
  createStore<Partial<typeof defaultOptions>>(defaultOptions);

const [open, setOpen] = createSignal(false);

let confirm = (_: boolean) => {};

function setDialogOpen(open: boolean, confirmed: boolean = false) {
  setOpen(open);
  confirm(confirmed);
}

export function confirmWithDailog(
  messages: Partial<typeof defaults> = defaults,
  options: Partial<typeof defaultOptions> = defaultOptions
) {
  setMessages(messages);
  setOptions(options);
  setOpen(true);
  return new Promise<boolean>((resolve) => (confirm = resolve));
}

export function ConfirmDialog() {
  return (
    <AlertDialog open={open()} onOpenChange={setDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{message("title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {message("description")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogClose class="m-0">{message("cancel")}</AlertDialogClose>
          <AlertDialogAction
            as={() => (
              <Button
                onClick={() => setDialogOpen(false, true)}
                variant={options.variant ?? defaultOptions.variant}
              >
                {message("confirm")}
              </Button>
            )}
          ></AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
