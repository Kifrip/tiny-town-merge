// Visual coordinates only: saved plot indexes and neighborhood adjacency stay fixed.
export const PLOT_SIZE = 100;
export const PLOT_STEP = 112;
export const WORLD_SIZE = 5 * PLOT_STEP - (PLOT_STEP - PLOT_SIZE);

export function fitBoardCamera(plots: number[], width: number, height: number) {
  const columns = plots.map((index) => index % 5);
  const rows = plots.map((index) => Math.floor(index / 5));
  const minColumn = Math.min(...columns);
  const minRow = Math.min(...rows);
  const columnCount = Math.max(...columns) - minColumn + 1;
  const rowCount = Math.max(...rows) - minRow + 1;
  const boardWidth = (columnCount - 1) * PLOT_STEP + PLOT_SIZE;
  const boardHeight = (rowCount - 1) * PLOT_STEP + PLOT_SIZE;
  // Leave headroom for tall roofs, merge particles and the raised plot edges.
  const top = 25,
    bottom = 14,
    horizontal = 6;
  const scale = Math.max(
    0,
    Math.min(
      width / (boardWidth + horizontal * 2),
      height / (boardHeight + top + bottom),
    ),
  );
  return {
    scale,
    columns: columnCount,
    rows: rowCount,
    x: (width - boardWidth * scale) / 2 - minColumn * PLOT_STEP * scale,
    y:
      (height - (boardHeight + top + bottom) * scale) / 2 +
      top * scale -
      minRow * PLOT_STEP * scale,
  };
}
