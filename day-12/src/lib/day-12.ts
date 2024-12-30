import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import * as fs from 'fs';
import * as readline from 'readline';

interface Region {
  plant: string;
  cells: Set<string>;
  area: number;
  perimeter: number;
  sides: number;
}

/**
 * Reads the garden map from the specified file and emits it as a 2D grid.
 * @param filePath Path to the input file.
 * @returns Observable emitting the 2D grid of plant types.
 */
function readGridFromFile(filePath: string): Observable<string[][]> {
  return new Observable<string[][]>((subscriber) => {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    const lines: string[] = [];
    rl.on('line', (line) => lines.push(line.trim()));
    rl.on('close', () => {
      const grid: string[][] = lines.map((line) => line.split(''));
      subscriber.next(grid);
      subscriber.complete();
    });
    rl.on('error', (err) => subscriber.error(err));
  });
}

/**
 * Finds all regions in the grid using BFS.
 * @param grid 2D array representing the garden map.
 * @returns Array of Region objects with plant type, cells, and area.
 */
function findRegions(grid: string[][]): Region[] {
  const numRows = grid.length;
  const numCols = grid[0]?.length || 0;
  const visited: boolean[][] = Array.from({ length: numRows }, () =>
    Array(numCols).fill(false)
  );
  const regions: Region[] = [];
  const directions = [
    [0, 1], // Right
    [1, 0], // Down
    [0, -1], // Left
    [-1, 0], // Up
  ];

  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      if (!visited[row][col]) {
        const plantType = grid[row][col];
        const queue: [number, number][] = [[row, col]];
        visited[row][col] = true;
        const cells: Set<string> = new Set([`${row},${col}`]);
        let area = 0;

        while (queue.length > 0) {
          const [currentRow, currentCol] = queue.shift()!;
          area += 1;

          for (const [dRow, dCol] of directions) {
            const newRow = currentRow + dRow;
            const newCol = currentCol + dCol;

            if (
              newRow >= 0 &&
              newRow < numRows &&
              newCol >= 0 &&
              newCol < numCols
            ) {
              if (
                !visited[newRow][newCol] &&
                grid[newRow][newCol] === plantType
              ) {
                visited[newRow][newCol] = true;
                queue.push([newRow, newCol]);
                cells.add(`${newRow},${newCol}`);
              }
            }
          }
        }

        regions.push({
          plant: plantType,
          cells,
          area,
          perimeter: 0, // To be calculated later
          sides: 0, // To be calculated later
        });
      }
    }
  }

  return regions;
}

/**
 * Calculates the perimeter for each region.
 * @param grid 2D array representing the garden map.
 * @param regions Array of Region objects.
 */
function calculatePerimeter(grid: string[][], regions: Region[]): void {
  const numRows = grid.length;
  const numCols = grid[0]?.length || 0;
  const directions = [
    [0, 1], // Right
    [1, 0], // Down
    [0, -1], // Left
    [-1, 0], // Up
  ];

  regions.forEach((region) => {
    let perimeter = 0;
    region.cells.forEach((cell) => {
      const [row, col] = cell.split(',').map(Number);
      directions.forEach(([dRow, dCol]) => {
        const newRow = row + dRow;
        const newCol = col + dCol;
        if (
          newRow < 0 ||
          newRow >= numRows ||
          newCol < 0 ||
          newCol >= numCols ||
          grid[newRow][newCol] !== region.plant
        ) {
          perimeter += 1;
        }
      });
    });
    region.perimeter = perimeter;
  });
}

/**
 * Calculates the number of sides for each region based on the perimeter.
 * A side is a continuous horizontal or vertical fence segment.
 * @param grid 2D array representing the garden map.
 * @param regions Array of Region objects.
 */
function calculateSides(grid: string[][], regions: Region[]): void {
  const numRows = grid.length;
  const numCols = grid[0]?.length || 0;

  regions.forEach((region) => {
    const perimeterCells: Set<string> = new Set();
    // Identify all perimeter cells with specific sides
    region.cells.forEach((cell) => {
      const [row, col] = cell.split(',').map(Number);
      // Check all four directions and add corresponding sides
      if (row === 0 || grid[row - 1][col] !== region.plant)
        perimeterCells.add(`${row},${col}-top`);
      if (row === numRows - 1 || grid[row + 1][col] !== region.plant)
        perimeterCells.add(`${row},${col}-bottom`);
      if (col === 0 || grid[row][col - 1] !== region.plant)
        perimeterCells.add(`${row},${col}-left`);
      if (col === numCols - 1 || grid[row][col + 1] !== region.plant)
        perimeterCells.add(`${row},${col}-right`);
    });

    // Function to detect continuous segments for a specific side
    const detectContinuousSegments = (
      side: 'top' | 'bottom' | 'left' | 'right'
    ): number => {
      let segments = 0;
      if (side === 'top' || side === 'bottom') {
        // Horizontal sides
        for (let row = 0; row < numRows; row++) {
          let inSegment = false;
          for (let col = 0; col < numCols; col++) {
            const key =
              side === 'top' ? `${row},${col}-top` : `${row},${col}-bottom`;
            if (perimeterCells.has(key)) {
              if (!inSegment) {
                segments += 1;
                inSegment = true;
              }
            } else {
              inSegment = false;
            }
          }
        }
      } else {
        // Vertical sides
        for (let col = 0; col < numCols; col++) {
          let inSegment = false;
          for (let row = 0; row < numRows; row++) {
            const key =
              side === 'left' ? `${row},${col}-left` : `${row},${col}-right`;
            if (perimeterCells.has(key)) {
              if (!inSegment) {
                segments += 1;
                inSegment = true;
              }
            } else {
              inSegment = false;
            }
          }
        }
      }
      return segments;
    };

    // Calculate segments for each side
    const topSegments = detectContinuousSegments('top');
    const bottomSegments = detectContinuousSegments('bottom');
    const leftSegments = detectContinuousSegments('left');
    const rightSegments = detectContinuousSegments('right');

    // Total sides is the sum of all segments
    region.sides = topSegments + bottomSegments + leftSegments + rightSegments;
  });
}

/**
 * Calculates the total fencing cost for Part 1.
 * @param filePath Path to the input file.
 * @returns Observable emitting the total fencing cost.
 */
export function part1(
  filePath = 'day-12/src/lib/input.txt'
): Observable<number> {
  return readGridFromFile(filePath).pipe(
    map((grid) => {
      const regions = findRegions(grid);
      calculatePerimeter(grid, regions);
      // Total cost is the sum of (area * perimeter) for all regions
      return regions.reduce(
        (total, region) => total + region.area * region.perimeter,
        0
      );
    }),
    catchError((err) => {
      console.error('Error in Part 1:', err);
      return of(0);
    }),
    tap((totalCost) => console.log(`Total fencing cost: `, totalCost))
  );
}

/**
 * Calculates the total fencing cost for Part 2.
 * @param filePath Path to the input file.
 * @returns Observable emitting the total fencing cost.
 */
export function part2(
  filePath = 'day-12/src/lib/input.txt'
): Observable<number> {
  return readGridFromFile(filePath).pipe(
    map((grid) => {
      const regions = findRegions(grid);
      calculatePerimeter(grid, regions);
      calculateSides(grid, regions);
      // Total cost is the sum of (area * sides) for all regions
      return regions.reduce(
        (total, region) => total + region.area * region.sides,
        0
      );
    }),
    catchError((err) => {
      console.error('Error in Part 2:', err);
      return of(0);
    }),
    tap((totalCost) => console.log(`Total fencing cost: `, totalCost))
  );
}