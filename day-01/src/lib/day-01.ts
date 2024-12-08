import { zip, from, map, reduce } from 'rxjs';
import * as fs from 'fs';

export function part1(filePath = 'day-01/src/lib/input-1.txt') {
  const data = fs
    .readFileSync(filePath, 'utf8')
    .trim()
    .split('\n')
    .map((line) => line.split(/\s+/).map(Number));

  const listLeft = data
    .map((pair) => pair[0])
    .sort((a: number, b: number) => a - b);
  const listRight = data
    .map((pair) => pair[1])
    .sort((a: number, b: number) => a - b);

  zip([from(listLeft), from(listRight)])
    .pipe(
      map(([n1, n2]: [number, number]) => Math.abs(n2 - n1)),
      reduce((acc, curr) => acc + curr, 0)
    )
    .subscribe({
      next: (total) => console.info('Total distance: ', total),
      error: (e: string) => console.error(e),
    });
    return
}

export function part2(filePath = 'day-01/src/lib/input-2.txt') {
  const data = fs
    .readFileSync(filePath, 'utf8')
    .trim()
    .split('\n')
    .map((line) => line.split(/\s+/).map(Number));

  const listLeft = data
    .map((pair) => pair[0])
    .sort((a: number, b: number) => a - b);
  const listRight = data
    .map((pair) => pair[1])
    .sort((a: number, b: number) => a - b);

  zip([from(listLeft), from(listRight)])
    .pipe(
      reduce((acc, [left, right]: [number, number]) => {
        if (!acc[left]) acc[left] = [0, 0];
        if (!acc[right]) acc[right] = [0, 0];
        acc[left][0] += 1;
        acc[right][1] += 1;
        return acc;
      }, {} as { [key: number]: [number, number] })
    )
    .subscribe({
      next: (numberOccurenceDict) => {
        const similarityScore = Object.entries(numberOccurenceDict).reduce(
          (score, [key, occurrences]) =>
            score + +key * occurrences[0] * occurrences[1],
          0
        );
        console.log(`SIMILARITY SCORE: ${similarityScore}`);
      },
      error: (e: string) => console.error(e),
    });
}
