import { from, Observable } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import * as fs from 'fs';


// Define the structure of the warehouse grid
type Cell = '#' | '.' | 'O';
type Warehouse = Cell[][];

// Define the robot's position
interface Position {
  x: number;
  y: number;
}

// Function to parse the warehouse map and movement sequence
function parseInput(content: string): { warehouse: Warehouse; robotPos: Position; movements: string } {
  const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');

  // Find the index where movement sequences start
  // Assuming that movement sequences contain only <, >, ^, v
  const movementStartIndex = lines.findIndex(line => /^[<>^v]+$/.test(line.trim()));
  if (movementStartIndex === -1) {
    throw new Error('Movement sequence not found in the input.');
  }

  // Parse map lines
  const mapLines = lines.slice(0, movementStartIndex);
  const warehouse: Warehouse = [];
  let robotPos: Position | null = null;

  mapLines.forEach((line, y) => {
    const row: Cell[] = [];
    for (let x = 0; x < line.length; x++) {
      const char = line[x];
      if (char === '@') {
        if (robotPos) {
          throw new Error('Multiple robot positions found in the map.');
        }
        robotPos = { x, y };
        row.push('.'); // Replace robot position with empty space for box movement
      } else if (char === 'O' || char === '.' || char === '#') {
        row.push(char);
      } else {
        throw new Error(`Invalid character '${char}' found in the map.`);
      }
    }
    warehouse.push(row);
  });

  if (!robotPos) {
    throw new Error("Robot position '@' not found in the map.");
  }

  // Concatenate movement sequences into a single string
  const movementLines = lines.slice(movementStartIndex);
  const movements = movementLines.join('').trim();

  return { warehouse, robotPos, movements };
}

// Function to simulate robot movements with detailed logging
function simulateMovements(warehouse: Warehouse, robotPos: Position, movements: string): { finalWarehouse: Warehouse; finalRobotPos: Position } {
  // Define movement directions
  const directions: { [key: string]: Position } = {
    '^': { x: 0, y: -1 },
    'v': { x: 0, y: 1 },
    '<': { x: -1, y: 0 },
    '>': { x: 1, y: 0 },
  };

  // Current robot position
  let currentPos: Position = { ...robotPos };

  console.log(`\nInitial Robot Position: (${currentPos.x}, ${currentPos.y})`);
  logBoxPositions(warehouse);

  for (let i = 0; i < movements.length; i++) {
    const move = movements[i];
    const dir = directions[move];
    if (!dir) {
      console.warn(`Invalid movement direction '${move}' at step ${i + 1}. Skipping.`);
      continue;
    }

    const targetX = currentPos.x + dir.x;
    const targetY = currentPos.y + dir.y;

    // Check bounds
    if (targetY < 0 || targetY >= warehouse.length || targetX < 0 || targetX >= warehouse[0].length) {
      // Movement out of bounds; robot does not move
      // console.log(`Step ${i + 1}: Move '${move}' out of bounds. Robot stays at (${currentPos.x}, ${currentPos.y}).`);
      logBoxPositions(warehouse);
      continue;
    }

    const targetCell = warehouse[targetY][targetX];

    if (targetCell === '.') {
      // Move robot to the empty cell
      currentPos = { x: targetX, y: targetY };
      // console.log(`Step ${i + 1}: Move '${move}' to empty cell (${currentPos.x}, ${currentPos.y}).`);
    } else if (targetCell === 'O') {
      // Attempt to push the box
      const boxNewX = targetX + dir.x;
      const boxNewY = targetY + dir.y;

      // Check if the box can be pushed
      if (
        boxNewY >= 0 &&
        boxNewY < warehouse.length &&
        boxNewX >= 0 &&
        boxNewX < warehouse[0].length &&
        warehouse[boxNewY][boxNewX] === '.'
      ) {
        // Push the box
        warehouse[boxNewY][boxNewX] = 'O'; // Move box to the new position
        warehouse[targetY][targetX] = '.'; // Empty the box's old position
        currentPos = { x: targetX, y: targetY }; // Update robot position
        // console.log(`Step ${i + 1}: Move '${move}' pushing box from (${targetX}, ${targetY}) to (${boxNewX}, ${boxNewY}).`);
      } else {
        // console.log(`Step ${i + 1}: Move '${move}' cannot push box at (${targetX}, ${targetY}). Robot stays at (${currentPos.x}, ${currentPos.y}).`);
      }
    } else {
      // If the target cell is a wall '#', the robot does not move
      // console.log(`Step ${i + 1}: Move '${move}' blocked by wall at (${targetX}, ${targetY}). Robot stays at (${currentPos.x}, ${currentPos.y}).`);
    }

    // After each move, log the current positions of all boxes
    logBoxPositions(warehouse);
  }

  return { finalWarehouse: warehouse, finalRobotPos: currentPos };
}

// Function to log all box positions
function logBoxPositions(warehouse: Warehouse): void {
  const boxes: Position[] = [];
  for (let y = 0; y < warehouse.length; y++) {
    for (let x = 0; x < warehouse[0].length; x++) {
      if (warehouse[y][x] === 'O') {
        boxes.push({ x, y });
      }
    }
  }
  // const boxPositions = boxes.map(pos => `(${pos.x},${pos.y})`).join(', ');
  // console.log(`Current Boxes at: ${boxPositions}`);
}

// Function to calculate the sum of GPS coordinates
function calculateGpsSum(warehouse: Warehouse): number {
  let gpsSum = 0;
  let boxCount = 0;

  for (let y = 0; y < warehouse.length; y++) {
    for (let x = 0; x < warehouse[0].length; x++) {
      if (warehouse[y][x] === 'O') {
        const gps = 100 * y + x;
        gpsSum += gps;
        boxCount++;
      }
    }
  }

  console.log(`Total number of boxes: ${boxCount}`);
  return gpsSum;
}

// Function to visualize the warehouse (optional)
function visualizeWarehouse(warehouse: Warehouse, robotPos: Position): void {
  console.log('\nFinal Warehouse State:');
  for (let y = 0; y < warehouse.length; y++) {
    let row = '';
    for (let x = 0; x < warehouse[0].length; x++) {
      if (x === robotPos.x && y === robotPos.y) {
        row += '@';
      } else {
        row += warehouse[y][x];
      }
    }
    console.log(row);
  }
}

// The part1 function as per the user's request
function part1(): Observable<number> {

  return from(    fs.promises.readFile('day-15/src/lib/input.txt', { encoding: 'utf-8' })
).pipe(
    map(content => parseInput(content)),
    map(({ warehouse, robotPos, movements }) => {
      const { finalWarehouse, finalRobotPos } = simulateMovements(warehouse, robotPos, movements);
      visualizeWarehouse(finalWarehouse, finalRobotPos); // Optional visualization
      const gpsSum = calculateGpsSum(finalWarehouse);
      return gpsSum;
    }),
    tap(gpsSum => {
      console.log(`\nSum of all boxes' GPS coordinates: ${gpsSum}`);
    }),
    catchError(err => {
      console.error(`Error: ${err.message}`);
      throw err;
    })
  );
}

// Execute part1 and subscribe to the Observable
part1().subscribe({
  next: () => {
    // No action needed here as tap handles the output
  },
  error: err => {
    console.error(`Subscription Error: ${err.message}`);
  },
  complete: () => {
    console.log('Processing complete.');
  },
});
