import inquirer from 'inquirer';
import { green, blue, red, yellow, cyan } from 'yoctocolors-cjs';
import { from, tap, concatMap, finalize, Observable } from 'rxjs';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { createSpinner } from 'nanospinner';

const spinner = createSpinner('').update({
  text: 'Loading\n',
  color: 'white',
  stream: process.stdout,
  frames: ['✨', '💡', '✨', '💡', '✨'],
  interval: 100,
});

export function loadSolver(
  day: string,
  part: number,
  data: string
): Observable<void> {
  return new Observable((observer) => {
    console.log('============================');
    console.log(`✨ Running ${day} - Part ${part}`);
    try {
      const dayLibraryPath = path.resolve(
        __dirname,
        `../../../${day}/dist/index`
      );
      spinner.start();

      const dayModule = require(dayLibraryPath);
      const functionName = `part${part}`;

      const filePath =
        data && data !== ''
          ? path.join(os.tmpdir(), `temp-data-${day}.txt`)
          : undefined;

      if (data && data !== '' && filePath) {
        fs.writeFileSync(filePath, data);
      }

      if (typeof dayModule[functionName] === 'function') {
        const solverObservable = dayModule[functionName](filePath);

        if (solverObservable.subscribe) {
          solverObservable.pipe().subscribe({
            next: () => observer.next(),
            error: (err: any) => observer.error(err),
            complete: () => {
              spinner.stop();
              spinner.clear();
              console.log('============================\n');
              observer.complete();
            },
          });
        } else {
          console.error(
            `The solver function ${functionName} did not return an Observable.`
          );
          observer.complete();
        }
      } else {
        observer.error(
          new Error(
            `Function ${functionName} not found in module ${dayLibraryPath}`
          )
        );
      }
    } catch (error) {
      observer.error(error);
    }
  });
}

function printBanner() {
  console.log(
    blue(`
╔██████╗  ╔██████╗  ╔██████╗
║██╔═══╝  ║██╔═══╝  ║██╔═══╝
║██║      ║██║      ║██║         - Calendar of Code CLI
║██╚═══╗  ║██╚═══╗  ║██╚═══╗
║██████║  ║██████║  ║██████║
╚══════╝  ╚══════╝  ╚══════╝
  `)
  );
  console.log(
    yellow(
      'Welcome to the Calendar of Code CLI! Solve daily challenges with ease.'
    )
  );
  console.log(green('-------------------------------------------\n'));
}

async function promptUser() {
  console.log(
    cyan('📅 Let’s get started by selecting a day and part to solve!')
  );
  try {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'day',
        message: 'Select a day to solve:',
        choices: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 25].map(
          (i) => `day-${String(i).padStart(2, '0')}`
        ),
      },
      {
        type: 'checkbox',
        name: 'parts',
        message: 'Select parts to solve (you can choose both):',
        choices: [
          { name: 'Part 1', value: 1 },
          { name: 'Part 2', value: 2 },
        ],
        default: [1, 2],
        validate: (input) =>
          input.length > 0 ? true : red('You must select at least one part.'),
      },
      {
        type: 'confirm',
        name: 'provideData',
        message: 'Do you want to provide exercise data?',
        default: false,
      },
      {
        type: 'editor',
        name: 'input',
        default: '',
        message: 'Provide day input data or press Enter to use default:',
        when: (answers) => answers.provideData,
        waitForUseInput: false,
      },
    ]);
    return answers;
  } catch (error) {
    if (error instanceof Error && error.name === 'ExitPromptError') {
      // noop; silence this error
      return { day: '', parts: [], input: '' };
    } else {
      throw error;
    }
  }
}

async function promptStartAgain() {
  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'again',
      message: 'Do you want to run another day?',
    },
  ]);

  return answers.again;
}

export function main() {
  printBanner();

  const run = () => {
    from(promptUser())
      .pipe(
        tap(({ day, parts }) => {
          console.log(blue(`\n🌟 Solving ${day}, Parts: ${parts.join(', ')}`));
        }),
        concatMap(({ day, parts, input }) =>
          from(parts).pipe(
            // For each part, load and execute the solver
            concatMap((part: any) =>
              loadSolver(day, part, input).pipe(
                tap(() => console.log(green('✅ Task completed!'))),
                tap(() =>
                  input && input !== ''
                    ? fs.unlinkSync(
                        path.join(os.tmpdir(), `temp-data-${day}.txt`)
                      )
                    : null
                )
              )
            )
          )
        ),
        finalize(async () => {
          console.log(cyan('🎉 All tasks completed!'));
          const again = await promptStartAgain();
          if (again) {
            run();
          } else {
            console.log(green('Goodbye!'));
          }
        })
      )
      .subscribe({
        error: (err) => console.error('An error occurred:', err),
      });
  };

  run();
}

main();
