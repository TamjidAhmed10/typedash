/**
 * Checks if value is a number
 * @param value - The value to check
 */
const isNumber = (value: unknown): value is number => {
  return typeof value === 'number' && !isNaN(value);
};

export default isNumber;
