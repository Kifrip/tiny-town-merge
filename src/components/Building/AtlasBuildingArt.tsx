import { useId } from "react";
import type { CityId } from "../../game/types";

type Frame = { x: number; y: number; width: number; height: number };

export function AtlasBuildingArt({
  city,
  tier,
  atlas,
  frame,
  atlasSize = { width: 1024, height: 1024 },
  silhouette = false,
}: {
  city: CityId;
  tier: number;
  atlas: string;
  frame: Frame;
  atlasSize?: { width: number; height: number };
  silhouette?: boolean;
}) {
  const clipId = useId();
  return (
    <svg
      className={`building-art ${city}-sprite ${silhouette ? "silhouette" : ""}`}
      data-art={`${city}-${tier}`}
      viewBox="0 0 120 124"
      aria-hidden="true"
    >
      <svg
        x="3"
        y="3"
        width="114"
        height="114"
        viewBox={`${frame.x} ${frame.y} ${frame.width} ${frame.height}`}
        preserveAspectRatio="xMidYMax meet"
        overflow="hidden"
      >
        <defs>
          <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
            <rect {...frame} />
          </clipPath>
        </defs>
        {/* The viewport also includes aspect-ratio padding. Clip the atlas to
            the frame itself so neighboring sprites cannot enter that space. */}
        <image
          href={atlas}
          width={atlasSize.width}
          height={atlasSize.height}
          clipPath={`url(#${clipId})`}
        />
      </svg>
    </svg>
  );
}
