import { from, of } from 'rxjs';
import { map, reduce, filter, mergeMap, every } from 'rxjs/operators';
import * as fs from 'fs';

// Define types
type Rule = string;
type Update = number[];


export function part1(filePath = 'day-05/src/lib/input-1.txt') {
  const input = fs.readFileSync(filePath, 'utf8');

  const parseInputString = (
    input: string
  ): { rulesInput: Rule[]; updatesInput: Update[] } => {
    const lines = input
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line);

    const rulesInput: Rule[] = [];
    const updatesInput: Update[] = [];
    let isUpdateSection = false;

    for (const line of lines) {
      if (line.includes('|')) {
        if (!isUpdateSection) {
          rulesInput.push(line);
        }
      } else if (line.includes(',')) {
        isUpdateSection = true;
        const update = line.split(',').map((num) => parseInt(num.trim(), 10));
        updatesInput.push(update);
      }
    }

    return { rulesInput, updatesInput };
  };

  // Parse the input string
  const { rulesInput, updatesInput } = parseInputString(input);

  // Parse rules into a map for quick lookup
  const rulesMap = new Map<number, Set<number>>();
  rulesInput.forEach((rule) => {
    const [a, b] = rule.split('|').map(Number);
    if (!rulesMap.has(a)) rulesMap.set(a, new Set());
    rulesMap.get(a)!.add(b);
  });

  // Validate a single update using RxJS
  const validateUpdateRx = (update: number[]) => {
    const positions = new Map<number, number>();
    update.forEach((page, index) => positions.set(page, index));

    return from(Array.from(rulesMap.entries())).pipe(
      mergeMap(([before, afterSet]) =>
        of(before).pipe(
          filter(() => positions.has(before)), // Only check rules for pages in the update
          mergeMap(() => from(Array.from(afterSet))),
          every(
            (after) =>
              !positions.has(after) ||
              positions.get(before)! < positions.get(after)!
          )
        )
      ),
      every((isValid) => isValid) // Ensure all rules are valid
    );
  };

  // Find the middle page
  const findMiddlePage = (update: number[]): number => {
    const middleIndex = Math.floor(update.length / 2);
    return update[middleIndex];
  };

  // RxJS solution
  from(updatesInput)
    .pipe(
      // Validate updates reactively
      mergeMap((update) =>
        validateUpdateRx(update).pipe(
          filter((isValid) => isValid), // Only pass valid updates
          map(() => update) // Map back to the valid update
        )
      ),
      // Map to the middle page of valid updates
      map(findMiddlePage),
      // Sum up the middle pages
      reduce((sum, middlePage) => sum + middlePage, 0)
    )
    .subscribe((result) => {
      console.log(`Sum of middle pages of valid updates: ${result}`);
    });
}

export function part2(filePath = 'day-05/src/lib/input-2.txt') {
  const input = fs.readFileSync(filePath, 'utf8');
 
  const parseInputString = (
    input: string
  ): { rulesInput: string[]; updatesInput: number[][] } => {
    // Split the input into lines and clean up
    const lines = input
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line);

    const rulesInput: string[] = [];
    const updatesInput: number[][] = [];
    let isUpdateSection = false;

    for (const line of lines) {
      if (line.includes('|')) {
        if (!isUpdateSection) {
          rulesInput.push(line);
        }
      } else if (line.includes(',')) {
        isUpdateSection = true;
        const update = line.split(',').map((num) => parseInt(num.trim(), 10));
        updatesInput.push(update);
      }
    }

    return { rulesInput, updatesInput };
  };

  const { rulesInput, updatesInput } = parseInputString(input);

  // Parse rules into a map for quick lookup
  const rulesMap = new Map<number, Set<number>>();
  rulesInput.forEach((rule) => {
    const [a, b] = rule.split('|').map(Number);
    if (!rulesMap.has(a)) rulesMap.set(a, new Set());
    rulesMap.get(a)!.add(b);
  });

  // Validate a single update using RxJS
  const validateUpdateRx = (update: number[]) => {
    const positions = new Map<number, number>();
    update.forEach((page, index) => positions.set(page, index));

    return from(Array.from(rulesMap.entries())).pipe(
      mergeMap(([before, afterSet]) =>
        of(before).pipe(
          filter(() => positions.has(before)), // Only check rules for pages in the update
          mergeMap(() => from(Array.from(afterSet))),
          every(
            (after) =>
              !positions.has(after) ||
              positions.get(before)! < positions.get(after)!
          )
        )
      ),
      every((isValid) => isValid) // Ensure all rules are valid
    );
  };

  // Fix the order of a single update
  const fixUpdateOrder = (update: number[]): number[] => {
    const sorted = [...update].sort((a, b) => {
      if (rulesMap.get(a)?.has(b)) return -1; // a must come before b
      if (rulesMap.get(b)?.has(a)) return 1; // b must come before a
      return 0; // no ordering constraint
    });
    return sorted;
  };

  // Find the middle page
  const findMiddlePage = (update: number[]): number => {
    const middleIndex = Math.floor(update.length / 2);
    return update[middleIndex];
  };

  // RxJS solution
  from(updatesInput)
    .pipe(
      // Validate updates reactively
      mergeMap((update) =>
        validateUpdateRx(update).pipe(
          filter((isValid) => !isValid), // Only pass invalid updates
          map(() => fixUpdateOrder(update)) // Fix the order of invalid updates
        )
      ),
      // Map to the middle page of fixed updates
      map(findMiddlePage),
      // Sum up the middle pages
      reduce((sum, middlePage) => sum + middlePage, 0)
    )
    .subscribe((result) => {
      console.log(`Sum of middle pages of fixed updates: ${result}`);
    });
}
