# Advent of Code with RxJS and TypeScript

Welcome to my Advent of Code (AoC) challenge repository! 🌟🎄

## About Advent of Code
Advent of Code is an advent calendar of small programming puzzles for a variety of skill levels. These puzzles can be solved in any programming language.

Learn more about AoC on their official website: [Advent of Code](https://adventofcode.com)

---

## My Advent of Code Setup

### Installation
To get started, clone this repository and install the dependencies from the root directory:

```bash
npm install
```

### Tools of the Trade
- **Language**: [TypeScript](https://www.typescriptlang.org)
- **Framework**: [Nx](https://nx.dev)
- **Paradigm**: Everything is a stream! Using [RxJS](https://rxjs.dev) as much as possible to make this a functional, reactive adventure.

### Running Each Day’s Solution
Each day’s puzzle lives as its own module in this Nx repository. To run a specific day’s solution, use the following command:

```bash
npm start
# or
npm run run-a-day
```

### The Challenge

**Goal**: Solve puzzles reactively, embrace functional programming, and have fun!

**Code Golf: Day 05**: Aditionnal solution can be found in day-05. You can run them using `node day-05_code-golf_minify.js < input.txt`


---

## Why RxJS?

RxJS makes problem-solving a thrilling ride by turning every input into a stream and letting you compose solutions in imaginative ways. 

Each puzzle becomes an opportunity to flex reactive muscles—filtering, mapping, merging, and zipping data streams together like a coding wizard. It's not just about solving puzzles; it's about doing it with style!

![Everything is a Stream](./assets/everything_stream.png)

---

## Repo Structure
Each day’s solution is a separate module within the Nx repository. Here’s a high-level structure:

```
├── day-01
├── day-02
├── day-03
├── ...
├── package.json
└── README.md
```
---

### Final Words 🎄🎉

As you embark on this reactive coding journey, remember:

- When in doubt, map it out.
- FlatMap your frustrations.
- Catch errors, but don’t let them debounce your spirit.


Happy coding, and may your observables always emit joy and success! 🚀
<pre>
   🎄 Advent Calendar 🎄
+---+---+---+---+---+---+
|&nbsp;1̶&nbsp;|&nbsp;2̶&nbsp;|&nbsp;3̶&nbsp;|&nbsp;4̶&nbsp;|&nbsp;5̶&nbsp;|&nbsp;6̶&nbsp;|
+---+---+---+---+---+---+
|&nbsp;7̶&nbsp;|&nbsp;8̶&nbsp;|&nbsp;9̶&nbsp;|1̶0̶&nbsp;|1̶2̶&nbsp;|1̶2̶&nbsp;|
+---+---+---+---+---+---+
|1̶3̶&nbsp;|1̶4̶&nbsp;|15&nbsp;|16&nbsp;|17&nbsp;|18&nbsp;|
+---+---+---+---+---+---+
|19&nbsp;|20&nbsp;|21&nbsp;|22&nbsp;|23&nbsp;|24&nbsp;|
+---+---+---+---+---+---+
|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;🎁🎅&nbsp;2̶5̶&nbsp;🎁&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|
+-----------------------+
    Count down to joy!
</pre>