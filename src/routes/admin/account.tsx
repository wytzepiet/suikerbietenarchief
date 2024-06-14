import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { user } from "@/libs/supabase/user";
import { action, useNavigate } from "@solidjs/router";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AlertDialogTriggerProps } from "@kobalte/core/alert-dialog";
import {
  TextField,
  TextFieldLabel,
  TextFieldRoot,
} from "@/components/ui/textfield";
import { supabase } from "@/libs/supabase/client";

const updateEmail = action(async (formData: FormData) => {
  if (!formData.has("email")) return;
  const email = String(formData.get("email"));
  if (!email) return;
  await supabase().auth.updateUser({ email });
});

async function updatePassword() {
  if (!user()?.email) return;
  await supabase().auth.resetPasswordForEmail(user()?.email!);
}

export default function Account() {
  const navigate = useNavigate();
  async function deleteUser() {
    const { data } = await supabase().auth.getSession();
    if (!data.session?.user.id) return;
    await supabase().auth.admin.deleteUser(data.session?.user.id!);
    navigate("/");
  }

  return (
    <div class="flex flex-col gap-4 items-start">
      <div class="flex justify-between self-stretch">
        <h1 class="text-2xl font-medium">Account</h1>
      </div>

      <p class="">Email: {user()?.email}</p>
      <div class="flex gap-4">
        <AlertDialog>
          <AlertDialogTrigger
            as={(props: AlertDialogTriggerProps) => (
              <Button variant="outline" {...props}>
                Email wijzigen
              </Button>
            )}
          />
          <AlertDialogContent>
            <form
              class="flex flex-col gap-4"
              action={updateEmail}
              method="post"
            >
              <AlertDialogHeader>
                <AlertDialogTitle>Email wijzigen</AlertDialogTitle>
                <AlertDialogDescription>
                  Er wordt een link gestuurd naar het nieuwe emailadres
                </AlertDialogDescription>
              </AlertDialogHeader>

              <TextFieldRoot>
                <TextFieldLabel>Nieuw emailadres</TextFieldLabel>
                <TextField type="email" name="email"></TextField>
              </TextFieldRoot>
              <AlertDialogFooter>
                <AlertDialogClose>Annuleren</AlertDialogClose>
                <AlertDialogAction type="submit">Stuur link</AlertDialogAction>
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger
            as={(props: AlertDialogTriggerProps) => (
              <Button variant="outline" {...props}>
                Wachtwoord wijzigen
              </Button>
            )}
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Wachtwoord wijzigen</AlertDialogTitle>
              <AlertDialogDescription>
                Er wordt een link gestuurd naar{" "}
                <span class="text-foreground">{user()?.email}</span> om het
                wachtwoord te wijzigen.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogClose>Annuleren</AlertDialogClose>
              <AlertDialogAction onClick={updatePassword}>
                Stuur link
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Separator />

      <AlertDialog>
        <AlertDialogTrigger
          as={(props: AlertDialogTriggerProps) => (
            <Button variant="destructive" {...props}>
              Account verwijderen
            </Button>
          )}
        />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Account verwijderen</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je het zeker? Dit kan niet ongedaan worden gemaakt!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose>Nee, annuleren</AlertDialogClose>
            <Button variant="destructive">Ja, account verwijderen</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}