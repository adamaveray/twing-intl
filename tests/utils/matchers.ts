import type { CustomMatcher, Mock } from 'bun:test';
import { expect } from 'bun:test';

type MatcherContext = ThisParameterType<CustomMatcher<any, any>>;

expect.extend({
  toHaveReturnedValue(this: MatcherContext, mock, expected) {
    if (typeof mock !== 'function') {
      return { pass: false, message: 'Invalid mock type.' };
    }

    const [result] = (mock as Mock<any>).mock.results;
    if (result == null) {
      return { pass: false, message: 'Mock has not been called.' };
    }
    if (result.type !== 'return') {
      return { pass: false, message: 'Mock did not return.' };
    }

    return {
      pass: this.equals(expected, result.value),
      message: () =>
        `Expected: ${this.utils.printExpected(expected)}\nReceived: ${this.utils.printReceived(result.value)}`,
    };
  },
});
