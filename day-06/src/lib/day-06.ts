import { interval, of } from 'rxjs';
import { scan, tap, skipWhile, take } from 'rxjs/operators';
import * as fs from 'fs';

export function part1(filePath = 'day-06/src/lib/input.txt') {
  const input = fs.readFileSync(filePath, 'utf8');

  const grid = input
    .trim()
    .split('\n')
    .map((row) => row.split(''));
  let guardPosition!: [number, number];
  let guardDirection = '^';

  // Find the guard's starting position and direction
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const cell = grid[y][x];
      if ('^>v<'.includes(cell)) {
        guardPosition = [x, y];
        guardDirection = cell;
        grid[y][x] = '.'; // Replace with empty space
      }
    }
  }

  const directions = ['^', '>', 'v', '<'];
  const deltas: Record<string, [number, number]> = {
    '^': [0, -1],
    '>': [1, 0],
    v: [0, 1],
    '<': [-1, 0],
  };

  const visited = new Set<string>();
  visited.add(`${guardPosition[0]},${guardPosition[1]}`);

  return interval(0).pipe(
    scan(
      (state) => {
        const [x, y] = state.position;
        const dir = state.direction;
        const [dx, dy] = deltas[dir];
        let nx = x;
        let ny = y;

        // Move in the current direction until hitting a wall or going out of bounds
        while (
          ny + dy >= 0 &&
          ny + dy < grid.length &&
          nx + dx >= 0 &&
          nx + dx < grid[0].length &&
          grid[ny + dy][nx + dx] !== '#'
        ) {
          nx += dx;
          ny += dy;
          visited.add(`${nx},${ny}`);
        }

        // Check if the guard went out of bounds
        if (
          ny + dy < 0 ||
          ny + dy >= grid.length ||
          nx + dx < 0 ||
          nx + dx >= grid[0].length
        ) {
          return {
            position: [nx, ny],
            direction: dir,
            visited,
            outOfBounds: true,
          };
        }

        // Turn right (change direction) if a wall is encountered
        const newDirection =
          directions[(directions.indexOf(dir) + 1) % directions.length];
        return {
          position: [nx, ny],
          direction: newDirection,
          visited,
          outOfBounds: false,
        };
      },
      {
        position: guardPosition as number[],
        direction: guardDirection,
        visited,
        outOfBounds: false,
      }
    ),
    skipWhile((state) => !state.outOfBounds),
    take(1),
    tap((state) => {
      if (state.outOfBounds) {
        // console.log(
        //   `Guard exited the map at (${state.position[0]}, ${state.position[1]}).`
        // );
        console.log(`Total distinct positions visited: `, state.visited.size);
      }
    })
  );
}

export function part2(filePath = 'day-06/src/lib/input.txt') {
  const input = fs.readFileSync(filePath, 'utf8');

  const grid = input
    .trim()
    .split('\n')
    .map((row) => row.split(''));
  let guardPosition!: [number, number];
  let guardDirection = '^';

  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const cell = grid[y][x];
      if ('^>v<'.includes(cell)) {
        guardPosition = [x, y];
        guardDirection = cell;
        grid[y][x] = '.'; // Replace guard with empty space
      }
    }
  }

  // Direction helpers
  const directions = ['^', '>', 'v', '<'];
  const deltas: Record<string, [number, number]> = {
    '^': [0, -1],
    '>': [1, 0],
    v: [0, 1],
    '<': [-1, 0],
  };

  // Simulate the guard's movement and record its path
  const simulateGuard = (
    grid: string[][],
    start: [number, number],
    direction: string
  ): {
    path: { position: [number, number]; direction: string }[];
    isLoop: boolean;
  } => {
    const visited = new Set<string>();
    const path: { position: [number, number]; direction: string }[] = [];
    let guardPosition = [...start];
    let guardDirection = direction;

    while (true) {
      const [x, y] = guardPosition;
      const [dx, dy] = deltas[guardDirection];
      let nx = x;
      let ny = y;

      // Move in the current direction until hitting a wall or going out of bounds
      while (
        ny + dy >= 0 &&
        ny + dy < grid.length &&
        nx + dx >= 0 &&
        nx + dx < grid[0].length &&
        grid[ny + dy][nx + dx] !== '#'
      ) {
        nx += dx;
        ny += dy;

        const positionKey = `${nx},${ny},${guardDirection}`;
        if (visited.has(positionKey)) {
          return { path, isLoop: true }; // Loop detected
        }
        visited.add(positionKey);
        path.push({ position: [nx, ny], direction: guardDirection });
      }

      // Update guard's position
      guardPosition = [nx, ny];

      // Check if the guard went out of bounds
      if (
        ny + dy < 0 ||
        ny + dy >= grid.length ||
        nx + dx < 0 ||
        nx + dx >= grid[0].length
      ) {
        break; // Guard exited the map
      }

      // Turn right (change direction) if a wall is encountered
      guardDirection =
        directions[
          (directions.indexOf(guardDirection) + 1) % directions.length
        ];
    }

    return { path, isLoop: false };
  };

  const findObstructionPositions = (
    grid: string[][],
    start: [number, number],
    direction: string
  ): number => {
    let loopCount = 0;

    // Iterate over all cells in the grid
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        if (grid[y][x] === '.') {
          // Temporarily place an obstruction and simulate
          grid[y][x] = '#';
          const { isLoop } = simulateGuard(grid, start, direction);
          grid[y][x] = '.'; // Remove the obstruction

          if (isLoop) {
            loopCount++;
          }
        }
      }
    }

    return loopCount;
  };

  return of(findObstructionPositions(grid, guardPosition, guardDirection)).pipe(
    tap((obstructionCount) =>
      console.log(`Number of positions that cause a loop: `, obstructionCount)
    )
  );
}
