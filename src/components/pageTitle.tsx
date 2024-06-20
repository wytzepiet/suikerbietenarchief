import { Title } from "@solidjs/meta";
import { Accessor, Setter, createRoot, createSignal } from "solid-js";

interface Props {
  children: string;
}

const [pageTitle, setPageTitle] = createSignal("Suikerbietenarchief");

export { pageTitle, setPageTitle };

export default function PageTitle(props: Props) {
  setPageTitle(props.children);
  const children = props.children;

  return <Title>{children} | Suikerbietenarchief</Title>;
}
