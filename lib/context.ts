import type { IntlShape } from '@formatjs/intl';
import type { TwingExecutionContext } from 'twing';

/**
 * Retrieves a Twing function from the provided context's environment.
 */
function getContextFunction<T extends (executionContext: TwingExecutionContext, ...args: any[]) => Promise<unknown>>(
  executionContext: TwingExecutionContext,
  name: string,
): T | undefined {
  return executionContext.environment.functions.get(name)?.callable as T | undefined;
}

/**
 * Invokes the `intl` function set on the provided execution context's environment.
 */
export async function getIntl<T = any>(
  executionContext: TwingExecutionContext,
  locale?: string,
): Promise<IntlShape<T>> {
  type IntlFn = (executionContext: TwingExecutionContext, locale?: string) => Promise<IntlShape<T>>;
  const fn = getContextFunction<IntlFn>(executionContext, 'intl');
  if (fn == null) {
    throw new Error('Intl function not found.');
  }
  return fn(executionContext, locale);
}
