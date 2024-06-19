import PageTitle, { pageTitle } from "@/components/pageTitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/libs/supabase/client";
import { A, RouteSectionProps, useNavigate } from "@solidjs/router";
import { Calendar, Images, LayoutDashboard, User, Video } from "lucide-solid";
import { onMount } from "solid-js";
import { setUser, user } from "@/libs/supabase/user";
import { cn } from "@/libs/cn";

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

  onMount(async () => {
    const { data, error } = await supabase().auth.getSession();
    if (!data.session?.user) navigate("/login");
    setUser(data.session?.user);
  });

  return (
    <div class="p-4 flex flex-col items-center ">
      {user() && (
        <div class="w-[1000px] max-w-full flex flex-col gap-4">
          <div class="h-[50px]"></div>
          <Card class="flex items-stretch">
            <div class="min-w-[140px] border-r p-2 ">
              <div class="sticky top-2 flex flex-col gap-2">
                {menu.map((item) => {
                  const current = props.location.pathname === item.href;
                  const currentClass = current ? "bg-secondary" : "";
                  return (
                    <A href={item.href} class="block w-full">
                      <Button
                        variant={current ? "secondary" : "ghost"}
                        class={cn(currentClass, "w-full justify-start font-normal flex gap-2")}
                      >
                        <item.icon strokeWidth={1.5} size="1.5em" />
                        {item.title}
                      </Button>
                    </A>
                  );
                })}
              </div>
            </div>
            <div class="grow">{props.children}</div>
          </Card>
        </div>
      )}
    </div>
  );
}
