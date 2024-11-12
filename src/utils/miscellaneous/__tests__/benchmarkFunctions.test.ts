import {
  benchmarkFunction,
  benchmarkAsyncFunction,
} from '../benchmarkFunctions';

describe('Benchmark Functions', () => {
  describe('benchmark (synchronous)', () => {
    // Test basic functionality
    it('should measure execution time of a simple function', async () => {
      const simpleFunction = (x: number) => x * 2;
      const result = await benchmarkFunction(simpleFunction, 5, 100);

      expect(result).toEqual(
        expect.objectContaining({
          iterations: 100,
          lastResult: 10,
          averageTime: expect.any(Number),
          totalTime: expect.any(Number),
          fastestTime: expect.any(Number),
          slowestTime: expect.any(Number),
        })
      );
    });

    // Test array operations
    it('should handle array operations', async () => {
      const sortArray = (arr: number[]) => [...arr].sort();
      const result = await benchmarkFunction(sortArray, [3, 1, 4, 1, 5], 50);

      expect(result.lastResult).toEqual([1, 1, 3, 4, 5]);
      expect(result.iterations).toBe(50);
    });

    // Test input validation
    it('should throw error for invalid function', async () => {
      // @ts-expect-error Testing invalid input
      await expect(benchmarkFunction(null, 5, 100)).rejects.toThrow(
        'First argument must be a function'
      );
    });

    it('should throw error for invalid iterations', async () => {
      const fn = (x: number) => x * 2;
      await expect(benchmarkFunction(fn, 5, -1)).rejects.toThrow(
        'Iterations must be a positive integer'
      );
      await expect(benchmarkFunction(fn, 5, 0)).rejects.toThrow(
        'Iterations must be a positive integer'
      );
      await expect(benchmarkFunction(fn, 5, 1.5)).rejects.toThrow(
        'Iterations must be a positive integer'
      );
    });

    // Test performance metrics
    it('should return valid performance metrics', async () => {
      const heavyFunction = (size: number) => {
        const arr = Array(size)
          .fill(0)
          .map((_, i) => i);
        return arr.reverse().sort();
      };

      const result = await benchmarkFunction(heavyFunction, 1000, 10);

      expect(result.totalTime).toBeGreaterThan(0);
      expect(result.averageTime).toBeGreaterThan(0);
      expect(result.fastestTime).toBeLessThanOrEqual(result.slowestTime);
      expect(result.slowestTime).toBeGreaterThanOrEqual(result.fastestTime);
    });

    it('should throw error when given an async function', async () => {
      const asyncFn = async (x: number) => x * 2;
      await expect(benchmarkFunction(asyncFn, 5, 10)).rejects.toThrow(
        'Function must not return a Promise. Use benchmarkAsyncFunction instead'
      );
    });
  });

  describe('benchmarkAsync (asynchronous)', () => {
    // Test basic async functionality
    it('should measure execution time of a simple async function', async () => {
      const simpleAsyncFunction = async (ms: number) => {
        await new Promise((resolve) => setTimeout(resolve, ms));
        return ms * 2;
      };

      const result = await benchmarkAsyncFunction(simpleAsyncFunction, 1, 5);

      expect(result).toEqual(
        expect.objectContaining({
          iterations: 5,
          lastResult: 2,
          averageTime: expect.any(Number),
          totalTime: expect.any(Number),
          fastestTime: expect.any(Number),
          slowestTime: expect.any(Number),
        })
      );
    });

    // Test async array operations
    it('should handle async array operations', async () => {
      const asyncArrayOp = async (arr: number[]) => {
        await new Promise((resolve) => setTimeout(resolve, 1));
        return [...arr].sort();
      };

      const result = await benchmarkAsyncFunction(
        asyncArrayOp,
        [3, 1, 4, 1, 5],
        3
      );

      expect(result.lastResult).toEqual([1, 1, 3, 4, 5]);
      expect(result.iterations).toBe(3);
    });

    // Test input validation for async
    it('should throw error for invalid async function', async () => {
      // @ts-expect-error Testing invalid input
      await expect(benchmarkAsyncFunction(null, 5, 100)).rejects.toThrow(
        'First argument must be a function'
      );
    });

    it('should throw error for invalid iterations in async', async () => {
      const asyncFn = async (x: number) => x * 2;
      await expect(benchmarkAsyncFunction(asyncFn, 5, -1)).rejects.toThrow(
        'Iterations must be a positive integer'
      );
      await expect(benchmarkAsyncFunction(asyncFn, 5, 0)).rejects.toThrow(
        'Iterations must be a positive integer'
      );
      await expect(benchmarkAsyncFunction(asyncFn, 5, 1.5)).rejects.toThrow(
        'Iterations must be a positive integer'
      );
    });

    // Test memory usage
    it('should include memory usage metrics when available', async () => {
      const memoryIntensiveFunc = async (size: number) => {
        const arr = Array(size)
          .fill(0)
          .map((_, i) => i);
        await new Promise((resolve) => setTimeout(resolve, 1));
        return arr;
      };

      const result = await benchmarkAsyncFunction(
        memoryIntensiveFunc,
        10000,
        3
      );

      // Memory usage might not be available in all environments
      if (result.memoryUsageMB !== undefined) {
        expect(result.memoryUsageMB).toBeGreaterThanOrEqual(0);
      }
    });

    // Test type checking
    it('should properly handle different data types', async () => {
      const stringFunc = async (str: string) => str.toUpperCase();
      const result = await benchmarkAsyncFunction(stringFunc, 'hello', 3);

      expect(result.lastResult).toBe('HELLO');
    });

    it('should handle synchronous functions passed to async benchmark', async () => {
      const syncFn = (x: number) => x * 2;
      const forcedAsync = syncFn as unknown as (
        data: number
      ) => Promise<number>;
      await expect(benchmarkAsyncFunction(forcedAsync, 5, 10)).rejects.toThrow(
        TypeError
      );
    });

    it('should work with sync functions explicitly wrapped in Promise', async () => {
      const syncFn = (x: number) => x * 2;
      const wrappedAsync = async (x: number) => syncFn(x);

      const result = await benchmarkAsyncFunction(wrappedAsync, 5, 10);

      expect(result).toEqual(
        expect.objectContaining({
          iterations: 10,
          lastResult: 10,
          averageTime: expect.any(Number),
          totalTime: expect.any(Number),
          fastestTime: expect.any(Number),
          slowestTime: expect.any(Number),
        })
      );
    });
  });
});
