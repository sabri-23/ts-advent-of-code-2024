import { from, bindNodeCallback } from 'rxjs';
import { map, switchMap, reduce, tap } from 'rxjs/operators';
import { readFile } from 'fs';

// Bind fs.readFile to return an observable
const readFileObservable = bindNodeCallback(readFile);

export function part1(filePath = 'day-10/src/lib/input.txt') {
  return readFileObservable(filePath).pipe(
    map((input) => parseInput(input.toString())), // Parse the input into a 2D array
    switchMap((grid) =>
      from(findTrailheads(grid)).pipe(
        map((trailhead) => calculateScore(grid, trailhead)), // Calculate score for each trailhead
        reduce((sum, score) => sum + score, 0), // Sum up all the trailhead scores
        tap((result) => console.log('Sum of trailhead scores:', result))
      )
    )
  );
}

// Parse input into a 2D array
function parseInput(input: string): number[][] {
  return input
    .trim()
    .split('\n')
    .map((line) => line.split('').map(Number));
}

// Find all trailheads (positions with height 0)
function findTrailheads(grid: number[][]): [number, number][] {
  const trailheads: [number, number][] = [];
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      if (grid[row][col] === 0) {
        trailheads.push([row, col]);
      }
    }
  }
  return trailheads;
}

// Calculate the score for a given trailhead
function calculateScore(grid: number[][], trailhead: [number, number]): number {
  const [startRow, startCol] = trailhead;
  const visited = new Set<string>();
  const stack: [number, number, number][] = [[startRow, startCol, 0]];
  let score = 0;

  while (stack.length > 0) {
    const [row, col, height] = stack.pop()!;
    const key = `${row},${col}`;
    if (visited.has(key) || grid[row]?.[col] !== height) {
      continue;
    }

    visited.add(key);

    if (height === 9) {
      score += 1;
      continue;
    }

    // Add neighbors to the stack
    for (const [dr, dc] of [
      [-1, 0], // up
      [1, 0], // down
      [0, -1], // left
      [0, 1], // right
    ]) {
      stack.push([row + dr, col + dc, height + 1]);
    }
  }

  return score;
}

export function part2(filePath = 'day-10/src/lib/input.txt') {
  return readFileObservable(filePath).pipe(
    map((input) => parseInput(input.toString())), // Parse the input into a 2D array
    switchMap((grid) =>
      from(findTrailheads(grid)).pipe(
        map((trailhead) => calculateRating(grid, trailhead)), // Calculate rating for each trailhead
        reduce((sum, rating) => sum + rating, 0), // Sum up all the trailhead ratings
        tap((result) => console.log('Sum of trailhead ratings:', result))
      )
    )
  );
}

// Calculate the rating for a given trailhead
function calculateRating(grid: number[][], trailhead: [number, number]): number {
  const [startRow, startCol] = trailhead;
  let rating = 0;

  // Recursive DFS function to explore all valid paths
  function dfs(row: number, col: number, height: number): number {
    // Bounds and height check
    if (
      row < 0 ||
      col < 0 ||
      row >= grid.length ||
      col >= grid[row].length ||
      grid[row][col] !== height
    ) {
      return 0;
    }

    // If we reach height 9, count this path
    if (height === 9) {
      return 1;
    }

    // Temporarily mark the cell to avoid revisits during the current path
    grid[row][col] = -1;

    // Explore all four directions
    const count =
      dfs(row - 1, col, height + 1) +
      dfs(row + 1, col, height + 1) +
      dfs(row, col - 1, height + 1) +
      dfs(row, col + 1, height + 1);

    // Restore the cell value after recursion
    grid[row][col] = height;

    return count;
  }

  // Start DFS from the trailhead
  rating = dfs(startRow, startCol, 0);

  return rating;
}