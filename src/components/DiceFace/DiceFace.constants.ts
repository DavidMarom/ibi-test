// 3x3 grid, row-major indices 0-8. Standard six-sided die pip layout.
export const PIP_POSITIONS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

export const GRID_CELL_COUNT = 9;
