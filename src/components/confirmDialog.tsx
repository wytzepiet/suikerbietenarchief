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

const defaults = {
  title: "Bevestig",
  description: "Weet je het zeker?",
  confirm: "Doorgaan",
  cancel: "Annuleren",
};

const [messages, setMessages] = createStore<Partial<typeof defaults>>(defaults);
const message = (key: keyof typeof defaults) => messages[key] ?? defaults[key];

const [open, setOpen] = createSignal(false);

let confirm = (_: boolean) => {};

function setDialogOpen(open: boolean, confirmed: boolean = false) {
  setOpen(open);
  confirm(confirmed);
}

export function confirmWithDailog(messages?: Partial<typeof defaults>) {
  setMessages(messages ?? defaults);
  setOpen(true);
  return new Promise<boolean>((resolve) => (confirm = resolve));
}

export function ConfirmDialog() {
  return (
    <AlertDialog open={open()} onOpenChange={setDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{message("title")}</AlertDialogTitle>
          <AlertDialogDescription>{message("description")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogClose class="m-0">{message("cancel")}</AlertDialogClose>
          <AlertDialogAction onClick={() => setDialogOpen(false, true)}>
            {message("confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
