declare module "solid-js" {
  namespace JSX {
    interface Directives {
      inView: boolean;
    }
  }
}

let observer: IntersectionObserver | null = null;

const enterView = new Event("enterView");
const leaveView = new Event("leaveView");

function handleIntersect(entries: IntersectionObserverEntry[]) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("in-view");
      entry.target.dispatchEvent(enterView);
    } else {
      entry.target.dispatchEvent(leaveView);
    }
  });
}

export default function inView(element: HTMLElement) {
  if (!observer) {
    observer = new IntersectionObserver(handleIntersect, {
      root: null,
      rootMargin: "-100px",
      threshold: 0,
    });
  }

  observer.observe(element);
}
