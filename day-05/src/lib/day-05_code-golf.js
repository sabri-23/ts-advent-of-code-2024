const [T, I, L, P] = ['split', 'includes', 'length', 'push']; 
// Destructure common string and array methods for shorter references:
// T = 'split', I = 'includes', L = 'length', P = 'push'

i = require('fs').readFileSync(0, 'utf8').trim()[T]`\n` 
// Read input from standard input (stdin) as a UTF-8 string,
// Remove any leading/trailing whitespace with trim(),
// and split the input into an array of lines using the split method with newline as the delimiter.

r = [] 
// Initialize an empty array 'r' to store the page ordering rules.

u = [] 
// Initialize an empty array 'u' to store the updates (lists of page numbers).

i.map(l => 
  l[I]`|` 
    ? r[P](l[T]`|`.map(Number)) 
    : l[I]`,` && u[P](l[T]`,`.map(Number))
) 
// Iterate over each line 'l' in the input array 'i':
// - If the line includes a pipe character '|', it's a rule:
//     - Split the line by '|', convert each part to a number, and push the resulting array to 'r'.
// - Else if the line includes a comma ',', it's an update:
//     - Split the line by ',', convert each part to a number, and push the resulting array to 'u'.

a = b = 0 
// Initialize two counters 'a' and 'b' to zero:
// - 'a' will accumulate the sum of middle page numbers from correctly ordered updates.
// - 'b' will accumulate the sum of middle page numbers after correcting incorrectly ordered updates.

for (Z of u) { 
  // Iterate over each update 'Z' in the updates array 'u'.

  S = new Set(Z) 
  // Create a Set 'S' containing all unique page numbers in the current update 'Z'.

  M = new Map(Z.map((v, i) => [v, i])) 
  // Create a Map 'M' that maps each page number 'v' in 'Z' to its index 'i' in the array.
  // This allows quick lookup of a page's position in the update.

  if (r.every(([x, y]) => 
    !S.has(x) || !S.has(y) || M.get(x) < M.get(y)
  )) 
  // Check if all ordering rules are satisfied for the current update:
  // For every rule [x, y] in 'r':
  // - If either 'x' or 'y' is not present in the update 'Z', ignore this rule.
  // - If both 'x' and 'y' are present, ensure that 'x' appears before 'y' in 'Z'.
  
    a += Z[Z[L] >> 1] 
    // If all applicable rules are satisfied, add the middle page number of 'Z' to the counter 'a'.
    // 'Z[L] >> 1' effectively calculates the floor division of the length by 2 to find the middle index.

  else {
    G = {} 
    // Initialize an empty object 'G' to represent the adjacency list for the graph.
    // This graph will model dependencies between pages based on the ordering rules.

    D = {} 
    // Initialize an empty object 'D' to keep track of the in-degree (number of incoming edges) for each node in the graph.

    S.forEach(v => (G[v] = [], D[v] = 0)) 
    // For each page number 'v' in the Set 'S':
    // - Initialize an empty array in 'G' for adjacency list entries.
    // - Initialize the in-degree count for 'v' to zero in 'D'.

    Q = [] 
    // Initialize an empty array 'Q' to serve as a queue for the topological sort.

    r.map(([x, y]) => 
      S.has(x) && S.has(y) && (G[x][P](y), D[y]++)
    ) 
    // Iterate over each ordering rule [x, y] in 'r':
    // - If both 'x' and 'y' are present in the current update 'S':
    //     - Add 'y' to the adjacency list of 'x' in 'G'.
    //     - Increment the in-degree count of 'y' in 'D'.

    for (V in D) 
      !D[V] && Q[P](V) 
    // Iterate over each page number 'V' in 'D':
    // - If the in-degree of 'V' is zero (no dependencies), enqueue it by pushing to 'Q'.

    O = [] 
    // Initialize an empty array 'O' to store the sorted order of pages after topological sorting.

    while (Q[L]) { 
      // While there are pages in the queue 'Q':
      
      let v = Q.shift() 
      // Dequeue the first page 'v' from 'Q'.

      O[P](+v) 
      // Add the numeric value of 'v' to the sorted order array 'O'.

      G[v].map(W => { 
        if (--D[W] === 0) Q[P](W) 
      }) 
      // For each page 'W' that comes after 'v' in the adjacency list 'G[v]':
      // - Decrement the in-degree count of 'W' in 'D'.
      // - If 'W' now has an in-degree of zero, enqueue it by pushing to 'Q'.
    }

    b += O[O[L] >> 1] 
    // After sorting, add the middle page number of the sorted order 'O' to the counter 'b'.
  }
}

console.log(a, b) 