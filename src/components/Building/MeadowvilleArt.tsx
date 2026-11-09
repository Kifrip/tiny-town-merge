import atlas from "../../assets/buildings/meadowville-atlas.png";
import frames from "../../assets/buildings/meadowville-frames.json";

/** Original uploaded pixels, cropped by the SVG viewport rather than redrawn. */
export function MeadowvilleArt({
  tier,
  silhouette = false,
}: {
  tier: number;
  silhouette?: boolean;
}) {
  const frame = frames[tier - 1];
  return (
    <svg
      className={`building-art meadowville-sprite ${silhouette ? "silhouette" : ""}`}
      data-art={`meadowville-${tier}`}
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
        <image href={atlas} width="1024" height="1024" />
      </svg>
    </svg>
  );
}
