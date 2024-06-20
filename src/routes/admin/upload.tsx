import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { For, Show, createEffect, createMemo, createSignal } from "solid-js";
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
import { Status, Upload } from "@/libs/models/upload";
import PageTitle, { pageTitle } from "@/components/pageTitle";

export default function UploadVideos() {
  const [uploads, setUploads] = createSignal<Upload[]>([]);

  const filterUploads = (s: Status) =>
    uploads().filter((u) => u.state.status == s);
  const newUploads = createMemo(() => filterUploads("idle"));
  const busyUploads = createMemo(() => filterUploads("uploading"));
  const doneUploads = createMemo(() => filterUploads("done"));

  function createUploads(files: FileList | null) {
    if (!files) return;
    const newUploads = [...files].map((file) => {
      const upload = new Upload(file);

      upload.onCancel.push(() => {
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
    <main>
      <PageTitle>Upload video's</PageTitle>
      <CardHeader>
        <CardTitle class="text-2xl">{pageTitle()}</CardTitle>
      </CardHeader>
      <CardContent class="flex flex-col items-start gap-4">
        <Card class="relative h-52 w-72 flex flex-col justify-center items-center gap-2">
          <Button variant="secondary">Upload Videos</Button>
          <p class="text-muted-foreground text-sm">of drop ze hier</p>
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

        <UploadList list={uploads()} title="Nieuwe uploads" />
        {/* <UploadList list={busyUploads()} title="Bezig met uploaden" /> */}
        {/* <UploadList list={doneUploads()} title="Klaar" /> */}
      </CardContent>
    </main>
  );
}

function UploadList(props: { list: Upload[]; title: string }) {
  return (
    <Show when={props.list.length}>
      <Separator />
      <p class="text-muted-foreground text-sm">{props.title}</p>
      <For each={props.list}>{(u) => <UploadDetails upload={u} />}</For>
    </Show>
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
      <p>{upload.data.title}</p>

      <Show when={upload.state.error}>
        <p class="text-red-400">{upload.state.error}</p>
      </Show>

      <Show when={!upload.state.error && upload.state.status !== "done"}>
        <div class="flex justify-between text-muted-foreground text-sm mb-2">
          <p>{bytesToSize(upload.file.size)}</p>
          <div class="flex gap-2 items-center">
            <Show when={upload.state.status == "done"}>
              <p>Klaar!</p>
            </Show>
            <Show when={upload.state.status == "cancelled"}>
              <p>Geannulleerd</p>
            </Show>
            <Show when={upload.state.status == "uploading"}>
              <p>{upload.state.progress.toFixed(1)}%</p>
            </Show>

            <Button
              variant="outline"
              class="py-[0.1rem] h-fit"
              onClick={() => upload.cancel()}
            >
              Annuleren
            </Button>
            <VideoSheet upload={upload} />
          </div>
        </div>

        <Show when={upload.state.status == "uploading"}>
          <div class="w-full bg-secondary rounded">
            <div
              class="relative h-[2px] bg-foreground/40 rounded"
              style={`width: ${upload.state.progress}%;`}
            >
              <div
                class="absolute inset-0 rounded animate-gradient-pulse"
                style="background: linear-gradient(to right, transparent 25%, white 65%, transparent 75%); background-size: 400% 400%;"
              ></div>
            </div>
          </div>
        </Show>
      </Show>
    </div>
  );
}

function VideoSheet({ upload }: { upload: Upload }) {
  const [open, setOpen] = createSignal(false);

  const saveVideo = action(async (data: FormData) => {
    if (!data.get("title")) return;

    upload.setData("title", String(data.get("title")));
    upload.setData("description", String(data.get("description")));
    upload.setData("prompt_hint", String(data.get("hint")));

    upload.save();
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
            <TextField name="title" value={upload.data.title ?? ""}></TextField>
          </TextFieldRoot>
          <Separator />
          <p class="text-sm text-muted-foreground">
            ChatGPT genereert een beschrijving op basis van de video
            transcriptie.
          </p>
          <Switch
            name="generateDescription"
            class="flex items-center space-x-2"
            checked={upload.data.generate_description ?? true}
            onChange={(val) => upload.setData("generate_description", val)}
          >
            <SwitchControl>
              <SwitchThumb />
            </SwitchControl>
            <SwitchLabel class="text-sm">
              Beschrijving genereren met ChatGPT
            </SwitchLabel>
          </Switch>

          <Show when={upload.data.generate_description}>
            <TextFieldRoot>
              <TextFieldLabel>Hint voor ChatGPT</TextFieldLabel>
              <TextArea
                autoResize
                name="hint"
                value={upload.data.prompt_hint ?? ""}
              />
            </TextFieldRoot>
          </Show>
          <Show when={!upload.data.generate_description}>
            <TextFieldRoot>
              <TextFieldLabel>Beschrijving</TextFieldLabel>
              <TextArea
                autoResize
                name="description"
                value={upload.data.description ?? ""}
              />
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
