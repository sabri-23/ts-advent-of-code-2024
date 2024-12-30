import { from, Observable } from 'rxjs';
import { filter, map, mergeMap, tap, toArray } from 'rxjs/operators';
import * as fs from 'fs';

// Define interfaces for Schematic
interface Schematic {
  type: 'lock' | 'key';
  grid: string[];
  heights: number[];
}

// Function to parse the input string into an array of Schematic objects
function parseInput(input: string): Schematic[] {
  const schematics = input
    .trim()
    .split('\n\n')
    .map((s) => s.split('\n').filter((line) => line.trim() !== ''));

  if (schematics.length === 0) return [];

  const parsedSchematics: Schematic[] = schematics.map((grid) => {
    const firstRow = grid[0];
    const lastRow = grid[grid.length - 1];
    let type: 'lock' | 'key';

    if (/^#+$/.test(firstRow) && /^\.+$/.test(lastRow)) {
      type = 'lock';
    } else if (/^\.+$/.test(firstRow) && /^#+$/.test(lastRow)) {
      type = 'key';
    } else {
      throw new Error('Invalid schematic type based on first and last rows.');
    }

    const numCols = firstRow.length;
    const heights: number[] = [];

    if (type === 'lock') {
      for (let c = 0; c < numCols; c++) {
        let count = 0;
        for (let r = 1; r < grid.length - 1; r++) {
          // Exclude first and last rows
          if (grid[r][c] === '#') {
            count++;
          } else {
            break;
          }
        }
        heights.push(count);
      }
    } else {
      // key
      for (let c = 0; c < numCols; c++) {
        let count = 0;
        for (let r = grid.length - 2; r >= 0; r--) {
          // Exclude last row
          if (grid[r][c] === '#') {
            count++;
          } else {
            break;
          }
        }
        heights.push(count);
      }
    }

    return { type, grid, heights };
  });

  return parsedSchematics;
}

// Function to count valid lock/key pairs based on a condition
function countValidPairs(schematics: Schematic[]): number {
  if (schematics.length === 0) return 0;

  const availableSpace = schematics[0].grid.length - 2;

  const locks = schematics
    .filter((s) => s.type === 'lock')
    .map((s) => s.heights);
  const keys = schematics.filter((s) => s.type === 'key').map((s) => s.heights);

  let count = 0;

  from(locks)
    .pipe(
      mergeMap((lock) =>
        from(keys).pipe(
          filter((key) =>
            lock.every(
              (lockHeight, idx) => lockHeight + key[idx] <= availableSpace
            )
          )
        )
      ),
      toArray()
    )
    .subscribe((validPairs) => {
      count = validPairs.length;
    });

  return count;
}

// Part 1 Function: Count valid lock/key pairs based on initial condition
export function part1(
  filePath = 'day-25/src/lib/input.txt'
): Observable<number> {
  return from(fs.promises.readFile(filePath, { encoding: 'utf-8' })).pipe(
    map((content) => parseInput(content)),
    map((schematics) => countValidPairs(schematics)),
    tap((validPairCount) => {
      console.log(`Number of valid lock/key pairs (Part 1): `, validPairCount);
    })
  );
}
