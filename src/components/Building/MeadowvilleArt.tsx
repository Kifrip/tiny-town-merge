import atlas from "../../assets/buildings/meadowville-atlas.png";
import frames from "../../assets/buildings/meadowville-frames.json";
import { AtlasBuildingArt } from "./AtlasBuildingArt";

/** Original uploaded pixels, cropped by the SVG viewport rather than redrawn. */
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
      frame={frames[tier - 1]}
      silhouette={silhouette}
    />
  );
}
