import { Button } from "@/components/ui/button";
import { A } from "@solidjs/router";
import { Ellipsis } from "lucide-solid";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Videos() {
  return (
    <div>
      <div class="flex justify-between">
        <h1 class="text-2xl font-medium">Video's</h1>

        <div class="flex gap-4">
          <A href="/admin/upload">
            <Button>Bulk upload</Button>
          </A>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="outline" class="px-2">
                <Ellipsis size="1.5em" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem class="cursor-pointer" onSelect={() => {}}>
                Synchroniseer met Mux
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
