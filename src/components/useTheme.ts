import { useEffect, useLayoutEffect, useState } from "react";
import type { CityId, ThemePreference } from "../game/types";

export function useTheme(preference: ThemePreference, city: CityId) {
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
  );
  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setSystemDark(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  const theme =
    preference === "system" ? (systemDark ? "dark" : "light") : preference;
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute(
        "content",
        theme === "dark"
          ? city === "sunshore"
            ? "#142b38"
            : "#142b25"
          : city === "sunshore"
            ? "#e8dbb6"
            : "#dce9c8",
      );
  }, [theme, city]);
  return theme;
}
