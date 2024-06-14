import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { For, Show, createMemo, createSignal } from "solid-js";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  TextField,
  TextFieldLabel,
  TextFieldRoot,
} from "@/components/ui/textfield";
import {
  Switch,
  SwitchControl,
  SwitchLabel,
  SwitchThumb,
} from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { TextArea } from "@/components/ui/textarea";
import { action } from "@solidjs/router";
import { Status, Upload, createUpload } from "@/libs/video/createUpload";

export default function UploadVideos() {
  const [uploads, setUploads] = createSignal<Upload[]>([]);

  const filterUploads = (s: Status) => uploads().filter((u) => u.status() == s);
  const newUploads = createMemo(() => filterUploads("idle"));
  const busyUploads = createMemo(() => filterUploads("uploading"));

  function createUploads(files: FileList | null) {
    if (!files) return;
    const newUploads = [...files].map((file) => {
      const upload = createUpload(file);

      upload.onRemove.push(() => {
        setUploads(uploads().filter((u) => u.file !== file));
      });
      return upload;
    });
    setUploads([...newUploads, ...uploads()]);
  }

  async function startUpload() {
    uploads().forEach((upload) => upload.start());
  }

  return (
    <div class="flex flex-col items-start gap-4">
      <div class="flex justify-between">
        <h1 class="text-2xl font-medium">Upload video's</h1>
      </div>

      <Card class="relative h-52 w-72 flex flex-col justify-center items-center gap-2">
        <Button variant="secondary">Upload Videos</Button>
        <p class="text-muted-foreground">of drop ze hier</p>
        <input
          type="file"
          multiple
          accept="video/*"
          class="absolute inset-0 opacity-0 cursor-pointer"
          onInput={(e) => createUploads(e.currentTarget.files)}
        ></input>
      </Card>

      <Button onClick={startUpload} disabled={!newUploads().length}>
        Start upload
      </Button>

      <Show when={newUploads().length}>
        <p class="text-muted-foreground text-sm">Nieuwe uploads</p>
        <For each={newUploads()}>
          {(upload) => <UploadDetails upload={upload} />}
        </For>
      </Show>
      <Show when={busyUploads().length}>
        <p class="text-muted-foreground text-sm">Bezig met uploaden</p>
        <For each={busyUploads()}>
          {(upload) => <UploadDetails upload={upload} />}
        </For>
      </Show>
    </div>
  );
}

function UploadDetails({ upload }: { upload: Upload }) {
  function bytesToSize(bytes: number) {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0 Byte";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i];
  }

  return (
    <div class="w-[400px] mb-6">
      <p>{upload.video.title()}</p>

      <Show when={upload.error()}>
        <p class="text-red-400">{upload.error()}</p>
      </Show>

      <Show when={!upload.error()}>
        <div class="flex justify-between text-muted-foreground text-sm mb-2">
          <p>{bytesToSize(upload.file.size)}</p>
          <div class="flex gap-2 items-center">
            <Show when={upload.status() == "done"}>
              <p>Done!</p>
            </Show>
            <Show when={upload.status() == "uploading"}>
              <p>{upload.progress().toFixed(1)}%</p>
            </Show>

            <Button
              variant="outline"
              class="py-[0.1rem] h-fit"
              onClick={() => upload.remove()}
            >
              Annuleren
            </Button>
            <VideoSheet upload={upload} />
          </div>
        </div>

        <Card class="w-full">
          <Skeleton
            class="h-[2px] bg-foreground shadow-[0_0_10px_0px_white]  shadow-foreground"
            style={`width: ${upload.progress() ?? 0}%`}
          />
        </Card>
      </Show>
    </div>
  );
}

function VideoSheet({ upload }: { upload: Upload }) {
  const video = upload.video;
  const [open, setOpen] = createSignal(false);

  const saveVideo = action(async (data: FormData) => {
    if (!data.get("title")) return;

    video.setTitle(String(data.get("title")));
    video.description = String(data.get("description"));
    video.hint = String(data.get("hint"));

    video.save();
    setOpen(false);
  });

  return (
    <Sheet open={open()} onOpenChange={setOpen}>
      <SheetTrigger>
        <Button class="py-[0.1rem] h-fit">Bewerken</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Bewerk video</SheetTitle>
          <SheetDescription>
            Video wordt gepubliceerd wanneer de upload klaar is.
          </SheetDescription>
        </SheetHeader>
        <div class="h-8"></div>
        <form class="flex flex-col gap-8" action={saveVideo} method="post">
          <TextFieldRoot>
            <TextFieldLabel>Titel</TextFieldLabel>
            <TextField name="title" value={video.title()}></TextField>
          </TextFieldRoot>
          <Separator />
          <Switch
            name="generateDescription"
            class="flex items-center space-x-2"
            checked={video.generateDescription()}
            onChange={(val) => video.setGenerateDescription(val)}
          >
            <SwitchControl>
              <SwitchThumb />
            </SwitchControl>
            <SwitchLabel class="text-sm">
              Beschrijving genereren met ChatGPT
            </SwitchLabel>
          </Switch>
          <Show when={video.generateDescription()}>
            <TextFieldRoot>
              <TextFieldLabel>Hint voor ChatGPT</TextFieldLabel>
              <TextArea name="hint" value={upload.video.hint} />
            </TextFieldRoot>
          </Show>
          <Show when={!video.generateDescription()}>
            <TextFieldRoot>
              <TextFieldLabel>Beschrijving</TextFieldLabel>
              <TextArea name="description" value={upload.video.description} />
            </TextFieldRoot>
          </Show>
          <Button
            class="self-start"
            type="submit"
            onClick={() => setOpen(false)}
          >
            Opslaan
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
