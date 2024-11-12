/**
 * Checks if value is a string
 * @param value - The value to check
 */
const isString = (value: unknown): value is string => {
  return typeof value === 'string';
};

export default isString;
