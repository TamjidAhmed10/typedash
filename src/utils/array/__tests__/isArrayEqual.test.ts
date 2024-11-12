import isArrayEqual from '../isArrayEqual';

describe('isArrayEqual', () => {
  // Simple cases
  test('handles simple arrays of objects', () => {
    expect(isArrayEqual([{ a: 1 }, { b: 2 }], [{ a: 1 }, { b: 2 }])).toBe(true);

    expect(isArrayEqual([{ a: 1 }, { b: 2 }], [{ a: 1 }, { b: 3 }])).toBe(
      false
    );
  });

  // Deeply nested cases
  test('handles deeply nested objects', () => {
    const arr1 = [
      {
        user: {
          profile: {
            name: {
              first: 'John',
              last: 'Doe',
            },
            address: {
              city: {
                name: 'New York',
                zip: '10001',
              },
            },
          },
          settings: {
            theme: {
              colors: {
                primary: '#000',
                secondary: '#fff',
              },
            },
          },
        },
      },
    ];

    const arr2 = [
      {
        user: {
          profile: {
            name: {
              first: 'John',
              last: 'Doe',
            },
            address: {
              city: {
                name: 'New York',
                zip: '10001',
              },
            },
          },
          settings: {
            theme: {
              colors: {
                primary: '#000',
                secondary: '#fff',
              },
            },
          },
        },
      },
    ];

    expect(isArrayEqual(arr1, arr2)).toBe(true);

    // Modify deep nested value
    const arr3 = JSON.parse(JSON.stringify(arr2));
    arr3[0].user.profile.address.city.zip = '10002';
    expect(isArrayEqual(arr1, arr3)).toBe(false);
  });

  // Arrays with nested arrays
  test('handles nested arrays', () => {
    const arr1 = [
      {
        data: [
          { id: 1, items: [{ x: 1 }, { y: 2 }] },
          { id: 2, items: [{ z: 3 }] },
        ],
      },
    ];

    const arr2 = [
      {
        data: [
          { id: 1, items: [{ x: 1 }, { y: 2 }] },
          { id: 2, items: [{ z: 3 }] },
        ],
      },
    ];

    expect(isArrayEqual(arr1, arr2)).toBe(true);

    const arr3 = JSON.parse(JSON.stringify(arr2));
    arr3[0].data[0].items[1].y = 3;
    expect(isArrayEqual(arr1, arr3)).toBe(false);
  });

  // Option: ignoreOrder
  test('respects ignoreOrder option', () => {
    expect(
      isArrayEqual([{ id: 1 }, { id: 2 }], [{ id: 2 }, { id: 1 }], {
        ignoreOrder: true,
      })
    ).toBe(true);

    expect(
      isArrayEqual([{ id: 1 }, { id: 2 }], [{ id: 2 }, { id: 1 }], {
        ignoreOrder: false,
      })
    ).toBe(false);
  });

  // Option: strict
  test('respects strict option', () => {
    expect(
      isArrayEqual([{ value: 1 }], [{ value: '1' }], { strict: true })
    ).toBe(false);

    expect(
      isArrayEqual([{ value: 1 }], [{ value: '1' }], { strict: false })
    ).toBe(true);
  });

  // Option: ignoreKeys
  test('respects ignoreKeys option', () => {
    expect(
      isArrayEqual([{ id: 1, timestamp: 123 }], [{ id: 1, timestamp: 456 }], {
        ignoreKeys: ['timestamp'],
      })
    ).toBe(true);

    expect(
      isArrayEqual(
        [{ user: { id: 1, lastLogin: 123 } }],
        [{ user: { id: 1, lastLogin: 456 } }],
        { ignoreKeys: ['user.lastLogin'] }
      )
    ).toBe(true);
  });

  // Edge cases
  test('handles edge cases', () => {
    // Null/undefined
    expect(isArrayEqual(null, null)).toBe(true);
    expect(isArrayEqual(undefined, undefined)).toBe(true);
    expect(isArrayEqual([], null)).toBe(false);

    // Empty arrays
    expect(isArrayEqual([], [])).toBe(true);

    // Mixed types
    expect(
      isArrayEqual(
        [{ a: 1, b: null, c: undefined, d: '' }],
        [{ a: 1, b: null, c: undefined, d: '' }]
      )
    ).toBe(true);
  });
});
