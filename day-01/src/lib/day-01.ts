import { zip, from } from 'rxjs';
import listLeftJson from './data/list-left.json';
import listRightJson from './data/list-right.json';
import listLeftJson2 from './data/list-left-2.json';
import listRightJson2 from './data/list-right-2.json';

console.log('========== PART 1 ==========');
part1();
console.log('============================');
console.log('\n\n')
console.log('========== PART 2 ==========');
part2();
console.log('============================');

export function part1(): string {
  const listLeftData: number[] = listLeftJson.sort(
    (a: number, b: number) => a - b
  );
  const listRightData: number[] = listRightJson.sort(
    (a: number, b: number) => a - b
  );

  let result = 0;

  zip([from(listLeftData), from(listRightData)]).subscribe({
    next: ([n1, n2]: [number, number]) => {
      result += Math.abs(n2 - n1);
    },
    error: (e: string) => console.error(e),
    complete: () => console.info('Total distance: ', result),
  });
  return 'day-01';
}

export function part2(): string {
  const listLeftData02: number[] = listLeftJson2.sort(
    (a: number, b: number) => a - b
  );
  const listRightData02: number[] = listRightJson2.sort(
    (a: number, b: number) => a - b
  );

  const numberOccurenceDict: { [key: number]: [number, number] } = {
    1: [0, 0],
    2: [0, 0],
    3: [0, 0],
    4: [0, 0],
    5: [0, 0],
    6: [0, 0],
    7: [0, 0],
    8: [0, 0],
    9: [0, 0],
  };

  zip([from(listLeftData02), from(listRightData02)]).subscribe({
    next: ([left, right]: [number, number]) => {
      if (!numberOccurenceDict[left]) {
        numberOccurenceDict[left] = [0, 0];
      }
      if (!numberOccurenceDict[right]) {
        numberOccurenceDict[right] = [0, 0];
      }

      numberOccurenceDict[left][0] += 1;
      numberOccurenceDict[right][1] += 1;
    },
    error: (e: string) => console.error(e),
    complete: () => {
      let similarityScore = 0;

      for (const [key, occurences] of Object.entries(numberOccurenceDict)) {
        similarityScore += +key * occurences[0] * occurences[1];
      }
      console.log(`SIMILARITY SCORE: ${similarityScore}`);
    },
  });
  return 'day-01';
}
