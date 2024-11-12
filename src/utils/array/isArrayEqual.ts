/**
 * Deeply compares two arrays of objects for equality
 *
 * @param arr1 - First array to compare
 * @param arr2 - Second array to compare
 * @param options - Comparison options
 * @returns boolean indicating if arrays are deeply equal
 *
 * @example
 * ```ts
 * isArrayEqual(
 *   [{ a: 1, b: { c: 2 } }],
 *   [{ a: 1, b: { c: 2 } }]
 * ) // true
 *
 * isArrayEqual(
 *   [{ a: 1, b: { c: 2 } }],
 *   [{ a: 1, b: { c: 3 } }]
 * ) // false
 * ```
 */
interface ComparisonOptions {
  strict?: boolean; // Consider type equality (1 !== '1')
  ignoreOrder?: boolean; // Array order matters or not
  ignoreKeys?: string[]; // Keys to ignore during comparison
}

const isArrayEqual = <T extends object>(
  arr1: T[] | null | undefined,
  arr2: T[] | null | undefined,
  options: ComparisonOptions = {}
): boolean => {
  // Handle null/undefined cases
  if (arr1 === arr2) return true;
  if (!arr1 || !arr2) return false;

  // Check length equality first
  if (arr1.length !== arr2.length) return false;

  const { strict = true, ignoreOrder = false, ignoreKeys = [] } = options;

  // Helper function for deep object comparison
  const isEqual = (obj1: any, obj2: any, path: string[] = []): boolean => {
    // Handle null/undefined
    if (obj1 === obj2) return true;
    if (!obj1 || !obj2) return false;

    // Get object types
    const type1 = typeof obj1;
    const type2 = typeof obj2;

    // Type comparison in strict mode
    if (strict && type1 !== type2) return false;

    // Handle arrays recursively
    if (Array.isArray(obj1) && Array.isArray(obj2)) {
      if (obj1.length !== obj2.length) return false;

      if (ignoreOrder) {
        // Create copies for manipulation
        const remaining2 = [...obj2];

        // Try to find a match for each item in arr1
        return obj1.every((item1) => {
          const matchIndex = remaining2.findIndex((item2) =>
            isEqual(item1, item2, [...path])
          );

          if (matchIndex === -1) return false;
          // Remove the matched item
          remaining2.splice(matchIndex, 1);
          return true;
        });
      }

      return obj1.every((item, index) =>
        isEqual(item, obj2[index], [...path, index.toString()])
      );
    }

    // Handle objects
    if (type1 === 'object' && type2 === 'object') {
      const keys1 = Object.keys(obj1).filter(
        (key) => !ignoreKeys.includes([...path, key].join('.'))
      );
      const keys2 = Object.keys(obj2).filter(
        (key) => !ignoreKeys.includes([...path, key].join('.'))
      );

      // Compare filtered keys length
      if (keys1.length !== keys2.length) return false;

      // Check each key recursively
      return keys1.every((key) => {
        if (!Object.prototype.hasOwnProperty.call(obj2, key)) return false;
        return isEqual(obj1[key], obj2[key], [...path, key]);
      });
    }

    // Handle primitives
    if (strict) {
      return obj1 === obj2;
    }
    // eslint-disable-next-line eqeqeq
    return obj1 == obj2;
  };

  // Main comparison logic
  if (ignoreOrder) {
    // Use the remaining items approach for top-level array as well
    const remaining2 = [...arr2];

    return arr1.every((item1) => {
      const matchIndex = remaining2.findIndex((item2) =>
        isEqual(item1, item2, [])
      );

      if (matchIndex === -1) return false;
      remaining2.splice(matchIndex, 1);
      return true;
    });
  }

  return arr1.every((item, index) => isEqual(item, arr2[index], []));
};

export default isArrayEqual;
