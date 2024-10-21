import { createSignal } from "solid-js/types/server/reactive.js";

function route<T extends Object | Promise<Object>>(props: {
  title: string;
  load: () => T;
  render: (context: { onMount: Function; data: T; isClient: boolean }) => any;
  type?: "dynamic" | "static";
}) {
  return props.render;
}

type Render<T extends Object | Promise<Object>> = (context: {
  onMount: Function;
  data: T;
  isClient: boolean;
}) => any;

class Route<T extends Object | Promise<Object>> {
  render: Render<T>;
  constructor(props: {
    title: string;
    load: () => T;
    render: Render<T>;
    type?: "dynamic" | "static";
  }) {
    this.render = props.render;
  }
}

function reactive<T extends { [key: string]: any }>(object: T) {
  //create a proxy that will trigger updates when the state is changed

  return object;
}

const count = reactive({
  value: 0,
  double: () => count.value * 2,
  increment: () => {
    count.value++;
  },
});

count.double();

const testRoute = new Route({
  title: "Test",
  type: "dynamic",

  async load() {
    const data = (await new Promise((resolve) => {
      setTimeout(() => {
        resolve({ test: "Hello World!" });
      }, 1000);
    })) as { test: string };
    return data;
  },

  render({ data, onMount }) {
    const [thing, setThing] = createSignal("hi");
    data.then(({ test }) => setThing(test));

    onMount(() => {
      console.log("Mounted!");
    });

    const test = (<div>hi</div>) as HTMLDivElement;

    return <div>{thing()}</div>;
  },
});
