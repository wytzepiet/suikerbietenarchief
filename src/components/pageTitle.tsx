import { Title } from "@solidjs/meta";
import { createSignal } from "solid-js";

interface Props {
  children: string;
}

export let [pageTitle, setPageTitle] = createSignal("Suikerbietenarchief");

export default function PageTitle(props: Props) {
  setPageTitle(props.children);
  return <Title>{props.children} | Suikerbietenarchief</Title>;
}
