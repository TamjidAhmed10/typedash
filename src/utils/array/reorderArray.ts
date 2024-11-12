/** Specifies where custom-ordered items should appear in the sorted array */
type OrderDirection = 'start' | 'end';

/** Configuration for sorting by a single key */
interface SingleReorderConfig<T, K extends keyof T> {
  /** The object key to sort by */
  key: K;
  /** Optional array defining custom ordering */
  customOrder?: T[K][];
  /** Where to place custom ordered items */
  direction?: OrderDirection;
  /** Sort direction for non-custom items */
  ascending?: boolean;
}

/** Array of sort configurations for multiple keys */
type ReorderConfig<T> = SingleReorderConfig<T, keyof T>[];

/**
 * Helper function to get type priority for consistent ordering
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

/**
 * Helper function to compare mixed types consistently
 */
function compareValues(a: any, b: any): number {
  // If types are different, order by type priority
  if (typeof a !== typeof b) {
    return getTypePriority(a) - getTypePriority(b);
  }

  // Same type - use standard comparison
  return a < b ? -1 : 1;
}

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

      const aValue = a[key];
      const bValue = b[key];

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

export {
  reorderArray,
  type ReorderConfig,
  type SingleReorderConfig,
  type OrderDirection,
};
