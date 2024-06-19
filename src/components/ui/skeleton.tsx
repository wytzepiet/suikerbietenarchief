import { cn } from "@/libs/cn";
import { type ComponentProps, splitProps } from "solid-js";

type Props = ComponentProps<"div"> & { delay?: number };
export const Skeleton = (props: Props) => {
  const [local, rest] = splitProps(props, ["class"]);

  return (
    <div
      class={cn("animate-pulse rounded-md bg-primary/10", local.class)}
      {...rest}
      style={`animation-delay: ${props.delay ?? 0}ms; ${props.style}`}
    />
  );
};
