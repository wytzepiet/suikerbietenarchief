import PageTitle from "@/components/pageTitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TextField,
  TextFieldLabel,
  TextFieldRoot,
} from "@/components/ui/textfield";
import { supabase } from "@/libs/services/supabase/client";
import { setUser } from "@/libs/services/supabase/user";
import { action, useNavigate } from "@solidjs/router";
import { createSignal } from "solid-js";

const errors = new Map<string, string>([
  ["Invalid login credentials", "Ongeldige gebruikersnaam of wachtwoord"],
]);

export default function Login() {
  let email = "";
  let password = "";

  const navigate = useNavigate();

  const [error, setError] = createSignal("");

  supabase.auth.getSession().then(({ data }) => {
    const user = data.session?.user;
    if (user) {
      setUser(user);
      navigate("/admin");
    }
  });

  const signIn = action(async (formData: FormData) => {
    console.log(email, password);
    const { error, data } = await supabase.auth.signInWithPassword({
      email: String(formData.get("email")),
      password: String(formData.get("password")),
    });
    console.log({ error, data });
    if (error) {
      setError(errors.get(error.message) ?? error.message);
      return;
    }
    if (data.user) {
      console.log("logged in");
      navigate("/admin");
    }
  }, "login");

  return (
    <main class="px-4 min-h-screen flex flex-col justify-center items-center">
      <PageTitle>Login</PageTitle>
      <Card class="w-[400px] max-w-full">
        <CardHeader>
          <CardTitle>Inloggen</CardTitle>
        </CardHeader>
        <CardContent>
          <form class="flex flex-col gap-4" action={signIn} method="post">
            <TextFieldRoot>
              <TextFieldLabel>Email</TextFieldLabel>
              <TextField required name="email" type="email" />
            </TextFieldRoot>
            <TextFieldRoot>
              <TextFieldLabel>Wachtwoord</TextFieldLabel>
              <TextField required name="password" type="password" />
            </TextFieldRoot>
            {error() && <p class="text-red-500 text-sm">{error()}</p>}
            <Button type="submit" class="self-start">
              Log in
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
