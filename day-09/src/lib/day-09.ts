// import { from, Observable } from 'rxjs';
// import { map, tap } from 'rxjs/operators';
// import * as fs from 'fs';
// import path from 'path';

// export function part1(
//   filePath = 'day-09/src/lib/input-1.txt'
// ): Observable<number> {
//   const input = fs.readFileSync(filePath, 'utf8').trim();

//   // Step 1: Parse the disk map into a usable array
//   const parseDiskMap = (diskMap: string): (number | '.')[] => {
//     const elements = diskMap.split('').map(Number);
//     const disk: (number | '.')[] = [];
//     let fileId = 0;

//     for (let i = 0; i < elements.length; i++) {
//       const size = elements[i];

//       // Validate the size is a non-negative integer
//       if (Number.isNaN(size) || size < 0) {
//         throw new Error(
//           `Invalid size encountered in disk map: ${size} at index ${i}`
//         );
//       }

//       if (i % 2 === 0) {
//         // Add file blocks with file ID
//         disk.push(...new Array(size).fill(fileId));
//         fileId++;
//       } else {
//         // Add free space blocks
//         disk.push(...new Array(size).fill('.'));
//       }
//     }

//     return disk;
//   };

//   // Step 2: Compact the disk by moving one block at a time
//   const compactDisk = (disk: (number | '.')[]): (number | '.')[] => {
//     const compacted = [...disk];

//     for (let i = compacted.length - 1; i >= 0; i--) {
//       if (compacted[i] !== '.') {
//         // Find the first free space to the left
//         const leftmostFree = compacted.indexOf('.');
//         if (leftmostFree !== -1 && leftmostFree < i) {
//           compacted[leftmostFree] = compacted[i];
//           compacted[i] = '.';
//         }
//       }
//     }

//     return compacted;
//   };

//   // Step 3: Calculate the checksum
//   const calculateChecksum = (disk: any[]): number => {
//     const total = disk.reduce(
//       (checksum, block, position) =>
//         block !== '.' ? checksum + position * (block as number) : checksum,
//       0
//     );

//     console.log(`Final filesystem checksum: ${total}`);

//     return total;
//   };
//   console.log('part0');

//   // Parse the input, compact the disk, and calculate the checksum
//   const disk = parseDiskMap(input);
//   console.log('part2');

//   const compactedDisk = compactDisk(disk);

//   console.log('part3');

//   // Return the checksum as an observable
//   return from([compactedDisk]).pipe(
//     map((finalDisk) => calculateChecksum(finalDisk))
//     // tap((checksum) => console.log(`Final filesystem checksum: ${checksum}`)),
//     // finalize(() => console.log(`Final filesystem checksum: `))
//   );
// }

// // part1().subscribe();

// export function part2(
//   filePath = 'day-09/src/lib/input-2.txt'
// ): Observable<number> {
//   const input = fs.readFileSync(path.resolve(filePath), 'utf8').trim();

//   // Reuse the parse function from part1 if desired
//   const parseDiskMap = (diskMap: string): (number | '.')[] => {
//     const elements = diskMap.split('').map(Number);
//     const disk: (number | '.')[] = [];
//     let fileId = 0;

//     for (let i = 0; i < elements.length; i++) {
//       const size = elements[i];

//       // Validate the size is a non-negative integer
//       if (Number.isNaN(size) || size < 0) {
//         throw new Error(
//           `Invalid size encountered in disk map: ${size} at index ${i}`
//         );
//       }

//       if (i % 2 === 0) {
//         // Add file blocks with file ID
//         disk.push(...new Array(size).fill(fileId));
//         fileId++;
//       } else {
//         // Add free space blocks
//         disk.push(...new Array(size).fill('.'));
//       }
//     }

//     return disk;
//   };

//   const calculateChecksum = (disk: any[]): number => {
//     return disk.reduce(
//       (checksum, block, position) =>
//         block !== '.' ? +checksum + position * (block as number) : checksum,
//       0
//     );
//   };

//   /**
//    * Attempt to compact the disk by moving whole files according to Part Two's rules:
//    * - Move files in order of decreasing file ID.
//    * - For each file, find the leftmost contiguous run of free space that can hold the entire file,
//    *   which lies entirely to the left of the file's current position.
//    * - If found, move the file there; if not, do nothing.
//    */
//   const compactDiskPart2 = (disk: (number | '.')[]): (number | '.')[] => {
//     // Identify the maximum file ID
//     const fileIds = disk
//       .filter((block) => block !== '.')
//       .map((b) => b as number);
//     const maxFileId = Math.max(...fileIds);

//     // Helper to find file's start, length, and end indices.
//     const getFileInfo = (diskArr: (number | '.')[], fid: number) => {
//       const positions = diskArr
//         .map((val, idx) => (val === fid ? idx : -1))
//         .filter((idx) => idx !== -1);
//       if (positions.length === 0) return null; // File not found
//       return {
//         start: positions[0],
//         end: positions[positions.length - 1],
//         length: positions.length,
//       };
//     };

//     // Find a suitable spot for the file: a contiguous run of '.' to the left of fileStart with length >= fileLength
//     const findSpotForFile = (
//       diskArr: (number | '.')[],
//       fileStart: number,
//       fileLength: number
//     ): number | null => {
//       // We'll scan from the left of the disk to just before the fileStart
//       // looking for a contiguous run of '.' of at least `fileLength`.
//       let runStart = -1;
//       let runLength = 0;
//       let bestSpot: number | null = null;

//       for (let i = 0; i < fileStart; i++) {
//         if (diskArr[i] === '.') {
//           if (runStart === -1) {
//             runStart = i;
//             runLength = 1;
//           } else {
//             runLength++;
//           }
//         } else {
//           // End of a run of '.' encountered
//           if (runLength >= fileLength) {
//             // This run is big enough. Since we search left-to-right, the first found will be the leftmost
//             bestSpot = runStart;
//             break; // We want the leftmost, so can break immediately.
//           }
//           // Reset run
//           runStart = -1;
//           runLength = 0;
//         }
//       }

//       // Check the last run if ended at the disk edge
//       if (bestSpot === null && runLength >= fileLength) {
//         bestSpot = runStart;
//       }

//       return bestSpot;
//     };

//     const newDisk = [...disk];

//     // Move files in decreasing order of file ID
//     for (let fid = maxFileId; fid >= 0; fid--) {
//       const info = getFileInfo(newDisk, fid);
//       if (!info) continue; // File not found (it might have been moved?)

//       // Attempt to find a suitable spot
//       const spot = findSpotForFile(newDisk, info.start, info.length);
//       if (spot !== null) {
//         // Move the entire file
//         // Clear the file's old position
//         for (let i = info.start; i <= info.end; i++) {
//           newDisk[i] = '.';
//         }
//         // Place it starting at 'spot'
//         for (let i = 0; i < info.length; i++) {
//           newDisk[spot + i] = fid;
//         }
//       }
//       // If no spot found, do nothing (file remains in place)
//     }

//     return newDisk;
//   };

//   const disk = parseDiskMap(input);
//   const compactedDisk = compactDiskPart2(disk);

//   return from([compactedDisk]).pipe(
//     map((finalDisk) => calculateChecksum(finalDisk)),
//     tap((checksum) =>
//       console.log(`Final filesystem checksum (part2): ${checksum}`)
//     )
//   );
// }

// // part2().subscribe(); // 6415184586041

import { from, Observable } from 'rxjs';
import { tap, reduce } from 'rxjs/operators';
import * as fs from 'fs';
import path from 'path';

export function part1(
  filePath = 'day-09/src/lib/input-1.txt'
): Observable<number> {
  const input = fs.readFileSync(filePath, 'utf8').trim();

  const parseDiskMap = (diskMap: string): (number | '.')[] => {
    const elements = diskMap.split('').map(Number);
    const disk: (number | '.')[] = [];
    let fileId = 0;

    for (let i = 0; i < elements.length; i++) {
      const size = elements[i];

      if (Number.isNaN(size) || size < 0) {
        throw new Error(
          `Invalid size encountered in disk map: ${size} at index ${i}`
        );
      }

      if (i % 2 === 0) {
        disk.push(...new Array(size).fill(fileId));
        fileId++;
      } else {
        disk.push(...new Array(size).fill('.'));
      }
    }

    return disk;
  };

  const compactDisk = (disk: (number | '.')[]): (number | '.')[] => {
    const compacted = [...disk];

    for (let i = compacted.length - 1; i >= 0; i--) {
      if (compacted[i] !== '.') {
        const leftmostFree = compacted.indexOf('.');
        if (leftmostFree !== -1 && leftmostFree < i) {
          compacted[leftmostFree] = compacted[i];
          compacted[i] = '.';
        }
      }
    }

    return compacted;
  };

  const disk = parseDiskMap(input);
  const compactedDisk = compactDisk(disk);

  return from(compactedDisk).pipe(
    reduce(
      (checksum, block, position) =>
        block !== '.' ? checksum + position * (block as number) : checksum,
      0
    ),
    tap((checksum) => console.log(`Final filesystem checksum: `, checksum))
  );
}

export function part2(
  filePath = 'day-09/src/lib/input-2.txt'
): Observable<number> {
  const input = fs.readFileSync(path.resolve(filePath), 'utf8').trim();

  const parseDiskMap = (diskMap: string): (number | '.')[] => {
    const elements = diskMap.split('').map(Number);
    const disk: (number | '.')[] = [];
    let fileId = 0;

    for (let i = 0; i < elements.length; i++) {
      const size = elements[i];

      if (Number.isNaN(size) || size < 0) {
        throw new Error(
          `Invalid size encountered in disk map: ${size} at index ${i}`
        );
      }

      if (i % 2 === 0) {
        disk.push(...new Array(size).fill(fileId));
        fileId++;
      } else {
        disk.push(...new Array(size).fill('.'));
      }
    }

    return disk;
  };

  const compactDiskPart2 = (disk: (number | '.')[]): (number | '.')[] => {
    const fileIds = disk
      .filter((block) => block !== '.')
      .map((b) => b as number);
    const maxFileId = Math.max(...fileIds);

    const getFileInfo = (diskArr: (number | '.')[], fid: number) => {
      const positions = diskArr
        .map((val, idx) => (val === fid ? idx : -1))
        .filter((idx) => idx !== -1);
      if (positions.length === 0) return null;
      return {
        start: positions[0],
        end: positions[positions.length - 1],
        length: positions.length,
      };
    };

    const findSpotForFile = (
      diskArr: (number | '.')[],
      fileStart: number,
      fileLength: number
    ): number | null => {
      let runStart = -1;
      let runLength = 0;
      let bestSpot: number | null = null;

      for (let i = 0; i < fileStart; i++) {
        if (diskArr[i] === '.') {
          if (runStart === -1) {
            runStart = i;
            runLength = 1;
          } else {
            runLength++;
          }
        } else {
          if (runLength >= fileLength) {
            bestSpot = runStart;
            break;
          }
          runStart = -1;
          runLength = 0;
        }
      }

      if (bestSpot === null && runLength >= fileLength) {
        bestSpot = runStart;
      }

      return bestSpot;
    };

    const newDisk = [...disk];

    for (let fid = maxFileId; fid >= 0; fid--) {
      const info = getFileInfo(newDisk, fid);
      if (!info) continue;

      const spot = findSpotForFile(newDisk, info.start, info.length);
      if (spot !== null) {
        for (let i = info.start; i <= info.end; i++) {
          newDisk[i] = '.';
        }
        for (let i = 0; i < info.length; i++) {
          newDisk[spot + i] = fid;
        }
      }
    }

    return newDisk;
  };

  const disk = parseDiskMap(input);
  const compactedDisk = compactDiskPart2(disk);

  return from(compactedDisk).pipe(
    reduce(
      (checksum, block, position) =>
        block !== '.' ? checksum + position * (block as number) : checksum,
      0
    ),
    tap((checksum) =>
      console.log(`Final filesystem checksum: `, checksum)
    )
  );
}
