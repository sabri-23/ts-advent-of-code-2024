import { from, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import * as fs from 'fs';

// Define the structure of a claw machine
interface ClawMachine {
  buttonA: { x: number; y: number };
  buttonB: { x: number; y: number };
  prize: { x: number; y: number };
  costA: number; // Cost to press button A
  costB: number; // Cost to press button B
}

// Function to read the input file and return its content as a string
function readInputFile(filePath: string): Observable<string> {
  return from(fs.promises.readFile(filePath, { encoding: 'utf-8' }));
}

// Function to parse the input string into an array of ClawMachine objects
function parseInput(input: string): ClawMachine[] {
  const machines: ClawMachine[] = [];
  const machineBlocks = input.split('\n\n'); // Split machines by blank lines

  machineBlocks.forEach((block) => {
    const lines = block
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    if (lines.length !== 3) {
      // Each machine should have exactly 3 lines: Button A, Button B, Prize
      console.warn('Invalid machine configuration:', block);
      return;
    }

    // Parse Button A
    const buttonAMatch = lines[0].match(/Button A:\s*X\+(\d+),\s*Y\+(\d+)/);
    if (!buttonAMatch) {
      console.warn('Invalid Button A configuration:', lines[0]);
      return;
    }
    const buttonA = {
      x: parseInt(buttonAMatch[1], 10),
      y: parseInt(buttonAMatch[2], 10),
    };

    // Parse Button B
    const buttonBMatch = lines[1].match(/Button B:\s*X\+(\d+),\s*Y\+(\d+)/);
    if (!buttonBMatch) {
      console.warn('Invalid Button B configuration:', lines[1]);
      return;
    }
    const buttonB = {
      x: parseInt(buttonBMatch[1], 10),
      y: parseInt(buttonBMatch[2], 10),
    };

    // Parse Prize
    const prizeMatch = lines[2].match(/Prize:\s*X=(\d+),\s*Y=(\d+)/);
    if (!prizeMatch) {
      console.warn('Invalid Prize configuration:', lines[2]);
      return;
    }
    const prize = {
      x: parseInt(prizeMatch[1], 10),
      y: parseInt(prizeMatch[2], 10),
    };

    // Define button costs
    const costA = 3; // Cost to press Button A
    const costB = 1; // Cost to press Button B

    machines.push({ buttonA, buttonB, prize, costA, costB });
  });

  return machines;
}

// Function to find the minimum cost for a single machine
function findMinCost(machine: ClawMachine): number | null {
  let minCost: number | null = null;

  for (let a = 0; a <= 100; a++) {
    for (let b = 0; b <= 100; b++) {
      const x = a * machine.buttonA.x + b * machine.buttonB.x;
      const y = a * machine.buttonA.y + b * machine.buttonB.y;

      if (x === machine.prize.x && y === machine.prize.y) {
        const cost = a * machine.costA + b * machine.costB;
        if (minCost === null || cost < minCost) {
          minCost = cost;
        }
      }
    }
  }

  return minCost;
}

// Part 1 Function
export function part1(
  filePath = 'day-13/src/lib/input.txt'
): Observable<number> {
  return readInputFile(filePath).pipe(
    map((fileContent) => parseInput(fileContent)),
    map((machines) => {
      let totalCost = 0;

      machines.forEach((machine) => {
        const cost = findMinCost(machine);
        if (cost !== null) {
          totalCost += cost;
        }
      });

      return totalCost;
    }),
    tap((totalTokens) => {
      console.log(
        `Total tokens required to win all possible prizes: `,
        totalTokens
      );
    })
  );
}

// Function to find the minimum cost for a single machine (Part 2)
function findMinCostPart2(machine: ClawMachine): number | null {
  const P_x = machine.prize.x;
  const P_y = machine.prize.y;

  const A_x = machine.buttonA.x;
  const A_y = machine.buttonA.y;
  const B_x = machine.buttonB.x;
  const B_y = machine.buttonB.y;

  // Compute the determinant
  const D = A_y * B_x - A_x * B_y;

  if (D === 0) {
    // No unique solution
    return null;
  }

  // Compute solutions for a and b
  const a_numerator = B_x * P_y - B_y * P_x;
  const b_numerator = A_y * P_x - A_x * P_y;

  // Check if D divides both numerators
  if (a_numerator % D !== 0 || b_numerator % D !== 0) {
    return null;
  }

  const a = a_numerator / D;
  const b = b_numerator / D;

  // Check for non-negative solutions
  if (a < 0 || b < 0) {
    return null;
  }

  // Calculate total cost
  const totalCost = a * machine.costA + b * machine.costB;

  return totalCost;
}

// Part 2 Function
export function part2(
  filePath = 'day-13/src/lib/input.txt'
): Observable<number> {
  return readInputFile(filePath).pipe(
    map((fileContent) => parseInput(fileContent)),
    map((machines) => {
      let totalCost = 0;

      machines.forEach((machine) => {
        // Adjust prize positions by adding 10^13
        const adjustedPrize = {
          x: machine.prize.x + 10000000000000,
          y: machine.prize.y + 10000000000000,
        };

        const adjustedMachine: ClawMachine = {
          ...machine,
          prize: adjustedPrize,
        };

        const cost = findMinCostPart2(adjustedMachine);
        if (cost !== null) {
          totalCost += cost;
        }
      });

      return totalCost;
    }),
    tap((totalTokens) => {
      console.log(
        `Total tokens required to win all possible prizes: `,
        totalTokens
      );
    })
  );
}
