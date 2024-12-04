import { from, map, tap, reduce } from 'rxjs';
import { input1 } from './input-part-1';

part1();
console.log('\n\n')
part2();

export function part1() {
  const input: number[][] = input1;
  const milestones = [0.25, 0.5, 0.75, 1].map((fraction) =>
    Math.floor(input.length * fraction)
  );

  const isSafeArray = (array: number[]): boolean => {
    if (array.length < 2) return false;

    // Compute differences between consecutive elements
    const diffs = array.slice(1).map((val, i) => val - array[i]);

    // Check for invalid differences
    if (diffs.some((diff) => diff === 0 || diff < -3 || diff > 3)) return false;

    // Determine the trend (increasing or decreasing)
    const trend = diffs[0] > 0 ? 'increasing' : 'decreasing';

    // Check if the trend is consistent
    return diffs.every((diff) =>
      trend === 'increasing' ? diff > 0 : diff < 0
    );
  };
  console.log('========== PART 1 ==========');

  console.log(
    `[INFO] Starting analysis of Red-Nosed reactor reports. Total reports to process: ${input.length}.`
  );
  console.log(`[INFO] Reactor safety milestones: ${milestones.join(', ')}`);

  from(input)
    .pipe(
      map((array, index) => ({ index, array, safe: isSafeArray(array) })),
      reduce(
        (acc, { safe, index }) => {
          if (safe) acc.safeCount++;
          acc.totalCount++;

          if (milestones.includes(index)) {
            console.log(
              `[LOG] ${Math.floor(
                (index / input.length) * 100
              )}% milestone reached. Reports processed: ${index}. Safe reports: ${
                acc.safeCount
              }, Unsafe reports: ${index - acc.safeCount}.`
            );
          }
          if (index === Math.floor(input.length * 0.5)) {
            console.log(
              `[LOG] The engineers cheer as the analysis hits the halfway mark.`
            );
          }

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
    .subscribe({
      error: (err) => {
        console.error(
          `[ERROR] Analysis failed due to an error: ${err.message}`
        );
        console.error(`[ERROR] Details: ${err.stack}`);
      },
      complete: () => {
        console.log(`[INFO] "Outstanding work!" exclaims the Chief Engineer.`);
        console.log('============================');
      },
    });
}

export function part2() {
  const input: number[][] = input1;
  const milestones = [0.25, 0.5, 0.75, 1].map((fraction) =>
    Math.floor(input.length * fraction)
  );

  const isSafeArray = (array: number[]): boolean => {
    if (array.length < 2) return false;

    // Compute differences between consecutive elements
    const diffs = array.slice(1).map((val, i) => val - array[i]);

    // Check for invalid differences
    if (diffs.some((diff) => diff === 0 || diff < -3 || diff > 3)) return false;

    // Determine the trend (increasing or decreasing)
    const trend = diffs[0] > 0 ? 'increasing' : 'decreasing';

    // Check if the trend is consistent
    return diffs.every((diff) =>
      trend === 'increasing' ? diff > 0 : diff < 0
    );
  };

  const isSafeWithDampener = (array: number[]): boolean => {
    if (isSafeArray(array)) {
      return true;
    }

    // Test removing each level to see if it becomes safe
    for (let i = 0; i < array.length; i++) {
      const modifiedArray = [...array.slice(0, i), ...array.slice(i + 1)];
      if (isSafeArray(modifiedArray)) {
        return true;
      }
    }

    return false;
  };

  console.log('========== PART 2: ANALYSIS WITH PROBLEM DAMPENER ==========');
  console.log(
    `[INFO] Starting analysis with Problem Dampener enabled. Total reports to process: ${input.length}.`
  );

  console.log(`[INFO] Reactor safety milestones: ${milestones.join(', ')}`);

  from(input)
    .pipe(
      map((array, index) => ({
        index,
        array,
        safe: isSafeWithDampener(array),
      })),
      reduce(
        (acc, { safe, index, array }) => {
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
    .subscribe({
      error: (err) => {
        console.error(
          `[ERROR] Analysis failed due to an error: ${err.message}`
        );
        console.error(`[ERROR] Details: ${err.stack}`);
      },
      complete: () => {
        console.log(`[INFO] "Outstanding work!" exclaims the Chief Engineer.`);
        console.log('============================');
      },
    });
}
