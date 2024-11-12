/**
 * Checks if value is an Array
 *
 * @param value - The value to check
 * @returns True if value is an array, otherwise false
 * @example
 * ```ts
 * isArray([1, 2, 3]) // true
 * isArray('not array') // false
 * isArray({ length: 1 }) // false
 * isArray(null) // false
 * ```
 */
const isArray = <T = unknown>(value: unknown): value is Array<T> => {
  return Array.isArray(value);
};

export default isArray;
