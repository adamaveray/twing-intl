declare module 'bun:test' {
  import type { MatcherContext, MatcherResult } from 'bun:test';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Used in actual interface.
  export interface Matchers<T> {
    toHaveReturnedValue(this: MatcherContext, expected: unknown): MatcherResult;
  }
}
