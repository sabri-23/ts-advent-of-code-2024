import { from, of } from 'rxjs';
import { map, reduce, filter, mergeMap, every, tap } from 'rxjs/operators';
import * as fs from 'fs';

// Define types
type Rule = string;
type Update = number[];

export function part1(filePath = 'day-05/src/lib/input.txt') {
  const input = fs.readFileSync(filePath, 'utf8');

  const lines = input
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line);

  const rules: Rule[] = [];
  const updates: Update[] = [];
  let isUpdateSection = false;

  for (const line of lines) {
    if (line.includes('|')) {
      if (!isUpdateSection) {
        rules.push(line);
      }
    } else if (line.includes(',')) {
      isUpdateSection = true;
      const update = line.split(',').map((num) => parseInt(num.trim(), 10));
      updates.push(update);
    }
  }

  // Parse rules into a map for quick lookup
  const sequenceRulesMap = new Map<number, Set<number>>();
  rules.forEach((rule) => {
    const [a, b] = rule.split('|').map(Number);
    if (!sequenceRulesMap.has(a)) sequenceRulesMap.set(a, new Set());
    sequenceRulesMap.get(a)!.add(b);
  });

  // Iterates array of update through observable
  return from(updates).pipe(
    mergeMap((update) => {
      const numberIndexMap = new Map<number, number>();
      update.forEach((number, index) => numberIndexMap.set(number, index));

      return from(Array.from(sequenceRulesMap.entries())).pipe(
        mergeMap(([number, sequenceRule]) =>
          of(number).pipe(
            filter(() => numberIndexMap.has(number)), //
            mergeMap(() => from(Array.from(sequenceRule))),
            every(
              (numberAfter) =>
                !numberIndexMap.has(numberAfter) ||
                numberIndexMap.get(number)! < numberIndexMap.get(numberAfter)!
            )
          )
        ),
        // Ensure all rules are valid
        every((isValid) => isValid),
        // Only pass valid update
        filter((isValid) => isValid),
        // Map back to the middle page of valid updates
        map(() => update[Math.floor(update.length / 2)])
      );
    }),
    // Sum up the middle pages
    reduce((sum, middlePage) => sum + middlePage, 0),
    tap((result) =>
      console.log(`Sum of middle pages of valid updates: ${result}`)
    )
  );
} // 4185

export function part2(filePath = 'day-05/src/lib/input.txt') {
  const input = fs.readFileSync(filePath, 'utf8');

  const lines = input
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line);

  const rules: Rule[] = [];
  const updates: Update[] = [];
  let isUpdateSection = false;

  for (const line of lines) {
    if (line.includes('|')) {
      if (!isUpdateSection) {
        rules.push(line);
      }
    } else if (line.includes(',')) {
      isUpdateSection = true;
      const update = line.split(',').map((num) => parseInt(num.trim(), 10));
      updates.push(update);
    }
  }

  // Parse rules into a map
  const sequenceRulesMap = new Map<number, Set<number>>();
  rules.forEach((rule) => {
    const [a, b] = rule.split('|').map(Number);
    if (!sequenceRulesMap.has(a)) sequenceRulesMap.set(a, new Set());
    sequenceRulesMap.get(a)!.add(b);
  });

  // Iterates array of update through observable
  return from(updates).pipe(
    mergeMap((update) => {
      const numberIndexMap = new Map<number, number>();
      update.forEach((page, index) => numberIndexMap.set(page, index));

      return from(Array.from(sequenceRulesMap.entries())).pipe(
        mergeMap(([number, sequenceRule]) =>
          of(number).pipe(
            // Only check rules for pages in the update
            filter((number) => numberIndexMap.has(number)),
            mergeMap(() => from(Array.from(sequenceRule))),
            // check if number rules is respected
            every(
              (numberAfter) =>
                !numberIndexMap.has(numberAfter) ||
                numberIndexMap.get(number)! < numberIndexMap.get(numberAfter)!
            )
          )
        ),
        // check if all rules are valid
        every((isValid) => isValid), 
        // Only pass invalid update
        filter((isValid) => !isValid),
        // Fix the order of invalid update
        map(() =>
          [...update].sort((a, b) => {
            if (sequenceRulesMap.get(a)?.has(b)) return -1; // a before b
            if (sequenceRulesMap.get(b)?.has(a)) return 1; // b before a
            return 0; // no ordering constraint
          })
        ),
        // Map back to the middle page of fixed update
        map((fixedUpdate) => fixedUpdate[Math.floor(fixedUpdate.length / 2)])
      );
    }),
    // Sum up the middle pages
    reduce((sum, middlePage) => sum + middlePage, 0),
    tap((result) =>
      console.log(`Sum of middle pages of fixed updates: ${result}`)
    )
  );
}
