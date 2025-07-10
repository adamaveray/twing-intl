export function mapValues<T, TKey extends keyof T>(
  values: Iterable<T>,
  keyProperty: TKey,
): Record<T[TKey] extends string | number | symbol ? T[TKey] : never, T> {
  type KeyValue = T[TKey] extends string | number | symbol ? T[TKey] : never;
  const mapped = {} as Record<KeyValue, T>;
  for (const value of values) {
    mapped[value[keyProperty] as KeyValue] = value;
  }
  return mapped;
}
