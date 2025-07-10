import type { IntlShape } from '@formatjs/intl';
import type { TwingExecutionContext, TwingFilter } from 'twing';
import { createFilter } from 'twing';

import { getIntl } from '#/context.ts';
import { normaliseTwingArguments } from '#/utils/executing.ts';

type MessageFullReturnType<T> = string | T | (string | T)[];
type UnsafeFormatMessage<T> = (...args: unknown[]) => MessageFullReturnType<T>; // Overloaded method so cannot safely type rest arguments

async function messageFilter<T>(
  executionContext: TwingExecutionContext,
  ...args: Parameters<IntlShape['formatMessage']>
): Promise<MessageFullReturnType<T>> {
  const intl = await getIntl<T>(executionContext);
  return (intl.formatMessage as UnsafeFormatMessage<T>)(...normaliseTwingArguments(args));
}

export default function createMessageFilter(name: string): TwingFilter {
  return createFilter(name, messageFilter, [
    { name: 'values', defaultValue: new Map() },
    { name: 'options', defaultValue: new Map() },
  ]);
}
