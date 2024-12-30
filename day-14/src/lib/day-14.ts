import { from, Observable, of } from 'rxjs';
import { map, mergeMap, tap, take, skipWhile} from 'rxjs/operators';
import * as fs from 'fs';

// Define the structure of a robot
interface Robot {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

// Grid dimensions
const GRID_WIDTH = 101; // x: 0 to 100
const GRID_HEIGHT = 103; // y: 0 to 102

// Function to parse a single line of input into a Robot object
function parseRobot(line: string): Robot {
  const regex = /p=(-?\d+),(-?\d+) v=(-?\d+),(-?\d+)/;
  const match = line.match(regex);
  if (!match) {
    throw new Error(`Invalid input line: ${line}`);
  }
  const [, x, y, vx, vy] = match;
  return {
    x: parseInt(x, 10),
    y: parseInt(y, 10),
    vx: parseInt(vx, 10),
    vy: parseInt(vy, 10),
  };
}

// Function to read and parse all robots from the input file
function readRobots(filePath: string): Observable<Robot[]> {
  return from(fs.promises.readFile(filePath, { encoding: 'utf-8' })).pipe(
    map((content) =>
      content
        .split(/\r?\n/)
        .filter((line) => line.trim() !== '')
        .map((line) => parseRobot(line))
    )
  );
}

function wrap(value: number, max: number): number {
  let wrapped = value % max;
  if (wrapped < 0) wrapped += max;
  return wrapped;
}

// Function to count robots in each quadrant
function countQuadrants(robots: Robot[]): {
  q1: number;
  q2: number;
  q3: number;
  q4: number;
} {
  let q1 = 0,
    q2 = 0,
    q3 = 0,
    q4 = 0;

  robots.forEach((robot) => {
    const { x, y } = robot;
    // Exclude robots on the middle row or column
    if (x === Math.floor(GRID_WIDTH / 2) || y === Math.floor(GRID_HEIGHT / 2)) {
      return;
    }
    if (x < Math.floor(GRID_WIDTH / 2) && y < Math.floor(GRID_HEIGHT / 2)) {
      q1++;
    } else if (
      x > Math.floor(GRID_WIDTH / 2) &&
      y < Math.floor(GRID_HEIGHT / 2)
    ) {
      q2++;
    } else if (
      x < Math.floor(GRID_WIDTH / 2) &&
      y > Math.floor(GRID_HEIGHT / 2)
    ) {
      q3++;
    } else if (
      x > Math.floor(GRID_WIDTH / 2) &&
      y > Math.floor(GRID_HEIGHT / 2)
    ) {
      q4++;
    }
  });

  return { q1, q2, q3, q4 };
}

// Function to simulate robot movements after a given number of seconds
function simulateRobots(robots: Robot[], seconds: number): Observable<Robot[]> {
  return of(robots).pipe(
    map((robots) =>
      robots.map((robot) => ({
        ...robot,
        x: wrap(robot.x + robot.vx * seconds, GRID_WIDTH),
        y: wrap(robot.y + robot.vy * seconds, GRID_HEIGHT),
      }))
    )
  );
}

export function part1(
  filePath = 'day-14/src/lib/input.txt'
): Observable<number> {
  return readRobots(filePath).pipe(
    mergeMap((robots) => simulateRobots(robots, 100)),
    map((finalPositions) => {
      const quadrantCounts = countQuadrants(finalPositions);

      // Calculate safety factor
      const safetyFactor =
        quadrantCounts.q1 *
        quadrantCounts.q2 *
        quadrantCounts.q3 *
        quadrantCounts.q4;

      return safetyFactor;
    }),
    tap((safetyFactor) => {
      console.log(`Total Safety Factor after 100 seconds: `, safetyFactor);
    })
  );
}

// Function to check if at least six robots are consecutively aligned horizontally
function checkEasterEggPresence(robots: Robot[]): boolean {
  // Group robots by y-coordinate
  const robotsByY: Record<number, number[]> = {};

  robots.forEach((robot) => {
    if (!robotsByY[robot.y]) {
      robotsByY[robot.y] = [];
    }
    robotsByY[robot.y].push(robot.x);
  });

  // Check each y-coordinate for at least six consecutive x_positions
  for (const y in robotsByY) {
    const sortedX = robotsByY[y].sort((a, b) => a - b);
    let consecutiveCount = 1;

    for (let i = 1; i < sortedX.length; i++) {
      if (sortedX[i] === sortedX[i - 1] + 1) {
        consecutiveCount++;
        if (consecutiveCount >= 8) {
          return true;
        }
      } else {
        consecutiveCount = 1;
      }
    }
  }

  return false;
}

export function part2(filePath = 'day-14/src/lib/input.txt') {
  const maxSeconds = 20000;
  let minimalSecond = 0;

 return readRobots(filePath).pipe(
    mergeMap((robots) =>
      from(Array.from({ length: maxSeconds }, (_, i) => i + 1)).pipe(
        mergeMap((seconds) =>
          simulateRobots(robots, seconds).pipe(
            map((currentPositions) => ({ seconds, currentPositions }))
          )
        ),
         tap(({ seconds, currentPositions }) => {
           if (checkEasterEggPresence(currentPositions)) {
             minimalSecond = seconds;
           }
         }),
        skipWhile(({ seconds }) =>
          minimalSecond === 0 || seconds === maxSeconds
        ),
        take(1),
        // Stop once easter egg is detected
        tap(({ seconds }) => {
          if (seconds > 0) {
            console.log(`Easter Egg detected at second:`, minimalSecond);
          } else {
            console.log(
              `Easter egg was not detected within ${maxSeconds} seconds.`
            );
          }
        })
      )
    )
  );
}
