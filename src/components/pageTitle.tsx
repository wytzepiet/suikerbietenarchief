import { Title } from "@solidjs/meta";

interface Props {
  children: string;
}
export default function PageTitle(props: Props) {
  return <Title>{props.children} | Suikerbietenarchief</Title>;
}
