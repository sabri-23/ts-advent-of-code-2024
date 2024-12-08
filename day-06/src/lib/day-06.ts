import { interval } from 'rxjs';
import { scan, takeWhile, finalize, tap } from 'rxjs/operators';
import * as fs from 'fs';

export function part1(filePath = 'day-06/src/lib/input-1.txt') {
  const input = fs.readFileSync(filePath, 'utf8');

  const startTime = performance.now(); // Start timing

  // Parse the map into a grid
  const parseMap = (input: string) => {
    const grid = input
      .trim()
      .split('\n')
      .map((row) => row.split(''));
    let guardPosition: [number, number] | null = null;
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

    return { grid, guardPosition: guardPosition!, guardDirection };
  };

  // Direction helpers
  const directions = ['^', '>', 'v', '<'];
  const deltas: Record<string, [number, number]> = {
    '^': [0, -1],
    '>': [1, 0],
    v: [0, 1],
    '<': [-1, 0],
  };

  // Simulate the guard's movement
  const simulateGuard = (
    grid: string[][],
    start: number[],
    direction: string
  ) => {
    const visited = new Set<string>(); // Track visited positions
    visited.add(`${start[0]},${start[1]}`); // Add the starting position

    return interval(1).pipe(
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
            visited.add(`${nx},${ny}`); // Mark the position as visited
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
        { position: start, direction, visited, outOfBounds: false }
      ),
      tap((state) => {
        const [x, y] = state.position;
        if (!state.outOfBounds) {
          // Log guard's position if not out of bounds
          // console.log(`Guard at (${x}, ${y}) facing ${state.direction}`);
        } else {
          console.log(`Guard exited the map at (${x}, ${y}).`);
        }
      }),
      takeWhile((state) => !state.outOfBounds), // Stop when the guard exits the map
      finalize(() => {
        // Display the total count of visited positions
        console.log(`Total distinct positions visited: ${visited.size}`);
      })
    );
  };

  // Parse the input and simulate
  const { grid, guardPosition, guardDirection } = parseMap(input);

  simulateGuard(grid, guardPosition, guardDirection).subscribe({
    complete: () => {
      console.log('Simulation complete.');

      const endTime = performance.now(); // End timing
      console.log(`Total time taken: ${(endTime - startTime).toFixed(2)}ms`);
    },
  });
}

export function part2(filePath = 'day-06/src/lib/input-2.txt') {
  const input = fs.readFileSync(filePath, 'utf8');

  const startTime = performance.now(); // Start timing

  // Parse the map into a grid
  const parseMap = (input: string) => {
    const grid = input
      .trim()
      .split('\n')
      .map((row) => row.split(''));
    let guardPosition: [number, number] | null = null;
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

    return { grid, guardPosition: guardPosition!, guardDirection };
  };

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
    loopDetected: boolean;
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
          return { path, loopDetected: true }; // Loop detected
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

    return { path, loopDetected: false };
  };

  // Find all positions the guard moves onto
  // const findGuardPath = (
  //   grid: string[][],
  //   start: [number, number],
  //   direction: string
  // ) => {
  //   const { path } = simulateGuard(grid, start, direction);
  //   return path;
  // };

  // Find all candidate positions for obstruction
  // const findObstructionPositions = (
  //   grid: string[][],
  //   guardPath: { position: [number, number]; direction: string }[],
  //   start: [number, number],
  //   direction: string
  // ): number => {
  //   let loopCount = 0;

  //   // Test each position in the guard path
  //   for (const { position: [x, y], direction: guardDirection } of guardPath) {
  //     // Temporarily place an obstruction and simulate
  //     grid[y][x] = '#';
  //     const { loopDetected } = simulateGuard(grid, start, guardDirection);
  //     grid[y][x] = '.'; // Remove the obstruction

  //     if (loopDetected) {
  //       console.log('loopDetected', y, x)
  //       loopCount++;
  //     }
  //   }

  //   return loopCount;
  // };

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
          const { loopDetected } = simulateGuard(grid, start, direction);
          grid[y][x] = '.'; // Remove the obstruction

          if (loopDetected) {
            loopCount++;
          }
        }
      }
    }

    return loopCount;
  };

  // Parse the input and simulate
  const { grid, guardPosition, guardDirection } = parseMap(input);
  // const guardPath = findGuardPath(grid, guardPosition, guardDirection)
  // .filter((pos) => !(pos.position === guardPosition && pos.direction === guardDirection));
  const obstructionCount = findObstructionPositions(
    grid,
    guardPosition,
    guardDirection
  );

  console.log(`Number of positions that cause a loop: ${obstructionCount}`);

  const endTime = performance.now(); // End timing
  console.log(`Total time taken: ${(endTime - startTime).toFixed(2)}ms`);
}
