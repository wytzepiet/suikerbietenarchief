import PageTitle from "@/components/pageTitle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/libs/supabase/client";
import { A, RouteSectionProps, useNavigate } from "@solidjs/router";
import {
  Calendar,
  Images,
  LayoutDashboard,
  Power,
  User,
  Video,
} from "lucide-solid";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { createSignal, onMount } from "solid-js";
import { setUser, user } from "@/libs/supabase/user";

const menu = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Videos",
    href: "/admin/videos",
    icon: Video,
  },
  {
    title: "Fotosets",
    href: "/admin/fotosets",
    icon: Images,
  },
  {
    title: "Tijdlijn",
    href: "/admin/tijdlijn",
    icon: Calendar,
  },
  {
    title: "Account",
    href: "/admin/account",
    icon: User,
  },
];

export default function Admin(props: RouteSectionProps) {
  const navigate = useNavigate();

  const [signOutDialogOpen, setSignOutDialogOpen] = createSignal(false);

  onMount(async () => {
    const { data, error } = await supabase().auth.getSession();
    if (!data.session?.user) navigate("/login");
    setUser(data.session?.user);
  });

  return (
    <div class="p-4 flex flex-col items-center ">
      <PageTitle>Admin Page</PageTitle>
      {user() && (
        <div class="w-[1000px] max-w-full flex flex-col gap-4">
          <div class="h-[50px]"></div>
          <Card class="flex items-stretch">
            <div class="min-w-[140px] border-r p-2 flex flex-col gap-2">
              {menu.map((item) => {
                const current = props.location.pathname === item.href;
                return (
                  <A href={item.href} class="block w-full">
                    <Button
                      variant={current ? "secondary" : "ghost"}
                      class="w-full justify-start font-normal flex gap-2"
                    >
                      <item.icon strokeWidth={1.5} size="1.5em" />
                      {item.title}
                    </Button>
                  </A>
                );
              })}
            </div>
            <div class="grow p-6">{props.children}</div>
          </Card>
        </div>
      )}
    </div>
  );
}
