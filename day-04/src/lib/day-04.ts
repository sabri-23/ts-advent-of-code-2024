import { from, concatMap, of, map, filter, reduce, tap } from 'rxjs';
import { input1 } from './input-part-1';
import { input2 } from './input-part-2';

console.log('========== PART 1 ==========');
part1();
console.log('============================');
console.log('\n\n')
console.log('========== PART 2 ==========');
part2();
console.log('============================');

export function part1() {
  const input = input1;

  const grid = input.split('\n').map((line) => line.split(''));

  const numRows = grid.length;
  const numCols = grid[0].length;
  const target = 'XMAS';
  const targetLength = target.length;

  // Define all eight directions
  const directions = [
    { row: 0, col: 1 }, // Horizontal (right)
    { row: 0, col: -1 }, // Horizontal (left)
    { row: 1, col: 0 }, // Vertical (down)
    { row: -1, col: 0 }, // Vertical (up)
    { row: 1, col: 1 }, // Diagonal (down-right)
    { row: 1, col: -1 }, // Diagonal (down-left)
    { row: -1, col: 1 }, // Diagonal (up-right)
    { row: -1, col: -1 }, // Diagonal (up-left)
  ];

  // Helper to validate and extract word
  const isValidXMAS = (
    startRow: number,
    startCol: number,
    direction: { row: number; col: number }
  ) => {
    let word = '';
    for (let i = 0; i < targetLength; i++) {
      const newRow = startRow + i * direction.row;
      const newCol = startCol + i * direction.col;

      // Check bounds
      if (newRow < 0 || newRow >= numRows || newCol < 0 || newCol >= numCols) {
        return false;
      }

      word += grid[newRow][newCol];
    }
    return word === target;
  };

  const totalCells = numRows * numCols;
  const milestones = [0.25, 0.5, 0.75, 1].map((fraction) =>
    Math.floor(totalCells * fraction)
  );

  console.log('========== Day 4: Ceres Search ==========');
  console.log('[INFO] Starting search for XMAS in the word search.');
  console.log(`[INFO] Milestones set at: ${milestones.join(', ')} cells.`);

  let matchCount = 0;
  let lastLoggedMilestone = 0;

  from(grid)
    .pipe(
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
            found: isValidXMAS(rowIndex, colIndex, direction),
          }))
        )
      ),
      tap(({ index }) => {
        const milestone = milestones.find(
          (m) => m <= index && m > lastLoggedMilestone
        );
        if (milestone) {
          const percent = Math.floor((milestone / totalCells) * 100);
          console.log(`[MILESTONE] ${percent}% processed.`);
          console.log(`[STATS] Matches so far: ${matchCount}`);
          lastLoggedMilestone = milestone;
        }
      }),
      // Filter only valid matches
      filter(({ found }) => found),
      // Count matches
      tap(() => matchCount++),
      // Reduce to accumulate results (for final count logging)
      reduce((acc) => acc + 1, 0)
    )
    .subscribe({
      next: (count) => {
        console.log(`[INFO] Total XMAS occurrences: ${count}`);
      },
      complete: () => {
        console.log(
          `[INFO] Search complete. The Elf is jumping with joy! XMAS appears ${matchCount} times!`
        );
        console.log('========== End of Search ==========');
      },
      error: (err) => {
        console.error(`[ERROR] An error occurred: ${err.message}`);
      },
    });
}


export function part2() {
  const input = input2;

  const grid = input.split('\n').map((line) => line.split(''));
  const numRows = grid.length;
  const numCols = grid[0].length;

  // Helper to validate X-MAS shape
  const isValidXMAS = (centerRow: number, centerCol: number): boolean => {
    const positions = [
      { row: centerRow - 1, col: centerCol - 1 }, // Top-left
      { row: centerRow, col: centerCol }, // Center
      { row: centerRow + 1, col: centerCol + 1 }, // Bottom-right
      { row: centerRow - 1, col: centerCol + 1 }, // Top-right
      { row: centerRow + 1, col: centerCol - 1 }, // Bottom-left
    ];

    // Check bounds for all positions
    if (
      positions.some(
        ({ row, col }) => row < 0 || row >= numRows || col < 0 || col >= numCols
      )
    ) {
      return false;
    }

    // Extract values at the required positions
    const diagonalMAS = `${grid[positions[0].row][positions[0].col]}${grid[positions[1].row][positions[1].col]}${grid[positions[2].row][positions[2].col]}`;
    const antiDiagonalMAS = `${grid[positions[3].row][positions[3].col]}${grid[positions[1].row][positions[1].col]}${grid[positions[4].row][positions[4].col]}`;

    // Check for MAS in forward or backward order
    const masPatterns = ['MAS', 'SAM'];
    return (
      masPatterns.includes(diagonalMAS) &&
      masPatterns.includes(antiDiagonalMAS)
    );
  };

  const totalCells = numRows * numCols;
  const milestones = [0.25, 0.5, 0.75, 1].map((fraction) =>
    Math.floor(totalCells * fraction)
  );

  console.log('========== Part 2: X-MAS Puzzle ==========');
  console.log('[INFO] Searching for X-MAS patterns.');
  console.log(`[INFO] Milestones set at: ${milestones.join(', ')} cells.`);

  let matchCount = 0;
  let lastLoggedMilestone = 0;

  from(grid)
    .pipe(
      // Emit each cell's coordinates
      concatMap((_, rowIndex) =>
        of(...Array(numCols).keys()).pipe(map((colIndex) => ({ rowIndex, colIndex })))
      ),
      // Check if the cell is the center of a valid X-MAS pattern
      map(({ rowIndex, colIndex }) => ({
        rowIndex,
        colIndex,
        isValid: isValidXMAS(rowIndex, colIndex),
      })),
      // Log milestones
      tap(({ rowIndex, colIndex }) => {
        const index = rowIndex * numCols + colIndex + 1;
        const milestone = milestones.find((m) => m <= index && m > lastLoggedMilestone);
        if (milestone) {
          const percent = Math.floor((milestone / totalCells) * 100);
          console.log(`[MILESTONE] ${percent}% processed.`);
          console.log(`[STATS] Matches so far: ${matchCount}`);
          lastLoggedMilestone = milestone;
        }
      }),
      // Filter only valid X-MAS patterns
      filter(({ isValid }) => isValid),
      // Count matches
      tap(() => matchCount++),
      // Reduce to accumulate results (for final count logging)
      reduce((acc) => acc + 1, 0)
    )
    .subscribe({
      next: (count) => {
        console.log(`[INFO] Total X-MAS patterns found: ${count}`);
      },
      complete: () => {
        console.log(`[INFO] Search complete. The Elf is thrilled! X-MAS appears ${matchCount} times!`);
        console.log('========== End of Search ==========');
      },
      error: (err) => {
        console.error(`[ERROR] An error occurred: ${err.message}`);
      },
    });
}