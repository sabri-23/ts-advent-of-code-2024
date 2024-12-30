import * as fs from 'fs';
import { from, map, filter, reduce, tap } from 'rxjs';

export function part1(filePath = 'day-07/src/lib/input.txt') {
  const input = fs.readFileSync(filePath, 'utf8').trim().split('\n');

  // Evaluate the equation left-to-right given numbers and operators
  function evaluateLeftToRight(numbers: number[], operators: string[]): number {
    let result = numbers[0];
    for (let i = 0; i < operators.length; i++) {
      const operator = operators[i];
      const nextNumber = numbers[i + 1];

      if (operator === '+') {
        result += nextNumber;
      } else if (operator === '*') {
        result *= nextNumber;
      }
    }
    return result;
  }

  // Generate all possible combinations of '+' and '*' operators
  function generateOperatorCombinations(length: number): string[][] {
    if (length === 0) return [[]];
    const smallerCombinations = generateOperatorCombinations(length - 1);
    const combinations: string[][] = [];
    for (const combo of smallerCombinations) {
      combinations.push([...combo, '+']);
      combinations.push([...combo, '*']);
    }
    return combinations;
  }

  // Parse a single line into the test value and numbers
  function parseLine(line: string): { testValue: number; numbers: number[] } {
    const [testValue, numbersString] = line.split(': ');
    return {
      testValue: parseInt(testValue.trim(), 10),
      numbers: numbersString.trim().split(' ').map(Number),
    };
  }

  // Check if a test value can be achieved with given numbers and operators
  function canEquationBeTrue(testValue: number, numbers: number[]): boolean {
    const operatorCount = numbers.length - 1;
    const operatorCombinations = generateOperatorCombinations(operatorCount);

    for (const operators of operatorCombinations) {
      if (evaluateLeftToRight(numbers, operators) === testValue) {
        return true;
      }
    }
    return false;
  }

  // Run the calibration
  return from(input).pipe(
    map(parseLine), // Parse each line
    filter(({ testValue, numbers }) => canEquationBeTrue(testValue, numbers)), // Filter valid equations
    map(({ testValue }) => testValue), // Extract valid test values
    reduce((sum, testValue) => sum + testValue, 0), // Sum up the valid test values
    tap((total) => console.log(`Total Calibration Result: `, total))
  );
}

export function part2(filePath = 'day-07/src/lib/input.txt') {
  const input = fs.readFileSync(filePath, 'utf8');

  // Evaluate the equation left-to-right given numbers and operators
  function evaluateLeftToRight(numbers: number[], operators: string[]): number {
    let result = numbers[0];
    for (let i = 0; i < operators.length; i++) {
      const operator = operators[i];
      const nextNumber = numbers[i + 1];

      if (operator === '+') {
        result += nextNumber;
      } else if (operator === '*') {
        result *= nextNumber;
      } else if (operator === '||') {
        result = parseInt(result.toString() + nextNumber.toString(), 10);
      }
    }
    return result;
  }

  // Generate all possible combinations of '+', '*', and '||' operators
  function generateOperatorCombinations(length: number): string[][] {
    if (length === 0) return [[]];
    const smallerCombinations = generateOperatorCombinations(length - 1);
    const combinations: string[][] = [];
    for (const combo of smallerCombinations) {
      combinations.push([...combo, '+']);
      combinations.push([...combo, '*']);
      combinations.push([...combo, '||']);
    }
    return combinations;
  }

  // Parse a single line into the test value and numbers
  function parseLine(line: string): { testValue: number; numbers: number[] } {
    const [testValue, numbersString] = line.split(': ');
    return {
      testValue: parseInt(testValue.trim(), 10),
      numbers: numbersString.trim().split(' ').map(Number),
    };
  }

  // Check if a test value can be achieved with given numbers and operators
  function canEquationBeTrue(testValue: number, numbers: number[]): boolean {
    const operatorCount = numbers.length - 1;
    const operatorCombinations = generateOperatorCombinations(operatorCount);

    for (const operators of operatorCombinations) {
      if (evaluateLeftToRight(numbers, operators) === testValue) {
        return true;
      }
    }
    return false;
  }

  // Main function to calculate the calibration result
  function calculateCalibrationSum(input: string) {
    const lines = input.trim().split('\n'); // Split input into lines

   return from(lines)
      .pipe(
        map(parseLine), // Parse each line
        filter(({ testValue, numbers }) =>
          canEquationBeTrue(testValue, numbers)
        ), // Filter valid equations
        map(({ testValue }) => testValue), // Extract valid test values
        reduce((sum, testValue) => sum + testValue, 0), // Sum up the valid test values
        tap((total) => console.log(`Total Calibration Result: `, total))
      )
  }

  // Call the calculation function
  return calculateCalibrationSum(input);
}
