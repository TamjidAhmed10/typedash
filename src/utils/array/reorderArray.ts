/**
 * Specifies where custom-ordered items should appear in the sorted array
 * @typedef {'start' | 'end'} OrderDirection
 */
type OrderDirection = 'start' | 'end';

/**
 * Configuration for sorting by a single key
 * @template T The type of objects in the array
 * @typedef {Object} SingleReorderConfig
 * @property {NestedKeyOf<T>} key - The object key to sort by (supports dot notation for nested properties)
 * @property {any[]} [customOrder] - Optional array defining custom ordering priority
 * @property {OrderDirection} [direction='start'] - Where to place custom ordered items
 * @property {boolean} [ascending=true] - Sort direction for non-custom items
 */
interface SingleReorderConfig<T extends object> {
  key: NestedKeyOf<T>;
  customOrder?: any[];
  direction?: OrderDirection;
  ascending?: boolean;
}

/**
 * Array of sort configurations
 * @template T The type of objects in the array
 * @typedef {SingleReorderConfig<T>[]} ReorderConfig
 */
type ReorderConfig<T extends object> = SingleReorderConfig<T>[];

/**
 * Helper type to get all possible nested paths of an object type using dot notation
 * @template ObjectType The type to extract nested paths from
 * @example
 * type User = { profile: { name: string; age: number } };
 * // NestedKeyOf<User> = 'profile' | 'profile.name' | 'profile.age'
 */
type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

/**
 * Reorders an array of objects based on one or more sort configurations.
 * Supports nested property access, custom ordering, and mixed data types.
 *
 * @template T The type of objects in the array
 * @param {T[]} array - The array to reorder
 * @param {ReorderConfig<T>} configs - Array of sort configurations
 * @returns {T[]} A new sorted array
 *
 * @example
 * // Simple sort by a single property
 * reorderArray(users, [{ key: 'age', ascending: true }]);
 *
 * @example
 * // Sort with custom ordering
 * reorderArray(items, [{
 *   key: 'status',
 *   customOrder: ['active', 'pending'],
 *   direction: 'start'
 * }]);
 *
 * @example
 * // Sort by nested property
 * reorderArray(users, [{ key: 'profile.address.city' }]);
 *
 * @example
 * // Multiple sort conditions
 * reorderArray(items, [
 *   { key: 'priority', customOrder: ['high', 'medium'] },
 *   { key: 'date', ascending: false }
 * ]);
 *
 * @throws {Error} If the array or configs parameters are invalid
 */
function reorderArray<T extends object>(
  array: T[],
  configs: ReorderConfig<T>
): T[] {
  return [...array].sort((a, b) => {
    for (const config of configs) {
      const {
        key,
        customOrder = [],
        direction = 'start',
        ascending = true,
      } = config;

      // Get nested values using the key path
      const aValue = getNestedValue(a, key as string);
      const bValue = getNestedValue(b, key as string);

      // Skip to next key if values are equal
      if (aValue === bValue) continue;

      // Create order map for current key
      const orderMap = new Map(
        customOrder.map((value, index) => [value, index])
      );

      const aIndex = orderMap.get(aValue);
      const bIndex = orderMap.get(bValue);

      // Both items are in custom order
      if (aIndex !== undefined && bIndex !== undefined) {
        return aIndex - bIndex;
      }

      // Handle cases where only one item is in custom order
      if (aIndex !== undefined) return direction === 'start' ? -1 : 1;
      if (bIndex !== undefined) return direction === 'start' ? 1 : -1;

      // Neither item is in custom order - use consistent type-aware sorting
      const sortResult = compareValues(aValue, bValue);
      return ascending ? sortResult : -sortResult;
    }

    return 0; // All keys are equal
  });
}

/**
 * Helper function to get nested property value using dot notation
 * @param {any} obj - The object to get the value from
 * @param {string} path - The path to the property (e.g., 'user.address.city')
 * @returns {any} The value at the specified path or undefined if not found
 * @private
 */
function getNestedValue(obj: any, path: string): any {
  return path
    .split('.')
    .reduce(
      (current, key) =>
        current && current[key] !== undefined ? current[key] : undefined,
      obj
    );
}

/**
 * Helper function to compare mixed types consistently
 * @param {any} a - First value to compare
 * @param {any} b - Second value to compare
 * @returns {number} -1 if a < b, 1 if a > b, 0 if equal
 * @private
 */
function compareValues(a: any, b: any): number {
  // Handle null/undefined
  if (a === null || a === undefined)
    return b === null || b === undefined ? 0 : 1;
  if (b === null || b === undefined) return -1;

  // If both values are objects, compare their string representations
  if (typeof a === 'object' && typeof b === 'object') {
    return JSON.stringify(a) < JSON.stringify(b) ? -1 : 1;
  }

  // If types are different, order by type priority
  if (typeof a !== typeof b) {
    return getTypePriority(a) - getTypePriority(b);
  }

  // Same type - use standard comparison
  return a < b ? -1 : 1;
}

/**
 * Helper function to get type priority for consistent ordering
 * @param {any} value - The value to get priority for
 * @returns {number} Priority value (lower = higher priority)
 * @private
 */
function getTypePriority(value: any): number {
  switch (typeof value) {
    case 'string':
      return 1;
    case 'number':
      return 2;
    case 'boolean':
      return 3;
    case 'object':
      return 4;
    case 'undefined':
      return 5;
    default:
      return 6;
  }
}

export {
  reorderArray,
  type SingleReorderConfig,
  type ReorderConfig,
  type OrderDirection,
};
