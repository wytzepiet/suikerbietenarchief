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
import { TextField, TextFieldLabel, TextFieldRoot } from "@/components/ui/textfield";
import { supabase } from "@/libs/supabase/client";
import { LogOut } from "lucide-solid";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageTitle, { pageTitle } from "@/components/pageTitle";

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

  async function signOut() {
    await supabase().auth.signOut();
    navigate("/login");
  }

  return (
    <main>
      <PageTitle>Account</PageTitle>
      <CardHeader>
        <CardTitle class="text-2xl">{pageTitle()}</CardTitle>
      </CardHeader>

      <CardContent class="flex flex-col gap-4">
        <p class="">Email: {user()?.email}</p>
        <div class="flex flex-wrap gap-4">
          <AlertDialog>
            <AlertDialogTrigger
              as={(props: AlertDialogTriggerProps) => (
                <Button variant="outline" {...props}>
                  Email wijzigen
                </Button>
              )}
            />
            <AlertDialogContent>
              <form class="flex flex-col gap-4" action={updateEmail} method="post">
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
                  <span class="text-foreground">{user()?.email}</span> om het wachtwoord te
                  wijzigen.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogClose>Annuleren</AlertDialogClose>
                <AlertDialogAction onClick={updatePassword}>Stuur link</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <Separator />

        <div class="flex gap-4 wrap">
          <AlertDialog>
            <AlertDialogTrigger
              as={(props: AlertDialogTriggerProps) => (
                <Button variant="outline" class="flex items-center gap-2" {...props}>
                  <LogOut size="1.2em" strokeWidth={3} />
                  Uitloggen
                </Button>
              )}
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Uitloggen</AlertDialogTitle>
                <AlertDialogDescription>Weet je het zeker?</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogClose>Nee, annuleren</AlertDialogClose>
                <AlertDialogAction onclick={signOut}>Ja, log uit</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

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
                <Button variant="destructive" onclick={deleteUser}>
                  Ja, account verwijderen
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </main>
  );
}
