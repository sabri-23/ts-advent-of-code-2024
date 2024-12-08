import inquirer from 'inquirer';
import { green, blue, red, yellow, cyan } from 'yoctocolors-cjs';
import { from, tap, concatMap, finalize } from 'rxjs';
import path from 'path';

export async function loadSolver(
  day: string,
  part: number,
  filePath: string
): Promise<void> {
  try {
    const dayLibraryPath = path.resolve(
      __dirname,
      `../../../${day}/dist/index`
    );
    // Debug: Log the resolved path
    // console.log('Resolved dayLibraryPath:', dayLibraryPath);

    // Dynamically require the module
    const dayModule = require(dayLibraryPath);

    const functionName = `part${part}`;
    if (typeof dayModule[functionName] === 'function') {
      console.log('============================');
      dayModule[functionName](filePath);
      console.log('============================');
      console.log('\n\n');
    } else {
      console.error(
        `Function ${functionName} not found in module ${dayLibraryPath}`
      );
    }
  } catch (error) {
    console.error(`Error loading solver for ${day}, part ${part}:`, error);
  }
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
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'day',
      message: 'Select a day to solve:',
      choices: Array.from(
        { length: 6 },
        (_, i) => `day-${String(i + 1).padStart(2, '0')}`
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
      default:[1,2],
      validate: (input) =>
        input.length > 0 ? true : red('You must select at least one part.'),
    },
    {
      type: 'input',
      name: 'filePath',
      message: 'Provide the path to the input file (.txt):',
      default: `<day>/src/lib/input-<part>.txt`, // Default path
      // validate: (input) => {
      //     if (fs.existsSync(input) && path.extname(input) === '.txt') {
      //         return true;
      //     }
      //     return red(
      //         'File not found or not a .txt file. Please provide a valid path.'
      //     );
      // },
    },
  ]);

  return answers;
}

export function main() {
  printBanner();

  from(promptUser())
    .pipe(
      tap(({ day, parts, filePath }) => {
        console.log(blue(`\n🌟 Solving ${day}, Parts: ${parts.join(', ')}`));
        console.log(cyan(`📂 Using input file: ${filePath}\n`));
      }),
      concatMap(({ day, parts, filePath }) =>
        from(parts).pipe(
          // For each part, load and execute the solver
          concatMap((part: any) =>
            from(loadSolver(day, part, filePath.replace('<day>',day).replace('<part>',part))).pipe(
              tap(() => console.log(green(`✨ Running ${day} - Part ${part}`))),
              tap(() => console.log(green('✅ Task completed!')))
            )
          )
        )
      ),
      finalize(() => console.log(cyan('🎉 All tasks completed!')))
    )
    .subscribe({
      error: (err) => console.error('An error occurred:', err),
    });
}

main();
