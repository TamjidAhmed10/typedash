import { reorderArray } from '../array/reorderArray';

describe('reorderArray', () => {
  type Item = { id: number; name: string; position: any };

  const items: Item[] = [
    { id: 1, name: 'Item A', position: 'middle' },
    { id: 2, name: 'Item B', position: 'top' },
    { id: 3, name: 'Item C', position: 'bottom' },
    { id: 4, name: 'Item D', position: 'low' },
    { id: 5, name: 'Item E', position: 'high' },
  ];

  test('should reorder based on custom order array, ascending by default', () => {
    const result = reorderArray(items, [
      {
        key: 'position',
        customOrder: ['top', 'middle'],
      },
    ]);
    expect(result.map((item) => item.position)).toEqual([
      'top',
      'middle',
      'bottom',
      'high',
      'low',
    ]);
  });

  test('should reorder based on custom order array and place at end', () => {
    const result = reorderArray(items, [
      {
        key: 'position',
        customOrder: ['top', 'middle'],
        direction: 'end',
        ascending: true,
      },
    ]);
    expect(result.map((item) => item.position)).toEqual([
      'bottom',
      'high',
      'low',
      'top',
      'middle',
    ]);
  });

  test('should reorder in ascending order for unspecified items', () => {
    const itemsWithNumbers = [
      { id: 1, name: 'Item A', position: 50 },
      { id: 2, name: 'Item B', position: 10 },
      { id: 3, name: 'Item C', position: 30 },
      { id: 4, name: 'Item D', position: 20 },
      { id: 5, name: 'Item E', position: 40 },
    ];
    const result = reorderArray(itemsWithNumbers, [
      {
        key: 'position',
        ascending: true,
      },
    ]);
    expect(result.map((item) => item.position)).toEqual([10, 20, 30, 40, 50]);
  });

  test('should reorder in descending order for unspecified items', () => {
    const itemsWithNumbers = [
      { id: 1, name: 'Item A', position: 50 },
      { id: 2, name: 'Item B', position: 10 },
      { id: 3, name: 'Item C', position: 30 },
      { id: 4, name: 'Item D', position: 20 },
      { id: 5, name: 'Item E', position: 40 },
    ];
    const result = reorderArray(itemsWithNumbers, [
      {
        key: 'position',
        ascending: false,
      },
    ]);
    expect(result.map((item) => item.position)).toEqual([50, 40, 30, 20, 10]);
  });

  test('should bring custom ordered items to the start by default', () => {
    const result = reorderArray(items, [
      {
        key: 'position',
        customOrder: ['bottom'],
      },
    ]);
    expect(result.map((item) => item.position)).toEqual([
      'bottom',
      'high',
      'low',
      'middle',
      'top',
    ]);
  });

  test('should handle boolean values in ascending order', () => {
    const itemsWithBooleans = [
      { id: 1, name: 'Item A', active: true },
      { id: 2, name: 'Item B', active: false },
      { id: 3, name: 'Item C', active: true },
    ];
    const result = reorderArray(itemsWithBooleans, [
      {
        key: 'active',
        ascending: true,
      },
    ]);
    expect(result.map((item) => item.active)).toEqual([false, true, true]);
  });

  test('should handle boolean values in descending order', () => {
    const itemsWithBooleans = [
      { id: 1, name: 'Item A', active: true },
      { id: 2, name: 'Item B', active: false },
      { id: 3, name: 'Item C', active: true },
    ];
    const result = reorderArray(itemsWithBooleans, [
      {
        key: 'active',
        ascending: false,
      },
    ]);
    expect(result.map((item) => item.active)).toEqual([true, true, false]);
  });

  test('should handle multiple sort keys', () => {
    const complexItems = [
      { id: 1, priority: 'high', value: 10 },
      { id: 2, priority: 'low', value: 20 },
      { id: 3, priority: 'high', value: 30 },
      { id: 4, priority: 'medium', value: 40 },
    ];
    const result = reorderArray(complexItems, [
      {
        key: 'priority',
        customOrder: ['high', 'medium', 'low'],
      },
      {
        key: 'value',
        ascending: false,
      },
    ]);
    expect(
      result.map((item) => ({ priority: item.priority, value: item.value }))
    ).toEqual([
      { priority: 'high', value: 30 },
      { priority: 'high', value: 10 },
      { priority: 'medium', value: 40 },
      { priority: 'low', value: 20 },
    ]);
  });

  test('should handle mixed types with custom ordering', () => {
    const mixedItems = [
      { id: 1, type: 'apple' },
      { id: 2, type: 100 },
      { id: 3, type: 'banana' },
      { id: 4, type: true },
      { id: 5, type: 'orange' },
    ];
    const result = reorderArray(mixedItems, [
      {
        key: 'type',
        customOrder: ['banana', 100],
      },
    ]);
    expect(result.map((item) => item.type)).toEqual([
      'banana',
      100,
      'apple',
      'orange',
      true,
    ]);
  });

  test('should handle dates in ascending order', () => {
    const itemsWithDates = [
      { id: 1, date: new Date('2024-03-15') },
      { id: 2, date: new Date('2024-01-01') },
      { id: 3, date: new Date('2024-02-20') },
    ];
    const result = reorderArray(itemsWithDates, [
      {
        key: 'date',
        ascending: true,
      },
    ]);
    expect(result.map((item) => item.date)).toEqual([
      new Date('2024-01-01'),
      new Date('2024-02-20'),
      new Date('2024-03-15'),
    ]);
  });

  test('should handle dates in descending order', () => {
    const itemsWithDates = [
      { id: 1, date: new Date('2024-03-15') },
      { id: 2, date: new Date('2024-01-01') },
      { id: 3, date: new Date('2024-02-20') },
    ];
    const result = reorderArray(itemsWithDates, [
      {
        key: 'date',
        ascending: false,
      },
    ]);
    expect(result.map((item) => item.date)).toEqual([
      new Date('2024-03-15'),
      new Date('2024-02-20'),
      new Date('2024-01-01'),
    ]);
  });

  test('should handle nested properties', () => {
    const nestedItems = [
      { id: 1, user: { name: 'John', score: 100 } },
      { id: 2, user: { name: 'Alice', score: 85 } },
      { id: 3, user: { name: 'Bob', score: 92 } },
    ];
    const result = reorderArray(nestedItems, [
      {
        key: 'user.score',
        ascending: true,
      },
    ]);
    expect(result.map((item) => item.user.score)).toEqual([85, 92, 100]);
  });

  test('should handle deeply nested properties with custom order', () => {
    const deeplyNested = [
      { id: 1, meta: { user: { role: 'admin' } } },
      { id: 2, meta: { user: { role: 'user' } } },
      { id: 3, meta: { user: { role: 'moderator' } } },
    ];
    const result = reorderArray(deeplyNested, [
      {
        key: 'meta.user.role',
        customOrder: ['admin', 'moderator'],
      },
    ]);
    expect(result.map((item) => item.meta.user.role)).toEqual([
      'admin',
      'moderator',
      'user',
    ]);
  });

  test('should handle null and undefined values', () => {
    const itemsWithNull = [
      { id: 1, value: null },
      { id: 2, value: 'test' },
      { id: 3, value: undefined },
      { id: 4, value: 'abc' },
    ];
    const result = reorderArray(itemsWithNull, [
      {
        key: 'value',
        ascending: true,
      },
    ]);
    expect(result.map((item) => item.value)).toEqual([
      'abc',
      'test',
      null,
      undefined,
    ]);
  });

  test('should handle missing nested properties', () => {
    const itemsWithMissingProps = [
      { id: 1, user: { name: 'John' } },
      { id: 2, user: {} },
      { id: 3, user: { name: 'Alice' } },
    ];
    const result = reorderArray(itemsWithMissingProps, [
      {
        key: 'user.name',
        ascending: true,
      },
    ]);
    expect(result.map((item) => item.user.name)).toEqual([
      'Alice',
      'John',
      undefined,
    ]);
  });

  test('should handle array values', () => {
    const itemsWithArrays = [
      { id: 1, tags: ['b', 'c'] },
      { id: 2, tags: ['a'] },
      { id: 3, tags: ['b', 'a'] },
    ];
    const result = reorderArray(itemsWithArrays, [
      {
        key: 'tags',
        ascending: true,
      },
    ]);
    expect(result.map((item) => item.tags)).toEqual([
      ['a'],
      ['b', 'a'],
      ['b', 'c'],
    ]);
  });

  test('should handle multiple nested sort keys', () => {
    const complexNestedItems = [
      { id: 1, user: { role: 'admin', stats: { score: 85 } } },
      { id: 2, user: { role: 'admin', stats: { score: 92 } } },
      { id: 3, user: { role: 'user', stats: { score: 78 } } },
    ];
    const result = reorderArray(complexNestedItems, [
      {
        key: 'user.role',
        customOrder: ['admin'],
      },
      {
        key: 'user.stats.score',
        ascending: false,
      },
    ]);
    expect(
      result.map((item) => ({
        role: item.user.role,
        score: item.user.stats.score,
      }))
    ).toEqual([
      { role: 'admin', score: 92 },
      { role: 'admin', score: 85 },
      { role: 'user', score: 78 },
    ]);
  });
});
