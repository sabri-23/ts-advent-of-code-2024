import { from, map, tap, reduce } from 'rxjs';
import * as fs from 'fs';

export function part1(filePath = 'day-02/src/lib/input.txt') {
  const input: number[][] = fs
    .readFileSync(filePath, 'utf8')
    .trim()
    .split('\n')
    .map((line) => line.split(/\s+/).map(Number));

  console.log(
    `[INFO] Starting analysis of Red-Nosed reactor reports. Total reports to process: ${input.length}.`
  );

  return from(input).pipe(
    map((array) => {
      if (array.length < 2) return false;

      const diffs = array.slice(1).map((val, i) => val - array[i]);
      if (diffs.some((diff) => diff === 0 || diff < -3 || diff > 3))
        return false;

      const trend = diffs[0] > 0 ? 'increasing' : 'decreasing';

      return diffs.every((diff) =>
        trend === 'increasing' ? diff > 0 : diff < 0
      );
    }),
    reduce(
      (acc, safe) => {
        if (safe) acc.safeCount++;
        acc.totalCount++;

        return acc;
      },
      { safeCount: 0, totalCount: 0 }
    ),
    tap(({ safeCount, totalCount }) => {
      console.log(`[INFO] Analysis complete. Reviewing final results...`);
      console.log(`          +++++++++++++++++++++++++++++++
          Final Report:
          - Total reports processed: ${totalCount}
          - Safe reports: ${safeCount}
          - Unsafe reports: ${totalCount - safeCount}
          +++++++++++++++++++++++++++++++`);
    })
  );
}

export function part2(filePath = 'day-02/src/lib/input.txt') {
  const input: number[][] = fs
    .readFileSync(filePath, 'utf8')
    .trim() // Remove any leading/trailing whitespace
    .split('\n') // Split into lines
    .map((line) => line.split(/\s+/).map(Number)); // Split numbers by whitespace and convert to integers

  console.log(
    `[INFO] Starting analysis with Problem Dampener enabled. Total reports to process: ${input.length}.`
  );

  function isSafeArray(arr: number[]) {
    const diffs = arr.slice(1).map((val, i) => val - arr[i]);
    const trend = diffs[0] > 0 ? 'increasing' : 'decreasing';

    if (arr.length < 2) return false;
    else if (diffs.some((diff) => diff === 0 || diff < -3 || diff > 3))
      return false;
    else
      return diffs.every((diff) =>
        trend === 'increasing' ? diff > 0 : diff < 0
      );
  }

  return from(input).pipe(
    map((array) => {
      if (isSafeArray(array)) {
        return true;
      }

      // Removing each element to see if it becomes safe
      for (let i = 0; i < array.length; i++) {
        const modifiedArray = [...array.slice(0, i), ...array.slice(i + 1)];
        if (isSafeArray(modifiedArray)) {
          return true;
        }
      }

      return false;
    }),
    reduce(
      (acc, safe) => {
        if (safe) acc.safeCount++;
        acc.totalCount++;

        return acc;
      },
      { safeCount: 0, totalCount: 0 }
    ),
    tap(({ safeCount, totalCount }) => {
      console.log(`[INFO] Analysis complete. Reviewing final results...`);
      console.log(`        +++++++++++++++++++++++++++++++
        Final Report with Problem Dampener:
        - Total reports processed: ${totalCount}
        - Safe reports: ${safeCount}
        - Unsafe reports: ${totalCount - safeCount}
        +++++++++++++++++++++++++++++++`);
    })
  );
}
