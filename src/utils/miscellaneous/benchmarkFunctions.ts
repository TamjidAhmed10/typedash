/**
 * Represents the result of a benchmark operation
 */
interface BenchmarkResult<T> {
  /** Average execution time in milliseconds */
  averageTime: number;
  /** Total execution time in milliseconds */
  totalTime: number;
  /** Number of iterations performed */
  iterations: number;
  /** Fastest execution time in milliseconds */
  fastestTime: number;
  /** Slowest execution time in milliseconds */
  slowestTime: number;
  /** Return value from the last execution */
  lastResult: T;
  /** Memory usage in MB (if available) */
  memoryUsageMB?: number;
}

/**
 * Benchmarks a function's performance by running it multiple times with the provided data
 * @template F - Type of the function to benchmark
 * @template D - Type of the data to pass to the function
 * @param {F} fn - The function to benchmark
 * @param {D} data - The data to pass to the function
 * @param {number} iterations - Number of times to execute the function (default: 1000)
 * @returns {Promise<BenchmarkResult<ReturnType<F>>>} Benchmark results including timing statistics
 * @throws {Error} If invalid parameters are provided
 *
 * @example
 * ```typescript
 * const sortArray = (arr: number[]) => [...arr].sort();
 * const result = await benchmark(sortArray, [3, 1, 4, 1, 5], 1000);
 * console.log(result.averageTime); // Average execution time in ms
 * ```
 */
export async function benchmarkFunction<
  F extends (data: D) => any,
  D = Parameters<F>[0]
>(
  fn: F,
  data: D,
  iterations: number = 1000
): Promise<BenchmarkResult<ReturnType<F>>> {
  // Input validation
  if (typeof fn !== 'function') {
    throw new Error('First argument must be a function');
  }
  if (iterations < 1 || !Number.isInteger(iterations)) {
    throw new Error('Iterations must be a positive integer');
  }

  // Test if the function returns a Promise
  const testResult = fn(data);
  if (testResult instanceof Promise) {
    throw new TypeError(
      'Function must not return a Promise. Use benchmarkAsyncFunction instead'
    );
  }

  const times: number[] = [];
  // Use the test result as our warm-up run
  let lastResult: ReturnType<F> = testResult;
  const initialMemory = process.memoryUsage?.()?.heapUsed;

  // Run the benchmark
  for (let i = 0; i < iterations - 1; i++) {
    // Subtract 1 since we already ran once
    const start = performance.now();
    lastResult = fn(data);
    const end = performance.now();
    times.push(end - start);
  }

  // Add the initial run's time
  times.push(0); // placeholder for first run since we couldn't measure it

  const totalTime = times.reduce((acc, time) => acc + time, 0);
  const finalMemory = process.memoryUsage?.()?.heapUsed;

  return {
    averageTime: totalTime / iterations,
    totalTime,
    iterations,
    fastestTime: Math.min(...times),
    slowestTime: Math.max(...times),
    lastResult,
    memoryUsageMB:
      initialMemory && finalMemory
        ? (finalMemory - initialMemory) / (1024 * 1024)
        : undefined,
  };
}

/**
 * Async version of the benchmark function for benchmarking async functions
 * @template F - Type of the async function to benchmark
 * @template D - Type of the data to pass to the function
 * @param {F} fn - The async function to benchmark
 * @param {D} data - The data to pass to the function
 * @param {number} iterations - Number of times to execute the function (default: 1000)
 * @returns {Promise<BenchmarkResult<Awaited<ReturnType<F>>>>} Benchmark results including timing statistics
 *
 * @example
 * ```typescript
 * const asyncOperation = async (data: string) => fetch(data);
 * const result = await benchmarkAsync(asyncOperation, 'https://api.example.com', 100);
 * console.log(result.averageTime); // Average execution time in ms
 * ```
 */
export async function benchmarkAsyncFunction<
  F extends (data: D) => Promise<any>,
  D = Parameters<F>[0]
>(
  fn: F,
  data: D,
  iterations: number = 1000
): Promise<BenchmarkResult<Awaited<ReturnType<F>>>> {
  if (typeof fn !== 'function') {
    throw new Error('First argument must be a function');
  }
  if (iterations < 1 || !Number.isInteger(iterations)) {
    throw new Error('Iterations must be a positive integer');
  }

  // Test if the function returns a Promise
  const testResult = fn(data);
  if (!(testResult instanceof Promise)) {
    throw new TypeError('Function must return a Promise');
  }

  const times: number[] = [];
  // Use the test result as our warm-up run
  let lastResult: Awaited<ReturnType<F>> = await testResult;
  const initialMemory = process.memoryUsage?.()?.heapUsed;

  // Run the benchmark
  for (let i = 0; i < iterations - 1; i++) {
    // Subtract 1 since we already ran once
    const start = performance.now();
    lastResult = await fn(data);
    const end = performance.now();
    times.push(end - start);
  }

  // Add the initial run's time
  times.push(0); // placeholder for first run since we couldn't measure it

  const totalTime = times.reduce((acc, time) => acc + time, 0);
  const finalMemory = process.memoryUsage?.()?.heapUsed;

  return {
    averageTime: totalTime / iterations,
    totalTime,
    iterations,
    fastestTime: Math.min(...times),
    slowestTime: Math.max(...times),
    lastResult,
    memoryUsageMB:
      initialMemory && finalMemory
        ? (finalMemory - initialMemory) / (1024 * 1024)
        : undefined,
  };
}
