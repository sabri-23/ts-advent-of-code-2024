import { from, filter, scan, tap, reduce, map } from 'rxjs';
import * as fs from 'fs';

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

interface ParsingState2 extends ParsingState {
  position: number;
  enabled: boolean;
}

export function part1(filePath = 'day-03/src/lib/input.txt') {
  const input = fs.readFileSync(filePath, 'utf8');
  const validMatches = ['m', 'mu', 'mul', 'mul('];

  return from(input).pipe(
    scan<string, ParsingState>(
      (state, char) => {
        const nextState = (newState: Partial<ParsingState>) => ({
          ...state,
          ...newState,
          position: state.position + 1,
        });
        const resetState = (newMatch = '') =>
          nextState({
            state: State.Searching,
            num1: '',
            num2: '',
            match: newMatch,
          });

        switch (state.state) {
          case State.Searching: {
            const updatedMatch = state.match + char;

            if (validMatches.includes(updatedMatch)) {
              return nextState({
                match: updatedMatch,
                state:
                  updatedMatch === 'mul('
                    ? State.CollectingNumber1
                    : State.Searching,
              });
            } else {
              return resetState(char === 'm' ? char : '');
            }
          }
          case State.CollectingNumber1: {
            if (char === ',') {
              return nextState({
                state: State.AfterNumber1,
                match: state.match + char,
              });
            } else if (/[0-9]/.test(char)) {
              return nextState({
                match: state.match + char,
                num1: state.num1 + char,
              });
            } else {
              return resetState(char === 'm' ? char : '');
            }
          }
          case State.AfterNumber1:
            return /[0-9]/.test(char)
              ? nextState({
                  state: State.CollectingNumber2,
                  match: state.match + char,
                  num2: char,
                })
              : resetState(char === 'm' ? char : '');

          case State.CollectingNumber2:
            return char === ')'
              ? nextState({
                  state: State.Completed,
                  match: state.match + char,
                })
              : /[0-9]/.test(char)
              ? nextState({
                  match: state.match + char,
                  num2: state.num2 + char,
                })
              : resetState(char === 'm' ? char : '');

          default:
            return resetState(char === 'm' ? char : '');
        }
      },
      { state: State.Searching, num1: '', num2: '', match: '', position: 0 }
    ),
    filter((state) => state.state === State.Completed),
    map(({ num1, num2 }) => {
      return +num1 * +num2;
    }),
    reduce((sum, product) => sum + product, 0),
    tap((finalTotal) => {
      console.log(
        `[INFO] Total sum of all valid multiplications: ${finalTotal}`
      );
    })
  );
}

export function part2(filePath = 'day-03/src/lib/input.txt') {
  const input = fs.readFileSync(filePath, 'utf8');

  const validMatches = [
    ...['m', 'mu', 'mul', 'mul(', 'd', 'do', 'do('],
    ...['do()', 'don', "don'", "don't", "don't(", "don't()"],
  ];

  return from(input).pipe(
    scan<string, ParsingState2>(
      (state, char) => {
        const nextState = (newState: Partial<ParsingState2>) => ({
          ...state,
          ...newState,
          position: state.position + 1,
        });

        const resetState = (newMatch = '') =>
          nextState({
            state: State.Searching,
            num1: '',
            num2: '',
            match: newMatch,
          });

        const isValidMatch = (match: string) => validMatches.includes(match);

        switch (state.state) {
          case State.Searching: {
            const updatedMatch = state.match + char;
            const enabled =
              updatedMatch === 'do()'
                ? true
                : updatedMatch === "don't()"
                ? false
                : state.enabled;

            return isValidMatch(updatedMatch)
              ? nextState({
                  match: updatedMatch,
                  state:
                    updatedMatch === 'mul('
                      ? State.CollectingNumber1
                      : State.Searching,
                  enabled,
                })
              : resetState(char === 'm' || char === 'd' ? char : '');
          }

          case State.CollectingNumber1:
            return char === ',' && state.enabled
              ? nextState({
                  state: State.AfterNumber1,
                  match: state.match + char,
                })
              : /[0-9]/.test(char)
              ? nextState({
                  match: state.match + char,
                  num1: state.num1 + char,
                })
              : resetState(char === 'm' || char === 'd' ? char : '');

          case State.AfterNumber1:
            return /[0-9]/.test(char) && state.enabled
              ? nextState({
                  state: State.CollectingNumber2,
                  match: state.match + char,
                  num2: char,
                })
              : resetState(char === 'm' || char === 'd' ? char : '');

          case State.CollectingNumber2:
            return char === ')' && state.enabled
              ? nextState({
                  match: state.match + char,
                  state: State.Completed,
                })
              : /[0-9]/.test(char)
              ? nextState({
                  match: state.match + char,
                  num2: state.num2 + char,
                })
              : resetState(char === 'm' || char === 'd' ? char : '');

          default:
            return resetState(char === 'm' || char === 'd' ? char : '');
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
    filter((state) => state.state === State.Completed),
    map(({ num1, num2 }) => {
      return +num1 * +num2;
    }),
    reduce((sum, product) => sum + product, 0),
    tap((finalTotal) => {
      console.log(
        `[INFO] Total sum of all valid multiplications: ${finalTotal}`
      );
    })
  );
}
