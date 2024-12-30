import { readFile } from 'fs';
import { Observable, of, from } from 'rxjs';
import { expand, map, mergeMap, reduce, takeWhile, tap } from 'rxjs/operators';

// Function to read file as Observable<string>
function readFileObservable(filePath: string): Observable<string> {
  return new Observable<string>((subscriber) => {
    readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        subscriber.error(err);
      } else {
        subscriber.next(data);
        subscriber.complete();
      }
    });
  });
}

// Blink function: transforms an array of stones according to the rules
function blink(stones: number[]): number[] {
  const newStones: number[] = [];

  stones.forEach((stone) => {
    if (stone === 0) {
      // Rule 1
      newStones.push(1);
    } else {
      const numStr = stone.toString();
      if (numStr.length % 2 === 0) {
        // Rule 2
        const half = numStr.length / 2;
        const leftStr = numStr.substring(0, half);
        const rightStr = numStr.substring(half);
        const leftNum = parseInt(leftStr, 10);
        const rightNum = parseInt(rightStr, 10);
        newStones.push(leftNum);
        newStones.push(rightNum);
      } else {
        // Rule 3
        newStones.push(stone * 2024);
      }
    }
  });

  return newStones;
}

export function part1(filePath: string): Observable<number> {
  return readFileObservable(filePath).pipe(
    // Parse the input into an array of numbers
    map((data) =>
      data
        .trim()
        .split(/\s+/)
        .map((numStr) => parseInt(numStr, 10))
    ),
    // Start the blinking process
    mergeMap((initialStones) =>
      of(initialStones).pipe(
        // Use expand to recursively apply blink
        expand((currentStones, iteration) => {
          if (iteration >= 25) {
            // If we've reached 25 iterations, don't emit further
            return of();
          }
          const nextStones = blink(currentStones);
          return of(nextStones);
        }),
        // Take only the first 26 emissions (initial + 25 blinks)
        takeWhile((_, index) => index < 25, true),
        // The last emitted value will be after 25 blinks
        reduce((acc, curr) => curr, initialStones),
        map((finalStones) => finalStones.length),
        tap((finalCount) =>
          console.log(`Number of stones after 25 blinks: `, finalCount)
        )
      )
    )
  );
}

// Memoization map for part 2
const memo = new Map<string, Map<number, bigint>>();

/**
 * Count how many stones result from starting with `stone` after `steps` blinks.
 */
function countStonesAfter(stone: string, steps: number): bigint {
  if (steps === 0) {
    return 1n; // No more transformations, this stone counts as one.
  }

  // Check memo
  let innerMap = memo.get(stone);
  if (innerMap && innerMap.has(steps)) {
    return innerMap.get(steps)!;
  }

  // Prepare to store result later
  if (!innerMap) {
    innerMap = new Map();
    memo.set(stone, innerMap);
  }

  let result: bigint;

  if (stone === '0') {
    // Rule 1: 0 -> 1
    result = countStonesAfter('1', steps - 1);
  } else {
    const length = stone.length;
    if (length % 2 === 0) {
      // Even length: split into two stones
      const half = length / 2;
      const leftHalf = stone.slice(0, half);
      const rightHalf = stone.slice(half);

      // Remove leading zeros by parseInt and toString
      const leftNum = parseInt(leftHalf, 10).toString();
      const rightNum = parseInt(rightHalf, 10).toString();

      result =
        countStonesAfter(leftNum, steps - 1) +
        countStonesAfter(rightNum, steps - 1);
    } else {
      // Odd length (not zero): multiply by 2024
      const oldVal = BigInt(stone);
      const newVal = oldVal * 2024n;
      const newStone = newVal.toString();
      result = countStonesAfter(newStone, steps - 1);
    }
  }

  innerMap.set(steps, result);
  return result;
}

export function part2(
  filePath = 'day-11/src/lib/input.txt',
  totalBlinks = 75
): Observable<bigint> {
  return readFileObservable(filePath).pipe(
    map((input) => input.trim().split(/\s+/)),
    mergeMap((initialStones) =>
      from(initialStones).pipe(
        map((stone) => countStonesAfter(stone, totalBlinks)),
        reduce((acc, count) => acc + count, 0n),
        tap((total) =>
          console.log(
            `Total number of stones after ${totalBlinks} blinks: `,
            total
          )
        )
      )
    )
  );
}
