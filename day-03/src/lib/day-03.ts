import { from, filter, scan, tap, reduce, map } from 'rxjs';
import { input1 } from './input-part-1';
import { input2 } from './input-part-2';

console.log('========== PART 1 ==========');
part1();
console.log('============================');
console.log('\n\n')
console.log('========== PART 2 ==========');
part2();
console.log('============================');

export function part1() {
  const inputString = input1;

  enum State {
    Searching,
    CollectingNumber1,
    AfterNumber1,
    CollectingNumber2,
    Completed,
  }

  interface ParsingState {
    state: State;
    num1: string;
    num2: string;
    match: string;
    position: number;
  }

  let totalSum = 0;
  let validCount = 0;
  const milestones = [0.25, 0.5, 0.75, 1].map((fraction) =>
    Math.floor(inputString.length * fraction)
  );

  from(inputString)
    .pipe(
      scan<string, ParsingState>(
        (state, char) => {
          state = { ...state, position: state.position + 1 };
          switch (state.state) {
            case State.Searching: {
              const updatedMatch = state.match + char;

              // Reset if invalid or continue accumulating
              return ['m', 'mu', 'mul', 'mul('].indexOf(updatedMatch) > -1
                ? {
                    ...state,
                    match: updatedMatch,
                    state:
                      updatedMatch !== 'mul('
                        ? State.Searching
                        : State.CollectingNumber1,
                  }
                : {
                    ...state,
                    state: State.Searching,
                    match: char === 'm' ? char : '',
                  };
            }

            case State.CollectingNumber1:
              return char === ','
                ? {
                    ...state,
                    state: State.AfterNumber1,
                    match: state.match + char,
                  }
                : /[0-9]/.test(char)
                ? {
                    ...state,
                    match: state.match + char,
                    num1: state.num1 + char,
                  }
                : {
                    state: State.Searching,
                    num1: '',
                    num2: '',
                    match: char === 'm' ? char : '',
                    position: state.position,
                  };

            case State.AfterNumber1:
              return /[0-9]/.test(char)
                ? {
                    ...state,
                    state: State.CollectingNumber2,
                    match: state.match + char,
                    num2: char,
                  }
                : {
                    state: State.Searching,
                    num1: '',
                    num2: '',
                    match: char === 'm' ? char : '',
                    position: state.position,
                  };

            case State.CollectingNumber2:
              return char === ')'
                ? {
                    ...state,
                    match: state.match + char,
                    state: State.Completed,
                  }
                : /[0-9]/.test(char)
                ? {
                    ...state,
                    match: state.match + char,
                    num2: state.num2 + char,
                  }
                : {
                    state: State.Searching,
                    num1: '',
                    num2: '',
                    match: char === 'm' ? char : '',
                    position: state.position,
                  };

            default:
              return {
                state: State.Searching,
                num1: '',
                num2: '',
                match: char === 'm' ? char : '',
                position: state.position,
              };
          }
        },
        { state: State.Searching, num1: '', num2: '', match: '', position: 0 }
      ),
      tap((state) => {
        if (milestones.includes(state.position)) {
          const percent = Math.floor(
            (state.position / inputString.length) * 100
          );
          console.log(`[MILESTONE] ${percent}% processed.`);
          console.log(`[STATS] Valid instructions so far: ${validCount}`);
          console.log(`[STATS] Running total sum: ${totalSum}`);
        }
      }),
      filter((state) => state.state === State.Completed),
      map(({ num1, num2 }) => {
        return +num1 * +num2;
      }), // Compute product
      tap((product) => {
        totalSum += product;
        validCount++;
      }),
      reduce((sum, product) => sum + product, 0), // Sum all products
      tap((finalTotal) => {
        console.log(
          `[INFO] Total sum of all valid multiplications: ${finalTotal}`
        );
      }) // 209361043
    )
    .subscribe({
      error: (err) => console.error(`[ERROR] ${err}`),
    });
}

export function part2() {
  const inputString = input2;

  enum State {
    Searching,
    CollectingNumber1,
    AfterNumber1,
    CollectingNumber2,
    Completed,
  }

  interface ParsingState {
    state: State;
    num1: string;
    num2: string;
    match: string;
    position: number;
    enabled: boolean;
  }

  let totalSum = 0;
  let validCount = 0;
  const milestones = [0.25, 0.5, 0.75, 1].map((fraction) =>
    Math.floor(inputString.length * fraction)
  );

  from(inputString)
    .pipe(
      scan<string, ParsingState>(
        (state, char) => {
          state = { ...state, position: state.position + 1 };
          switch (state.state) {
            case State.Searching: {
              const updatedMatch = state.match + char;

              // Reset if invalid or continue accumulating
              return [
                'm',
                'mu',
                'mul',
                'mul(',
                'd',
                'do',
                'do(',
                'do()',
                'don',
                "don'",
                "don't",
                "don't(",
                "don't()",
              ].indexOf(updatedMatch) > -1
                ? {
                    ...state,
                    match: updatedMatch,
                    state:
                      updatedMatch !== 'mul('
                        ? State.Searching
                        : State.CollectingNumber1,
                    enabled:
                      updatedMatch === 'do()'
                        ? true
                        : updatedMatch === "don't()"
                        ? false
                        : state.enabled,
                  }
                : {
                    ...state,
                    state: State.Searching,
                    match: char === 'm' || char === 'd' ? char : '',
                  };
            }

            case State.CollectingNumber1:
              return char === ',' && state.enabled
                ? {
                    ...state,
                    state: State.AfterNumber1,
                    match: state.match + char,
                  }
                : /[0-9]/.test(char)
                ? {
                    ...state,
                    match: state.match + char,
                    num1: state.num1 + char,
                  }
                : {
                    ...state,
                    state: State.Searching,
                    num1: '',
                    num2: '',
                    match: char === 'm' || char === 'd' ? char : '',
                  };

            case State.AfterNumber1:
              return /[0-9]/.test(char) && state.enabled
                ? {
                    ...state,
                    state: State.CollectingNumber2,
                    match: state.match + char,
                    num2: char,
                  }
                : {
                    ...state,
                    state: State.Searching,
                    num1: '',
                    num2: '',
                    match: char === 'm' || char === 'd' ? char : '',
                  };

            case State.CollectingNumber2:
              return char === ')' && state.enabled
                ? {
                    ...state,
                    match: state.match + char,
                    state: State.Completed,
                  }
                : /[0-9]/.test(char)
                ? {
                    ...state,
                    match: state.match + char,
                    num2: state.num2 + char,
                  }
                : {
                    ...state,
                    state: State.Searching,
                    num1: '',
                    num2: '',
                    match: char === 'm' || char === 'd' ? char : '',
                  };

            default:
              return {
                ...state,
                state: State.Searching,
                num1: '',
                num2: '',
                match: char === 'm' || char === 'd' ? char : '',
              };
          }
        },
        {
          state: State.Searching,
          num1: '',
          num2: '',
          match: '',
          position: 0,
          enabled: true,
        }
      ),
      tap((state) => {
        if (milestones.includes(state.position)) {
          const percent = Math.floor(
            (state.position / inputString.length) * 100
          );
          console.log(`[MILESTONE] ${percent}% processed.`);
          console.log(`[STATS] Valid instructions so far: ${validCount}`);
          console.log(`[STATS] Running total sum: ${totalSum}`);
        }
      }),
      filter((state) => state.state === State.Completed),
      map(({ num1, num2 }) => {
        return +num1 * +num2;
      }), // Compute product
      tap((product) => {
        totalSum += product;
        validCount++;
      }),
      reduce((sum, product) => sum + product, 0), // Sum all products
      tap((finalTotal) => {
        console.log(
          `[INFO] Total sum of all valid multiplications: ${finalTotal}`
        );
      }) // 209361043
    )
    .subscribe({
      error: (err) => console.error(`[ERROR] ${err}`),
    });
}
