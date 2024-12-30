import { zip, from, map, reduce, tap } from 'rxjs';
import * as fs from 'fs';

export function part1(filePath = 'day-01/src/lib/input.txt') {
  const data = fs
    .readFileSync(filePath, 'utf8')
    .trim()
    .split('\n')
    .map((line) => line.split(/\s+/).map(Number));

  return zip([
    // list left
    from(data.map((duo) => duo[0]).sort((a: number, b: number) => a - b)),
    // list right
    from(data.map((duo) => duo[1]).sort((a: number, b: number) => a - b)),
  ]).pipe(
    map(([n1, n2]: [number, number]) => Math.abs(n2 - n1)),
    reduce((total, diff) => total + diff, 0),
    tap((total) => console.info('Total distance: ', total))
  );
}

export function part2(filePath = 'day-01/src/lib/input.txt') {
  const data = fs
    .readFileSync(filePath, 'utf8')
    .trim()
    .split('\n')
    .map((line) => line.split(/\s+/).map(Number));

  return zip([
    // list left
    from(data.map((duo) => duo[0]).sort((a: number, b: number) => a - b)),
    // list right
    from(data.map((duo) => duo[1]).sort((a: number, b: number) => a - b)),
  ]).pipe(
    reduce((numCountDict, [left, right]: [number, number]) => {
      if (!numCountDict[left]) numCountDict[left] = [0, 0];
      if (!numCountDict[right]) numCountDict[right] = [0, 0];

      numCountDict[left][0] += 1;
      numCountDict[right][1] += 1;

      return numCountDict;
    }, {} as { [key: number]: [number, number] }),
    map((numberOccurenceDict) => {
      const similarityScore = Object.entries(numberOccurenceDict).reduce(
        (score, [key, occurrences]) =>
          score + +key * occurrences[0] * occurrences[1],
        0
      );
      console.info('Similarity score:', similarityScore);

      return similarityScore;
    })
  );
} // 23150395
