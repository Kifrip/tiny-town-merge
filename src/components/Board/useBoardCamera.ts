import { useLayoutEffect, useRef, useState } from "react";
import { fitBoardCamera } from "./camera";

export function useBoardCamera(plots: number[], city: string) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const measure = () => {
      const { width, height } = viewport.getBoundingClientRect();
      setSize((old) =>
        old.width === width && old.height === height ? old : { width, height },
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [city]);
  return {
    viewportRef,
    ready: size.width > 0,
    ...fitBoardCamera(plots, size.width, size.height),
  };
}
