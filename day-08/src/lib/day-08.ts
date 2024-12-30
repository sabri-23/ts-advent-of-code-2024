import * as fs from 'fs';
import { from, map, reduce, tap } from 'rxjs';

export function part1(filePath = 'day-08/src/lib/input.txt') {
  const input = fs.readFileSync(filePath, 'utf8');
  // Read the file and parse the grid
  const grid = input
    .trim()
    .split('\n')
    .map((line) => line.split(''));

  // Find all antennas in the grid
  function findAntennas(): { frequency: string; position: [number, number] }[] {
    const antennas: { frequency: string; position: [number, number] }[] = [];
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        const cell = grid[y][x];
        if (/[a-zA-Z0-9]/.test(cell)) {
          antennas.push({ frequency: cell, position: [x, y] });
        }
      }
    }
    return antennas;
  }

  // Check if a position is within the grid
  function isWithinBounds([x, y]: [number, number]): boolean {
    return y >= 0 && y < grid.length && x >= 0 && x < grid[0].length;
  }

  // Calculate antinodes for a pair of antennas
  function calculateAntinodesForPair(
    pos1: [number, number],
    pos2: [number, number]
  ): [number, number][] {
    const [x1, y1] = pos1;
    const [x2, y2] = pos2;

    // Calculate the vector between antennas
    const dx = x2 - x1;
    const dy = y2 - y1;

    // Calculate positions at double the distance
    const antinode1: [number, number] = [x1 - dx, y1 - dy];
    const antinode2: [number, number] = [x2 + dx, y2 + dy];

    const validAntinodes: [number, number][] = [];
    if (isWithinBounds(antinode1)) validAntinodes.push(antinode1);
    if (isWithinBounds(antinode2)) validAntinodes.push(antinode2);

    return validAntinodes;
  }

  // Calculate all unique antinodes
  const antennas = findAntennas();
  const uniqueAntinodes = new Set<string>();

  for (let i = 0; i < antennas.length; i++) {
    for (let j = i + 1; j < antennas.length; j++) {
      const antenna1 = antennas[i];
      const antenna2 = antennas[j];

      if (antenna1.frequency === antenna2.frequency) {
        const newAntinodes = calculateAntinodesForPair(
          antenna1.position,
          antenna2.position
        );
        newAntinodes.forEach(([x, y]) => uniqueAntinodes.add(`${x},${y}`));
      }
    }
  }

  return from(uniqueAntinodes).pipe(
    map((pos) => pos), // Map to ensure we are processing each position
    reduce((acc) => acc + 1, 0), // Count the unique antinodes
    tap((total) => console.log(`Total unique antinodes: `, total))
  );
}

export function part2(filePath = 'day-08/src/lib/input.txt') {
  const input = fs.readFileSync(filePath, 'utf8');
  const grid = input
    .trim()
    .split('\n')
    .map((line) => line.split(''));

  function gcd(a: number, b: number): number {
    return b === 0 ? Math.abs(a) : gcd(b, a % b);
  }

  function findAntennas(): { frequency: string; position: [number, number] }[] {
    const antennas: { frequency: string; position: [number, number] }[] = [];
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        const cell = grid[y][x];
        if (/[a-zA-Z0-9]/.test(cell)) {
          antennas.push({ frequency: cell, position: [x, y] });
        }
      }
    }
    return antennas;
  }

  function isWithinBounds([x, y]: [number, number]): boolean {
    return y >= 0 && y < grid.length && x >= 0 && x < grid[0].length;
  }

  function calculateAntinodesForPair(
    pos1: [number, number],
    pos2: [number, number]
  ): Set<string> {
    const antinodes = new Set<string>();

    const [x1, y1] = pos1;
    const [x2, y2] = pos2;

    const dx = x2 - x1;
    const dy = y2 - y1;

    const steps = gcd(Math.abs(dx), Math.abs(dy));
    const stepX = dx / steps;
    const stepY = dy / steps;

    // Place antinodes forward along the vector
    let k = 1;
    while (true) {
      const currentX = x2 + k * stepX;
      const currentY = y2 + k * stepY;
      if (!isWithinBounds([currentX, currentY])) break;
      antinodes.add(`${currentX},${currentY}`);
      k++;
    }

    // Place antinodes backward along the vector
    k = 1;
    while (true) {
      const currentX = x1 - k * stepX;
      const currentY = y1 - k * stepY;
      if (!isWithinBounds([currentX, currentY])) break;
      antinodes.add(`${currentX},${currentY}`);
      k++;
    }

    // Include the positions of both antennas
    antinodes.add(`${x1},${y1}`);
    antinodes.add(`${x2},${y2}`);

    return antinodes;
  }

  // Calculate antinodes for all antennas of the same frequency
  function calculateAntinodesForFrequency(
    antennas: { frequency: string; position: [number, number] }[]
  ): Set<string> {
    const antinodes = new Set<string>();

    for (let i = 0; i < antennas.length; i++) {
      for (let j = i + 1; j < antennas.length; j++) {
        const pos1 = antennas[i].position;
        const pos2 = antennas[j].position;

        // Add antinodes for this pair of antennas
        const pairAntinodes = calculateAntinodesForPair(pos1, pos2);
        pairAntinodes.forEach((antinode) => antinodes.add(antinode));
      }
    }

    return antinodes;
  }

  // Main calculation
  const antennas = findAntennas();

  // Group antennas by frequency
  const frequencyGroups: Record<
    string,
    { frequency: string; position: [number, number] }[]
  > = {};
  for (const antenna of antennas) {
    if (!frequencyGroups[antenna.frequency]) {
      frequencyGroups[antenna.frequency] = [];
    }
    frequencyGroups[antenna.frequency].push(antenna);
  }

  // Calculate unique antinodes for each frequency group
  const uniqueAntinodes = new Set<string>();
  for (const frequency in frequencyGroups) {
    const group = frequencyGroups[frequency];
    const groupAntinodes = calculateAntinodesForFrequency(group);
    groupAntinodes.forEach((antinode) => uniqueAntinodes.add(antinode));
  }

  // Return the total count of unique antinodes
  return from(uniqueAntinodes).pipe(
    map((pos) => pos), // Map to ensure we are processing each position
    reduce((acc) => acc + 1, 0), // Count the unique antinodes
    tap((total) => console.log(`Total unique antinodes: `, total))
  );
}
