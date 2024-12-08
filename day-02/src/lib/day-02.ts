import { from, map, tap, reduce } from 'rxjs';
import * as fs from 'fs';

export function part1(filePath = 'day-02/src/lib/input-1.txt') {
  const input: number[][] = fs
    .readFileSync(filePath, 'utf8')
    .trim()
    .split('\n') // Split into lines
    .map((line) => line.split(/\s+/).map(Number));

  const milestones = [0.25, 0.5, 0.75, 1].map((fraction) =>
    Math.floor(input.length * fraction)
  );

  console.log(
    `[INFO] Starting analysis of Red-Nosed reactor reports. Total reports to process: ${input.length}.`
  );
  console.log(`[INFO] Reactor safety milestones: ${milestones.join(', ')}`);

  from(input)
    .pipe(
      map((array, index) => ({
        index,
        array,
        safe: (() => {
          if (array.length < 2) return false;

          const diffs = array.slice(1).map((val, i) => val - array[i]);
          if (diffs.some((diff) => diff === 0 || diff < -3 || diff > 3))
            return false;

          const trend = diffs[0] > 0 ? 'increasing' : 'decreasing';

          return diffs.every((diff) =>
            trend === 'increasing' ? diff > 0 : diff < 0
          );
        })(),
      })),
      reduce(
        (acc, { safe }) => {
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
    )
    .subscribe();
}

export function part2(filePath = 'day-02/src/lib/input-2.txt') {
  const input: number[][] = fs
    .readFileSync(filePath, 'utf8')
    .trim() // Remove any leading/trailing whitespace
    .split('\n') // Split into lines
    .map((line) => line.split(/\s+/).map(Number)); // Split numbers by whitespace and convert to integers

  const milestones = [0.25, 0.5, 0.75, 1].map((fraction) =>
    Math.floor(input.length * fraction)
  );

  console.log(
    `[INFO] Starting analysis with Problem Dampener enabled. Total reports to process: ${input.length}.`
  );

  console.log(`[INFO] Reactor safety milestones: ${milestones.join(', ')}`);

  from(input)
    .pipe(
      map((array, index) => ({
        index,
        array,
        safe: (() => {
          const isSafeArray = (arr: number[]) => {
            if (arr.length < 2) return false;
            const diffs = arr.slice(1).map((val, i) => val - arr[i]);
            if (diffs.some((diff) => diff === 0 || diff < -3 || diff > 3))
              return false;
            const trend = diffs[0] > 0 ? 'increasing' : 'decreasing';
            return diffs.every((diff) =>
              trend === 'increasing' ? diff > 0 : diff < 0
            );
          };

          if (isSafeArray(array)) {
            return true;
          }

          // Test removing each element to see if it becomes safe
          for (let i = 0; i < array.length; i++) {
            const modifiedArray = [...array.slice(0, i), ...array.slice(i + 1)];
            if (isSafeArray(modifiedArray)) {
              return true;
            }
          }

          return false;
        })(),
      })),
      reduce(
        (acc, { safe, index }) => {
          if (safe) {
            acc.safeCount++;
          }
          acc.totalCount++;

          if (milestones.includes(index)) {
            console.log(
              `[MILESTONE] ${Math.floor(
                (index / input.length) * 100
              )}% milestone reached. Reports processed: ${
                index + 1
              }. Safe reports: ${acc.safeCount}, Unsafe reports: ${
                acc.totalCount - acc.safeCount
              }.`
            );
          }

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
    )
    .subscribe();
}
