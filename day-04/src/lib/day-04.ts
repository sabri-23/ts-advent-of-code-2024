import { from, concatMap, of, map, filter, reduce, tap } from 'rxjs';
import * as fs from 'fs';

export function part1(filePath = 'day-04/src/lib/input.txt') {
  const input = fs.readFileSync(filePath, 'utf8');

  const grid = input.split('\n').map((line) => line.split(''));

  const numRows = grid.length;
  const numCols = grid[0].length;
  const target = 'XMAS';
  const targetLength = target.length;

  // Define all eight directions
  const directions = [
    { row: 0, col: 1 },
    { row: 0, col: -1 },
    { row: 1, col: 0 },
    { row: -1, col: 0 },
    { row: 1, col: 1 },
    { row: 1, col: -1 },
    { row: -1, col: 1 },
    { row: -1, col: -1 },
  ];

  console.log('========== Day 4: Ceres Search ==========');
  console.log('[INFO] Starting search for XMAS in the word search.');

  return from(grid).pipe(
    // Emit each cell's coordinates
    concatMap((_, rowIndex) =>
      of(...Array(numCols).keys()).pipe(
        map((colIndex) => ({ rowIndex, colIndex }))
      )
    ),
    // Check each cell for all directions
    concatMap(({ rowIndex, colIndex }, index) =>
      from(directions).pipe(
        map((direction) => ({
          index: index + 1, // 1-based index for better milestone tracking
          rowIndex,
          colIndex,
          direction,
          found: (() => {
            let word = '';
            for (let i = 0; i < targetLength; i++) {
              const newRow = rowIndex + i * direction.row;
              const newCol = colIndex + i * direction.col;

              if (
                newRow < 0 ||
                newRow >= numRows ||
                newCol < 0 ||
                newCol >= numCols
              ) {
                return false;
              }

              word += grid[newRow][newCol];
            }

            return word === target;
          })(),
        }))
      )
    ),
    filter(({ found }) => found),
    reduce((acc) => acc + 1, 0),
    tap((total) => console.log(`[INFO] Total XMAS occurrences: ${total}`))
  );
}//2685

export function part2(filePath = 'day-04/src/lib/input.txt') {
  const input = fs.readFileSync(filePath, 'utf8');

  const grid = input.split('\n').map((line) => line.split(''));
  const numRows = grid.length;
  const numCols = grid[0].length;

  console.log('========== Part 2: X-MAS Puzzle ==========');
  console.log('[INFO] Searching for X-MAS patterns.');

 return from(grid)
    .pipe(
      // Emit each cell's coordinates
      concatMap((_, rowIndex) =>
        of(...Array(numCols).keys()).pipe(
          map((colIndex) => ({ rowIndex, colIndex }))
        )
      ),
      // Check if the cell is the center of a valid X-MAS pattern
      map(({ rowIndex, colIndex }) => ({
        rowIndex,
        colIndex,
        isValid: (() => {
          const positions = [
            { row: rowIndex - 1, col: colIndex - 1 }, // Top-left
            { row: rowIndex, col: colIndex }, // Center
            { row: rowIndex + 1, col: colIndex + 1 }, // Bottom-right
            { row: rowIndex - 1, col: colIndex + 1 }, // Top-right
            { row: rowIndex + 1, col: colIndex - 1 }, // Bottom-left
          ];

          // Check bounds for all positions
          if (
            positions.some(
              ({ row, col }) =>
                row < 0 || row >= numRows || col < 0 || col >= numCols
            )
          ) {
            return false;
          }

          // Extract values at the required positions
          const diagonalMAS = `${grid[positions[0].row][positions[0].col]}${
            grid[positions[1].row][positions[1].col]
          }${grid[positions[2].row][positions[2].col]}`;
          const antiDiagonalMAS = `${grid[positions[3].row][positions[3].col]}${
            grid[positions[1].row][positions[1].col]
          }${grid[positions[4].row][positions[4].col]}`;

          // Check for MAS in forward or backward order
          const masPatterns = ['MAS', 'SAM'];
          return (
            masPatterns.includes(diagonalMAS) &&
            masPatterns.includes(antiDiagonalMAS)
          );
        })(),
      })),
      // Filter only valid X-MAS patterns
      filter(({ isValid }) => isValid),
      // Reduce to accumulate results (for final count logging)
      reduce((acc) => acc + 1, 0),
      tap((total) => console.log(`[INFO] Total X-MAS patterns found: ${total}`))
    )
}//2048
