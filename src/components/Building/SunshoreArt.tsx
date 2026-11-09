import atlas from "../../assets/buildings/sunshore-atlas.png";
import frames from "../../assets/buildings/sunshore-frames.json";
import { AtlasBuildingArt } from "./AtlasBuildingArt";

/** Original uploaded pixels, cropped by the SVG viewport rather than redrawn. */
export function SunshoreArt({
  tier,
  silhouette = false,
}: {
  tier: number;
  silhouette?: boolean;
}) {
  return (
    <AtlasBuildingArt
      city="sunshore"
      tier={tier}
      atlas={atlas}
      frame={frames[tier - 1]}
      silhouette={silhouette}
    />
  );
}
