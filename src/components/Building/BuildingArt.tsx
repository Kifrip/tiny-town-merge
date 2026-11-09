import type { CityId } from "../../game/types";
import { MeadowvilleArt } from "./MeadowvilleArt";
import { SunshoreArt } from "./SunshoreArt";
export function BuildingArt({
  tier,
  city = "meadowville",
  silhouette = false,
}: {
  tier: number;
  city?: CityId;
  silhouette?: boolean;
}) {
  return city === "meadowville" ? (
    <MeadowvilleArt tier={tier} silhouette={silhouette} />
  ) : (
    <SunshoreArt tier={tier} silhouette={silhouette} />
  );
}
