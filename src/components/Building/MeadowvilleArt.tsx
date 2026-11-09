import atlas from "../../assets/buildings/meadowville-atlas.png";
import frames from "../../assets/buildings/meadowville-frames.json";
import atlasSize from "../../assets/buildings/meadowville-atlas-size.json";
import { AtlasBuildingArt } from "./AtlasBuildingArt";

/** Cleaned user-approved progression, isolated with transparent frame padding. */
export function MeadowvilleArt({
  tier,
  silhouette = false,
}: {
  tier: number;
  silhouette?: boolean;
}) {
  return (
    <AtlasBuildingArt
      city="meadowville"
      tier={tier}
      atlas={atlas}
      atlasSize={atlasSize}
      frame={frames[tier - 1]}
      silhouette={silhouette}
    />
  );
}
