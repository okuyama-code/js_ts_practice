/**
 * 例1:
 * @param num  10
 * @returns [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
 *
 * 例２:
 * @param num 10, 20
 * @returns [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
 */

export function createNumberArray(start: number, end?: number): number[] {
  if (end === undefined) {
    return Array.from({ length: start }, (_, i) => i + 1);
  }
  console.log(end - start + 1)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

console.log(createNumberArray(10))
console.log(createNumberArray(10, 20))