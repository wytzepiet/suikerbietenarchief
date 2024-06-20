import { Title } from "@solidjs/meta";
import { Accessor, Setter, createRoot, createSignal } from "solid-js";

interface Props {
  children: string;
}

let disposer: () => void;
let pageTitle: Accessor<string>;
let setPageTitle: Setter<string>;

createRoot((dispose) => {
  [pageTitle, setPageTitle] = createSignal("Suikerbietenarchief");
  disposer = dispose;
});

export { pageTitle, setPageTitle, disposer };

export default function PageTitle(props: Props) {
  setPageTitle(props.children);
  return <Title>{props.children} | Suikerbietenarchief</Title>;
}
